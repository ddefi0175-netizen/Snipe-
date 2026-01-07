# 🗄️ Database Backup & Recovery Guide

Complete guide for backing up and restoring your Snipe MongoDB database.

---

## 📋 Overview

**Database**: MongoDB Atlas (Cloud)  
**Database Name**: `snipe`  
**Backup Methods**: 
- Automatic Cloud Backups (MongoDB Atlas)
- Manual mongodump/mongorestore
- Export collections to JSON

---

## ☁️ Automatic Cloud Backups (Recommended)

MongoDB Atlas provides automatic continuous backups for your cluster.

### Enabling Automatic Backups

1. **Log into MongoDB Atlas**:
   - Visit: https://cloud.mongodb.com
   - Select your cluster

2. **Enable Cloud Backup**:
   - Navigate to the "Backup" tab
   - Click "Turn On Cloud Backup"
   - Configure settings:
     - **Snapshot Interval**: Every 12 hours (default)
     - **Retention Policy**: 7 days (free tier)
     - **Oplog Window**: 24 hours

3. **Verify Backup Status**:
   - Check the "Snapshots" section
   - First snapshot appears within 12 hours
   - View snapshot schedule and retention

### Restoring from Cloud Backup

**Option 1: Restore to Same Cluster**
1. In MongoDB Atlas, go to "Backup" tab
2. Select the snapshot to restore
3. Click "Restore"
4. Choose "Download" or "Restore to cluster"
5. **Warning**: This will overwrite current data!

**Option 2: Restore to New Cluster (Recommended for Testing)**
1. In MongoDB Atlas, go to "Backup" tab
2. Select snapshot
3. Click "Restore" → "Create new cluster"
4. Name the new cluster (e.g., `snipe-restore-test`)
5. Wait for restore to complete (~5-10 minutes)
6. Test the restored data
7. Update your app to use the new cluster URI if needed
8. Delete test cluster when done

---

## 💻 Manual Backups with mongodump

Use `mongodump` for on-demand backups or before major changes.

### Prerequisites

Install MongoDB Database Tools:
```bash
# macOS
brew install mongodb-database-tools

# Ubuntu/Debian
sudo apt install mongodb-database-tools

# Windows
# Download from: https://www.mongodb.com/try/download/database-tools
```

### Creating a Backup

**Full Database Backup**:
```bash
# Set your connection string
MONGO_URI="mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/snipe"

# Create backup with timestamp
BACKUP_DIR="./backups/backup-$(date +%Y%m%d-%H%M%S)"

mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR"

echo "Backup saved to: $BACKUP_DIR"
```

**Backup Specific Collections**:
```bash
# Backup only users and activitylogs
mongodump --uri="$MONGO_URI" \
  --collection=users \
  --out="./backups/users-$(date +%Y%m%d)"

mongodump --uri="$MONGO_URI" \
  --collection=activitylogs \
  --out="./backups/logs-$(date +%Y%m%d)"
```

**Compressed Backup**:
```bash
# Create gzip-compressed backup
mongodump --uri="$MONGO_URI" \
  --gzip \
  --out="./backups/compressed-$(date +%Y%m%d)"

# Results in smaller file size (~70% reduction)
```

### Backup Script

Create `backend/scripts/backup-db.sh`:
```bash
#!/bin/bash

# Load environment variables
source ../.env

BACKUP_DIR="./backups/$(date +%Y%m%d-%H%M%S)"

echo "🗄️  Starting database backup..."
echo "Database: $MONGO_URI"

mongodump --uri="$MONGO_URI" --gzip --out="$BACKUP_DIR"

if [ $? -eq 0 ]; then
  echo "✅ Backup completed successfully!"
  echo "Location: $BACKUP_DIR"
  
  # Optional: Upload to cloud storage
  # aws s3 cp "$BACKUP_DIR" s3://my-bucket/snipe-backups/ --recursive
else
  echo "❌ Backup failed!"
  exit 1
fi
```

Make executable and run:
```bash
chmod +x backend/scripts/backup-db.sh
./backend/scripts/backup-db.sh
```

---

## 🔄 Restoring from Backup

### Restore Full Database

**⚠️ WARNING**: This will overwrite existing data!

```bash
# Restore from backup directory
BACKUP_DIR="./backups/backup-20260107-120000"
MONGO_URI="mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/snipe"

mongorestore --uri="$MONGO_URI" \
  --gzip \
  --drop \
  "$BACKUP_DIR"
```

**Flags Explained**:
- `--gzip`: Decompress backup if it was compressed
- `--drop`: Drop collections before restoring (prevents duplicates)
- `--nsInclude`: Restore specific namespaces only

### Restore Specific Collection

```bash
# Restore only the 'users' collection
mongorestore --uri="$MONGO_URI" \
  --collection=users \
  --drop \
  "./backups/backup-20260107/snipe/users.bson"
```

### Restore to Different Database

```bash
# Restore to 'snipe-test' instead of 'snipe'
mongorestore --uri="mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/snipe-test" \
  --drop \
  "./backups/backup-20260107"
```

### Restore Script

Create `backend/scripts/restore-db.sh`:
```bash
#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./restore-db.sh <backup-directory>"
  exit 1
fi

BACKUP_DIR="$1"
source ../.env

echo "⚠️  WARNING: This will overwrite your database!"
echo "Backup: $BACKUP_DIR"
echo "Database: $MONGO_URI"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo "🔄 Starting database restore..."

mongorestore --uri="$MONGO_URI" \
  --gzip \
  --drop \
  "$BACKUP_DIR"

if [ $? -eq 0 ]; then
  echo "✅ Restore completed successfully!"
else
  echo "❌ Restore failed!"
  exit 1
fi
```

Usage:
```bash
chmod +x backend/scripts/restore-db.sh
./backend/scripts/restore-db.sh ./backups/backup-20260107-120000
```

---

## 📤 Exporting Collections to JSON

Export collections as human-readable JSON files.

### Export Single Collection

```bash
mongoexport --uri="$MONGO_URI" \
  --collection=users \
  --out=users-export.json \
  --jsonArray
```

### Export All Collections

```bash
# List of collections
COLLECTIONS=("users" "notifications" "chatmessages" "uploads" "activitylogs")

for collection in "${COLLECTIONS[@]}"; do
  echo "Exporting $collection..."
  mongoexport --uri="$MONGO_URI" \
    --collection=$collection \
    --out="exports/$collection-$(date +%Y%m%d).json" \
    --jsonArray
done

echo "✅ All collections exported to exports/ directory"
```

### Import from JSON

```bash
mongoimport --uri="$MONGO_URI" \
  --collection=users \
  --file=users-export.json \
  --jsonArray \
  --drop
```

---

## 🔐 Backup Security Best Practices

### 1. Encrypt Backups

```bash
# Encrypt backup with GPG
mongodump --uri="$MONGO_URI" --archive | \
  gpg --symmetric --cipher-algo AES256 > backup-encrypted.gpg

# Decrypt and restore
gpg --decrypt backup-encrypted.gpg | \
  mongorestore --archive
```

### 2. Store Backups Securely

**Local Storage**:
- Store backups outside the repository
- Use encrypted drives/volumes
- Limit file permissions: `chmod 600 backup-dir/`

**Cloud Storage** (Recommended):
```bash
# AWS S3
aws s3 cp ./backups/backup-20260107 \
  s3://my-bucket/snipe-backups/ \
  --recursive \
  --sse AES256

# Google Cloud Storage
gsutil -m cp -r ./backups/backup-20260107 \
  gs://my-bucket/snipe-backups/

# Azure Blob Storage
az storage blob upload-batch \
  --destination snipe-backups \
  --source ./backups/backup-20260107
```

### 3. Backup Retention Policy

- **Daily backups**: Keep for 7 days
- **Weekly backups**: Keep for 4 weeks
- **Monthly backups**: Keep for 12 months
- **Yearly backups**: Keep for 3-5 years

**Automated Cleanup Script**:
```bash
# Delete backups older than 7 days
find ./backups -type d -mtime +7 -exec rm -rf {} +
```

---

## 📅 Backup Schedule

| Backup Type | Frequency | Retention | Method |
|-------------|-----------|-----------|--------|
| Automatic | Every 12 hours | 7 days | MongoDB Atlas |
| Manual | Before releases | 30 days | mongodump |
| Pre-migration | Before schema changes | Until verified | mongodump |
| Export | Weekly | 4 weeks | mongoexport |

---

## ✅ Backup Verification

### Test Restore Procedure (Quarterly)

1. **Create Test Environment**:
   ```bash
   # Restore to local MongoDB
   docker run -d -p 27017:27017 mongo:latest
   
   mongorestore --uri="mongodb://localhost:27017/snipe-test" \
     ./backups/latest
   ```

2. **Verify Data Integrity**:
   ```javascript
   // Connect to test database
   mongo mongodb://localhost:27017/snipe-test
   
   // Check collection counts
   db.users.countDocuments()
   db.chatmessages.countDocuments()
   
   // Spot-check data
   db.users.findOne()
   db.activitylogs.find().limit(5)
   ```

3. **Test Application**:
   - Update backend `.env` to use test database
   - Start backend server
   - Run `test-deployment.sh`
   - Verify all features work

4. **Clean Up**:
   ```bash
   # Stop test database
   docker stop <container-id>
   
   # Restore original .env
   ```

### Backup Checklist

Before major releases:
- [ ] Create manual backup with mongodump
- [ ] Verify backup completed successfully
- [ ] Check backup file size (should be reasonable)
- [ ] Upload backup to secure cloud storage
- [ ] Document backup location and timestamp
- [ ] Test restore on non-production database

---

## 🚨 Emergency Recovery Scenarios

### Scenario 1: Accidental Data Deletion

1. **Stop the application** immediately to prevent more changes
2. **Identify the timestamp** of the deletion
3. **Restore from snapshot** just before the deletion:
   ```bash
   mongorestore --uri="$MONGO_URI" \
     --nsInclude="snipe.users" \
     --drop \
     ./backups/backup-before-deletion
   ```
4. **Verify data** is restored correctly
5. **Restart application**

### Scenario 2: Database Corruption

1. **Check MongoDB Atlas status** for cluster health
2. **Restore from latest snapshot**:
   - Use MongoDB Atlas "Restore" feature
   - Choose "Restore to same cluster" or create new cluster
3. **Verify data integrity** after restore
4. **Update connection string** if restored to new cluster
5. **Monitor for continued issues**

### Scenario 3: Full Database Loss

1. **Create new MongoDB cluster** in Atlas
2. **Restore from most recent backup**:
   ```bash
   mongorestore --uri="$NEW_MONGO_URI" \
     ./backups/latest-backup
   ```
3. **Seed missing data** if needed:
   ```bash
   cd backend
   node seed.js
   ```
4. **Update environment variables** with new connection string
5. **Redeploy application**
6. **Notify users** of potential data loss

---

## 📞 Support Contacts

- **MongoDB Atlas Support**: https://support.mongodb.com
- **Backup Issues**: Check MAINTENANCE.md for troubleshooting
- **Emergency**: Contact repository maintainer

---

**Last Updated**: January 2026  
**Next Review**: April 2026
