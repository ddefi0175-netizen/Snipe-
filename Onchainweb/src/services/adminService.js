
import { doc, updateDoc, runTransaction, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where, limit, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseAvailable, auth } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { formatApiError } from '../lib/errorHandling';


/**
 * Updates the KYC status for a given user.
 * @param {string} userId - The ID of the user to update.
 * @param {string} kycStatus - The new KYC status ('verified', 'rejected').
 */
export const updateUserKYC = async (userId, kycStatus) => {
    if (!isFirebaseAvailable) {
        // Fallback for localStorage
        try {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (users[userId]) {
                users[userId].kycStatus = kycStatus;
                localStorage.setItem('users', JSON.stringify(users));
            }
        } catch (error) {
            console.error("Error updating KYC in localStorage:", error);
        }
        return;
    }
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { kycStatus });
    } catch (error) {
        console.error(`Error updating KYC for user ${userId}:`, error);
        throw new Error(formatApiError(error));
    }
};

/**
 * Processes a deposit by approving or rejecting it.
 * @param {string} depositId - The ID of the deposit.
 * @param {string} userId - The ID of the user who made the deposit.
 * @param {'approved' | 'rejected'} newStatus - The new status of the deposit.
 * @param {number} [amount=0] - The amount of the deposit (only required for approval).
 */
export const processDeposit = async (depositId, userId, newStatus, amount = 0) => {
    if (!isFirebaseAvailable) {
        // Fallback for localStorage
        try {
            const deposits = JSON.parse(localStorage.getItem('deposits') || '[]');
            const depositIndex = deposits.findIndex(d => d.id === depositId);
            if (depositIndex > -1) {
                deposits[depositIndex].status = newStatus;
                localStorage.setItem('deposits', JSON.stringify(deposits));

                if (newStatus === 'approved') {
                    const users = JSON.parse(localStorage.getItem('users') || '{}');
                    if (users[userId]) {
                        users[userId].balance = (users[userId].balance || 0) + parseFloat(amount);
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                }
            }
        } catch (error) {
            console.error("Error processing deposit in localStorage:", error);
        }
        return;
    }

    try {
        const depositRef = doc(db, 'deposits', depositId);
        const userRef = doc(db, 'users', userId);

        if (newStatus === 'approved') {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    throw new Error("User document not found!");
                }
                const currentBalance = userDoc.data().balance || 0;
                const newBalance = currentBalance + parseFloat(amount);

                transaction.update(userRef, { balance: newBalance });
                transaction.update(depositRef, { status: newStatus });
            });
        } else { // For 'rejected' status
            await updateDoc(depositRef, { status: newStatus });
        }
    } catch (error) {
        console.error(`Error processing deposit ${depositId}:`, error);
        throw new Error(formatApiError(error));
    }
};

export const getAdminByEmail = async (email) => {
    if (!isFirebaseAvailable) {
        try {
            const admins = JSON.parse(localStorage.getItem('admins') || '{}');
            return Object.values(admins).find(admin => admin.email === email);
        } catch (error) {
            console.error("Error getting admin by email from localStorage:", error);
            return null;
        }
    }

    try {
        const adminRef = doc(db, 'admins', email.replace(/[^a-zA-Z0-9]/g, '_'));
        const adminDoc = await getDoc(adminRef);
        return adminDoc.exists() ? adminDoc.data() : null;
    } catch (error) {
        console.error(`Error getting admin by email ${email}:`, error);
        throw new Error(formatApiError(error));
    }
};

export const initializeMasterAccount = async (email, password) => {
    if (!isFirebaseAvailable) {
        // Fallback for localStorage
        try {
            const admins = JSON.parse(localStorage.getItem('admins') || '{}');
            const adminId = email.replace(/[^a-zA-Z0-9]/g, '_');
            admins[adminId] = {
                email,
                role: 'master',
                permissions: ['all'],
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem('admins', JSON.stringify(admins));
            return { success: true, message: 'Master account created locally.' };
        } catch (error) {
            return { success: false, message: 'Failed to create master account in local storage.' };
        }
    }

    try {
        // Step 1: Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;

        // Step 2: Create admin document in Firestore
        const adminId = user.uid;
        const adminRef = doc(db, 'admins', adminId);

        await setDoc(adminRef, {
            email: user.email,
            uid: user.uid,
            role: 'master',
            permissions: ['all'], // Or a comprehensive list of all permissions
            createdAt: new Date().toISOString(),
        });

        return { success: true, message: 'Master account created successfully!' };
    } catch (error) {
        console.error("Error initializing master account:", error);
        return { success: false, message: formatApiError(error) };
    }
};

export const updateAdminLastLogin = async (adminId) => {
    if (!isFirebaseAvailable) {
        try {
            const admins = JSON.parse(localStorage.getItem('admins') || '{}');
            const admin = Object.values(admins).find(a => a.uid === adminId);
            if (admin) {
                admin.lastLogin = new Date().toISOString();
                localStorage.setItem('admins', JSON.stringify(admins));
            }
        } catch (error) {
            console.error("Error updating admin last login in localStorage:", error);
        }
        return;
    }

    try {
        const adminRef = doc(db, 'admins', adminId);
        await updateDoc(adminRef, { lastLogin: serverTimestamp() });
    } catch (error) {
        console.error(`Error updating admin last login for ${adminId}:`, error);
        throw new Error(formatApiError(error));
    }
};

export const hasMasterAccount = async () => {
    if (!isFirebaseAvailable) {
        try {
            const admins = JSON.parse(localStorage.getItem('admins') || '{}');
            return Object.values(admins).some(admin => admin.role === 'master');
        } catch (error) {
            console.error("Error checking for master account in localStorage:", error);
            return false;
        }
    }

    try {
        const q = query(collection(db, 'admins'), where('role', '==', 'master'), limit(1));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking for master account:", error);
        throw new Error(formatApiError(error));
    }
};

export const createAdminAccount = async (adminData) => {
    if (!isFirebaseAvailable) {
        try {
            const admins = JSON.parse(localStorage.getItem('admins') || '{}');
            const adminId = adminData.email.replace(/[^a-zA-Z0-9]/g, '_');
            admins[adminId] = { ...adminData, uid: adminId, createdAt: new Date().toISOString() };
            localStorage.setItem('admins', JSON.stringify(admins));
            return admins[adminId];
        } catch (error) {
            console.error("Error creating admin account in localStorage:", error);
            return null;
        }
    }

    try {
        // NOTE: This function *only* creates the Firestore record. Auth user must be created separately.
        const adminRef = doc(collection(db, 'admins'));
        await setDoc(adminRef, { ...adminData, uid: adminRef.id, createdAt: serverTimestamp() });
        return { ...adminData, uid: adminRef.id };
    } catch (error) {
        console.error("Error creating admin account:", error);
        throw new Error(formatApiError(error));
    }
};

export const subscribeToAdmins = (callback, onError) => {
    if (!isFirebaseAvailable) {
        try {
            const admins = JSON.parse(localStorage.getItem('admins') || '{}');
            callback(Object.values(admins));
        } catch (error) {
            if(onError) onError("Failed to retrieve admins from local storage.");
        }
        return () => {}; // No-op for localStorage
    }

    const q = query(collection(db, 'admins'));
    return onSnapshot(q, (snapshot) => {
        const admins = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        callback(admins);
    }, (error) => {
        console.error("Error subscribing to admins:", error);
        if(onError) onError(formatApiError(error));
    });
};

export const updateAdminAccount = async (adminId, data) => {
    if (!isFirebaseAvailable) {
        try {
            const admins = JSON.parse(localStorage.getItem('admins') || '{}');
            if (admins[adminId]) {
                admins[adminId] = { ...admins[adminId], ...data };
                localStorage.setItem('admins', JSON.stringify(admins));
            }
        } catch (error) {
            console.error("Error updating admin account in localStorage:", error);
        }
        return;
    }

    try {
        const adminRef = doc(db, 'admins', adminId);
        await updateDoc(adminRef, data);
    } catch (error) {
        console.error(`Error updating admin account ${adminId}:`, error);
        throw new Error(formatApiError(error));
    }
};

export const deleteAdminAccount = async (adminId) => {
    if (!isFirebaseAvailable) {
        try {
            const admins = JSON.parse(localStorage.getItem('admins') || '{}');
            delete admins[adminId];
            localStorage.setItem('admins', JSON.stringify(admins));
        } catch (error) {
            console.error("Error deleting admin account from localStorage:", error);
        }
        return;
    }

    try {
        // This only deletes the Firestore record. The Auth user must be deleted separately.
        const adminRef = doc(db, 'admins', adminId);
        await deleteDoc(adminRef);
    } catch (error) {
        console.error(`Error deleting admin account ${adminId}:`, error);
        throw new Error(formatApiError(error));
    }
};
