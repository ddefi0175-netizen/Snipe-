# Firebase Extension Region Fix Guide

## Problem

The Firestore Send Email extension failed with this error:

```
Database '(default)' does not exist in region 'us-central1'.
Did you mean region 'asia-east2'?
```

**Root Cause**: Firestore database is in `asia-east2`, but the extension tried to deploy Cloud Functions to `us-central1`.

## Solution

We need to delete the errored extension from Firebase Console and reinstall with the correct region.

---

## Step 1: Delete Extension from Firebase Console (REQUIRED)

Since `firebase ext:uninstall` doesn't work (extension not in firebase.json), we must use Firebase Console:

1. **Go to Firebase Console**
   - URL: https://console.firebase.google.com/project/YOUR_FIREBASE_PROJECT_ID/extensions

2. **Find "Trigger Email from Firestore"**
   - Look for extension with ERRORED state
   - Click on it

3. **Delete Extension**
   - Click the 3-dot menu (⋮) in top right
   - Click "Delete extension"
   - Confirm deletion

4. **Wait 2-3 minutes** for deletion to complete

---

## Step 2: Reinstall with Correct Region

After deletion completes, run this command:

```bash
firebase ext:install firebase/firestore-send-email --project=YOUR_FIREBASE_PROJECT_ID
```

When prompted, **answer as follows**:

### Installation Prompts:

**1. Cloud Functions deployment location?**
```
✅ SELECT: asia-east2
```
⚠️ **CRITICAL**: Must match your Firestore region!

**2. SMTP connection URI?**
```
OPTION A (Gmail - Free):
smtps://your-email@gmail.com:your-app-password@smtp.gmail.com:465

OPTION B (SendGrid - Recommended):
smtps://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:465

OPTION C (Skip for now):
Press Enter to skip (you can configure later)
```

**3. Email documents collection?**
```
✅ ENTER: mail
```

**4. Default FROM address?**
```
✅ ENTER: noreply@onchainweb.app
```
(Or your actual email)

**5. Default REPLY-TO address?**
```
✅ ENTER: support@onchainweb.app
```
(Or leave blank)

**6. Users collection?**
```
✅ ENTER: users
```

**7. Templates collection?**
```
✅ Press Enter (optional)
```

**8. Do you wish to continue?**
```
✅ Yes
```

---

## Step 3: Verify Installation

```bash
firebase ext:list --project=YOUR_FIREBASE_PROJECT_ID
```

Expected output:
```
firestore-send-email  | ACTIVE | asia-east2
```

---

## Quick Email Configuration Options

### Option A: Gmail (Fastest Setup - 2 minutes)

1. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Create password for "Firebase Extensions"
   - Copy the 16-character password

2. **Build SMTP URI**
   ```
   smtps://your-email@gmail.com:xxxx-xxxx-xxxx-xxxx@smtp.gmail.com:465
   ```
   Replace `xxxx-xxxx-xxxx-xxxx` with your App Password (remove spaces)

3. **Example**
   ```
   smtps://john@gmail.com:abcd-efgh-ijkl-mnop@smtp.gmail.com:465
   ```

### Option B: SendGrid (Production - 5 minutes)

1. **Create Account**
   - Go to: https://sendgrid.com
   - Sign up for free account
   - Verify your email

2. **Create API Key**
   - Navigate to Settings > API Keys
   - Click "Create API Key"
   - Name: "Firebase Extensions"
   - Permissions: Full Access
   - Copy the API key (starts with `SG.`)

3. **Build SMTP URI**
   ```
   smtps://apikey:SG.your-api-key-here@smtp.sendgrid.net:465
   ```

4. **Example**
   ```
   smtps://apikey:SG.abc123xyz789@smtp.sendgrid.net:465
   ```

### Option C: Skip Configuration (Can configure later)

Just press Enter when asked for SMTP URI. You can add it later via:

```bash
firebase ext:configure firestore-send-email --project=YOUR_FIREBASE_PROJECT_ID
```

---

## After Installation: Testing

### 1. Send Test Email

Create a document in Firestore:

**Collection**: `mail`
**Document**: Auto-generate ID
**Fields**:
```javascript
{
  to: "your-email@example.com",
  message: {
    subject: "Test Email from Firebase",
    text: "This is a test email.",
    html: "<p>This is a <strong>test</strong> email.</p>"
  }
}
```

### 2. Check Email Status

After 10-30 seconds, the document should update:

```javascript
{
  // Original fields...
  delivery: {
    state: "SUCCESS",
    attempts: 1,
    endTime: "2026-01-20T..."
  }
}
```

**Success**: Email sent ✅
**Error**: Check `delivery.error` field

---

## Troubleshooting

### Extension Still ERRORED After Reinstall?

1. **Check region**:
   ```bash
   gcloud firestore databases list --project=YOUR_FIREBASE_PROJECT_ID
   ```
   Confirm database is in `asia-east2`

2. **Delete and retry**:
   - Delete extension from Console
   - Wait 5 minutes
   - Reinstall with correct region

### SMTP Authentication Failed?

**Gmail**:
- Enable 2FA on Google account
- Generate new App Password
- Remove spaces from password in URI

**SendGrid**:
- Verify API key is correct
- Check API key has "Full Access" permissions
- Verify sender email is verified in SendGrid

### Email Not Sending?

1. **Check Firestore document**:
   - Document must be in `mail` collection
   - Must have `to` field with valid email
   - Must have `message.subject` and `message.text` or `message.html`

2. **Check extension logs**:
   ```bash
   firebase functions:log --project=YOUR_FIREBASE_PROJECT_ID
   ```

---

## Summary

✅ **Delete extension from Firebase Console** (not CLI)
✅ **Reinstall with region: `asia-east2`**
✅ **Configure SMTP** (Gmail or SendGrid)
✅ **Test** with sample document in `mail` collection

---

**Next Steps After This is Working:**

1. Install Delete User Data extension (GDPR compliance)
2. Create custom bulk delete Cloud Function
3. Set up email templates for:
   - Withdrawal confirmations
   - KYC notifications
   - Trading alerts

---

**Last Updated**: January 20, 2026
**Status**: Ready to fix
**Action Required**: Delete extension from Firebase Console first
