#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Practitioner Passport Update =====${NC}"
echo -e "${YELLOW}This script will update your application from GitHub${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git not found. Installing Git...${NC}"
    yum install git -y || apt-get install git -y
fi

# Ensure we're in the correct directory
cd ~/public_html/practitionerpassport

# Save current directory state
CURRENT_DIR=$(pwd)

# Check if this is a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}This is not a git repository. Initializing...${NC}"
    
    # Backup current files (just in case)
    echo -e "${YELLOW}Backing up current files...${NC}"
    BACKUP_DIR="~/backup_practitionerpassport_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    cp -r * $BACKUP_DIR/
    
    # Initialize git and connect to repository
    git init
    git remote add origin https://github.com/sudarshan-gautam/placement-tracking-app.git
    
    # Pull the deployment branch
    git fetch origin deployment
    git checkout -b deployment --track origin/deployment
else
    echo -e "${GREEN}Git repository found. Pulling latest changes...${NC}"
    
    # Reset any local changes (optional, comment this out if you want to keep local changes)
    git reset --hard
    
    # Pull the latest changes
    git pull origin deployment
fi

# Make scripts executable
chmod +x setup.sh
chmod +x build.sh

# Update node modules if needed
echo -e "${YELLOW}Updating dependencies...${NC}"
npm install

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
./build.sh

# Restart the application
echo -e "${YELLOW}Restarting the application...${NC}"
./setup.sh

echo -e "${GREEN}Update completed successfully!${NC}"
echo -e "${GREEN}Your application is now running with the latest changes at:${NC}"
echo -e "${GREEN}https://sudarshangautam.com.np/practitionerpassport${NC}" 