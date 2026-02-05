#!/bin/bash

# Database Restore Script for Snipe
# Restores MongoDB database from a backup directory

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: Backup directory not specified${NC}"
  echo ""
  echo "Usage: ./restore-db.sh <backup-directory>"
  echo ""
  echo "Example:"
  echo "  ./restore-db.sh ./backups/backup-20260107-120000"
  echo ""
  echo "Available backups:"
  ls -1 ./backups/ 2>/dev/null | grep "backup-" || echo "  No backups found"
  exit 1
fi

BACKUP_DIR="$1"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
  echo -e "${RED}❌ Error: Backup directory not found: $BACKUP_DIR${NC}"
  exit 1
fi

# Load environment variables
if [ -f ../.env ]; then
  export $(cat ../.env | grep -v '^#' | xargs)
else
  echo -e "${RED}❌ Error: .env file not found${NC}"
  exit 1
fi

# Check if mongorestore is installed
if ! command -v mongorestore &> /dev/null; then
  echo -e "${RED}❌ Error: mongorestore is not installed${NC}"
  echo "Install MongoDB Database Tools:"
  echo "  macOS: brew install mongodb-database-tools"
  echo "  Ubuntu: sudo apt install mongodb-database-tools"
  exit 1
fi

# Warning and confirmation
echo -e "${YELLOW}⚠️  WARNING: This will OVERWRITE your current database!${NC}"
echo ""
echo "Backup: $BACKUP_DIR"
echo "Database: ${MONGO_URI%%@*}@***"
echo ""
echo "This action will:"
echo "  1. Drop all existing collections"
echo "  2. Restore data from the backup"
echo "  3. Cannot be undone without another backup"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
  echo -e "${YELLOW}Restore cancelled.${NC}"
  exit 0
fi

# Perform restore
echo ""
echo -e "${YELLOW}🔄 Starting database restore...${NC}"

mongorestore --uri="$MONGO_URI" \
  --gzip \
  --drop \
  "$BACKUP_DIR"

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Restore completed successfully!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Verify data with: mongo \"$MONGO_URI\""
  echo "  2. Test your application"
  echo "  3. Check logs for any errors"
else
  echo ""
  echo -e "${RED}❌ Restore failed!${NC}"
  echo "Check the error messages above for details."
  exit 1
fi
