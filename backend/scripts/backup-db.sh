#!/bin/bash

# Database Backup Script for Snipe
# Creates a timestamped backup of the MongoDB database

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f ../.env ]; then
  export $(cat ../.env | grep -v '^#' | xargs)
else
  echo -e "${RED}❌ Error: .env file not found${NC}"
  exit 1
fi

# Configuration
BACKUP_BASE_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$BACKUP_BASE_DIR/backup-$TIMESTAMP"

# Check if mongodump is installed
if ! command -v mongodump &> /dev/null; then
  echo -e "${RED}❌ Error: mongodump is not installed${NC}"
  echo "Install MongoDB Database Tools:"
  echo "  macOS: brew install mongodb-database-tools"
  echo "  Ubuntu: sudo apt install mongodb-database-tools"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}🗄️  Starting database backup...${NC}"
echo "Database: ${MONGO_URI%%@*}@***"
echo "Backup location: $BACKUP_DIR"
echo ""

# Perform backup
mongodump --uri="$MONGO_URI" --gzip --out="$BACKUP_DIR"

if [ $? -eq 0 ]; then
  # Calculate backup size
  BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
  
  echo ""
  echo -e "${GREEN}✅ Backup completed successfully!${NC}"
  echo "Location: $BACKUP_DIR"
  echo "Size: $BACKUP_SIZE"
  
  # List backups
  echo ""
  echo "Recent backups:"
  ls -lh "$BACKUP_BASE_DIR" | tail -5
  
  # Optional: Clean up old backups (older than 30 days)
  echo ""
  echo "Cleaning up old backups (>30 days)..."
  find "$BACKUP_BASE_DIR" -type d -name "backup-*" -mtime +30 -exec rm -rf {} + 2>/dev/null || true
  
  echo -e "${GREEN}✅ Done!${NC}"
else
  echo -e "${RED}❌ Backup failed!${NC}"
  exit 1
fi
