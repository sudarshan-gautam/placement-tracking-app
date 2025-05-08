#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Practitioner Passport GitHub Deployment =====${NC}"
echo -e "${YELLOW}This script will setup your application from GitHub${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git not found. Installing Git...${NC}"
    yum install git -y || apt-get install git -y
fi

# Make sure we're in the practitionerpassport directory
if [ "$(basename $(pwd))" != "practitionerpassport" ]; then
    echo -e "${RED}Error: You must run this script from the practitionerpassport directory${NC}"
    echo -e "${YELLOW}Run: cd ~/public_html/practitionerpassport${NC}"
    exit 1
fi

# Clean the directory (optional, comment out if you want to keep existing files)
echo -e "${YELLOW}Cleaning directory...${NC}"
find . -mindepth 1 -not -name "git-deploy.sh" -delete

# Clone the repository
echo -e "${YELLOW}Cloning repository from GitHub...${NC}"
git clone -b deployment --single-branch https://github.com/sudarshan-gautam/placement-tracking-app.git temp

# Move files to the current directory
echo -e "${YELLOW}Moving files...${NC}"
mv temp/* .
mv temp/.* . 2>/dev/null || true  # Move hidden files

# Remove the temporary directory
rm -rf temp

# Make scripts executable
chmod +x setup.sh
chmod +x build.sh
chmod +x update.sh

echo -e "${GREEN}GitHub repository cloned successfully!${NC}"
echo -e "${YELLOW}Now running setup...${NC}"

# Run the setup script
./setup.sh

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${GREEN}Your application is now running at:${NC}"
echo -e "${GREEN}https://sudarshangautam.com.np/practitionerpassport${NC}"
echo -e "${YELLOW}In the future, to update from GitHub just run:${NC}"
echo -e "${YELLOW}./update.sh${NC}" 