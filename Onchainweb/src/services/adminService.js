
import { doc, updateDoc, runTransaction, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where, limit, onSnapshot, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, isFirebaseAvailable, auth } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';


/**
 * Updates the KYC status for a given user.
 * @param {string} userId - The ID of the user to update.
 * @param {string} kycStatus - The new KYC status ('verified', 'rejected').
 */
export const updateUserKYC = async (userId, kycStatus) => {
    if (!isFirebaseAvailable) {
        // Fallback for localStorage
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[userId]) {
            users[userId].kycStatus = kycStatus;
            localStorage.setItem('users', JSON.stringify(users));
        }
        return;
    }
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { kycStatus });
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
        return;
    }

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
};

export const getAdminByEmail = async (email) => {
    if (!isFirebaseAvailable) {
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        return Object.values(admins).find(admin => admin.email === email);
    }

    const adminRef = doc(db, 'admins', email.replace(/[^a-zA-Z0-9]/g, '_'));
    const adminDoc = await getDoc(adminRef);

    return adminDoc.exists() ? adminDoc.data() : null;
};

export const initializeMasterAccount = async (email, password) => {
    if (!isFirebaseAvailable) {
        // Fallback for localStorage
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
        // More specific error handling
        if (error.code === 'auth/email-already-in-use') {
            return { success: false, message: 'This email is already in use.', error: error.message };
        }
        return { success: false, message: 'An unexpected error occurred.', error: error.message };
    }
};

export const updateAdminLastLogin = async (adminId) => {
    if (!isFirebaseAvailable) {
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        const admin = Object.values(admins).find(a => a.uid === adminId);
        if (admin) {
            admin.lastLogin = new Date().toISOString();
            localStorage.setItem('admins', JSON.stringify(admins));
        }
        return;
    }

    const adminRef = doc(db, 'admins', adminId);
    await updateDoc(adminRef, { lastLogin: serverTimestamp() });
};

export const hasMasterAccount = async () => {
    if (!isFirebaseAvailable) {
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        return Object.values(admins).some(admin => admin.role === 'master');
    }

    const q = query(collection(db, 'admins'), where('role', '==', 'master'), limit(1));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};

export const createAdminAccount = async (adminData) => {
    if (!isFirebaseAvailable) {
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        const adminId = adminData.email.replace(/[^a-zA-Z0-9]/g, '_');
        admins[adminId] = { ...adminData, uid: adminId, createdAt: new Date().toISOString() };
        localStorage.setItem('admins', JSON.stringify(admins));
        return admins[adminId];
    }

    // NOTE: This function *only* creates the Firestore record. Auth user must be created separately.
    const adminRef = doc(collection(db, 'admins'));
    await setDoc(adminRef, { ...adminData, uid: adminRef.id, createdAt: serverTimestamp() });
    return { ...adminData, uid: adminRef.id };
};

export const subscribeToAdmins = (callback) => {
    if (!isFirebaseAvailable) {
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        callback(Object.values(admins));
        return () => {}; // No-op for localStorage
    }

    const q = query(collection(db, 'admins'));
    return onSnapshot(q, (snapshot) => {
        const admins = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        callback(admins);
    });
};

export const updateAdminAccount = async (adminId, data) => {
    if (!isFirebaseAvailable) {
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        if (admins[adminId]) {
            admins[adminId] = { ...admins[adminId], ...data };
            localStorage.setItem('admins', JSON.stringify(admins));
        }
        return;
    }
    const adminRef = doc(db, 'admins', adminId);
    await updateDoc(adminRef, data);
};

export const deleteAdminAccount = async (adminId) => {
    if (!isFirebaseAvailable) {
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        delete admins[adminId];
        localStorage.setItem('admins', JSON.stringify(admins));
        return;
    }

    // This only deletes the Firestore record. The Auth user must be deleted separately.
    const adminRef = doc(db, 'admins', adminId);
    await deleteDoc(adminRef);
};
