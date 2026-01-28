# Firebase Extensions - Quick Fix Guide

## Current Status

```
❌ firestore-send-email ........... ERRORED
✅ storage-resize-images .......... ACTIVE
❌ delete-user-data ............... NOT INSTALLED
```

## The Problem

The email extension failed during installation because:
1. The Firestore database is in region **asia-east2**
2. But the Cloud Functions tried to deploy in **us-central1**
3. These regions don't match, so the extension errored

## The Solution (3 Simple Steps)

### STEP 1: Delete from Firebase Console (5 minutes)

**Open this URL:**
```
https://console.firebase.google.com/project/YOUR_FIREBASE_PROJECT_ID/extensions
```

**Then:**
1. Find "Trigger Email from Firestore" (shows ERRORED state)
2. Click it to open
3. Look for the **3-dot menu (⋮)** in the top right
4. Click **"Delete extension"**
5. Confirm deletion
6. Wait 3-5 minutes for it to fully delete

**You'll know it's done when the extension disappears from the list.**

---

### STEP 2: Reinstall with Correct Region (5 minutes)

**Open a terminal and run:**

```bash
firebase ext:install firebase/firestore-send-email --project=YOUR_FIREBASE_PROJECT_ID
```

**When you see these prompts, answer exactly as shown:**

```
✔ Firestore Instance ID:
  → Press Enter (keeps default)

✔ Firestore Instance Location:
  → Select: asia-east2  ⚠️ THIS IS CRITICAL!

✔ Which authentication type...
  → Select: Username & Password

✔ Enter a value for SMTP connection URI:
  → Press Enter (leave blank - configure later)

✔ Enter a value for Email documents collection:
  → Type: mail
  → Press Enter

✔ Enter a value for Default FROM address:
  → Type: noreply@onchainweb.app
  → Press Enter

✔ Enter a value for Default REPLY-TO address:
  → Press Enter (leave blank)

✔ Enter a value for Users collection:
  → Type: users
  → Press Enter

✔ Enter a value for Templates collection:
  → Press Enter (leave blank)

✔ Do you want to proceed with installation?
  → Type: y
  → Press Enter
```

---

### STEP 3: Verify Success (1 minute)

**Run this command:**

```bash
firebase ext:list --project=YOUR_FIREBASE_PROJECT_ID
```

**Expected output:**
```
✅ firestore-send-email ........... ACTIVE
✅ storage-resize-images .......... ACTIVE
```

If both show "ACTIVE", you're done with this step! 🎉

---

## Next Steps (After Email Extension is ACTIVE)

Once the email extension is working, run these commands:

### Install Delete User Data Extension

```bash
firebase ext:install firebase/delete-user-data --project=YOUR_FIREBASE_PROJECT_ID
```

**Answers:**
```
Location: asia-east2
Firestore paths: users/{UID},userProfiles/{UID},userActivity/{UID},trades/{UID}
Delete mode: recursive
Others: Press Enter
```

### Deploy Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions --project=YOUR_FIREBASE_PROJECT_ID
```

---

## Summary

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1 | Delete ERRORED extension from Console | 5 min | Manual ⚠️ |
| 2 | Reinstall with correct region | 5 min | CLI command |
| 3 | Verify it works | 1 min | CLI command |
| 4 | Install Delete User Data | 5 min | CLI command |
| 5 | Deploy Cloud Functions | 5 min | CLI command |
| | **TOTAL** | **~20 min** | |

---

## Troubleshooting

### If SMTP errors appear during installation:
→ Just press Enter to skip SMTP (leave blank)
→ You can configure it later

### If you get "Database doesn't exist" error:
→ You chose the wrong location
→ Delete and try again, selecting **asia-east2**

### If installation hangs:
→ Press Ctrl+C
→ Wait a few minutes
→ Try again

---

## Configuration Notes

**Email Extension will:**
- Watch for documents in the `mail` collection
- Send emails when you create documents like:
  ```javascript
  {
    to: "user@example.com",
    message: {
      subject: "Hello",
      text: "This is a test email"
    }
  }
  ```

**Delete User Data will:**
- Automatically delete user data when they're removed from Firebase Authentication
- Cleans: users, userProfiles, userActivity, trades collections
- Required for GDPR compliance

**Cloud Functions will:**
- `bulkDeleteDocuments`: Admin-only bulk delete tool
- `scheduledDataCleanup`: Auto-cleanup old data daily
- `cleanupUserData`: Auto-cleanup when user deleted

---

**Ready? Start with Step 1 above!**

After you delete the extension, run the command in Step 2 and let me know when it shows ACTIVE.
