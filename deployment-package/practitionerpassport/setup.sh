#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Practitioner Passport Setup =====${NC}"
echo -e "${YELLOW}This script will set up the environment for your application${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found. Installing NVM and Node.js 18...${NC}"
    
    # Install NVM
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
    
    # Load NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    # Install Node.js 18
    nvm install 18
    nvm use 18
    
    echo -e "${GREEN}Node.js installed successfully!${NC}"
else
    echo -e "${GREEN}Node.js is already installed.${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Set proper permissions
echo -e "${YELLOW}Setting file permissions...${NC}"
chmod 644 .env
chmod 664 database.sqlite
chmod 755 server.js
chmod 755 .htaccess

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    echo "NODE_ENV=production" > .env
    echo "NEXTAUTH_URL=https://sudarshangautam.com.np/practitionerpassport" >> .env
    echo "NEXTAUTH_SECRET=66d7f7a64229e3915e1d94d45dcc910a87219058661bd0899081ebbb2af25b77" >> .env
    echo "JWT_SECRET=1aab58f52e31dac086905a9da4ec956b791a72241c1ca6a8b9c0ba0144742fb0" >> .env
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2 globally...${NC}"
    npm install -g pm2
fi

# Stop any existing PM2 process
pm2 delete practitionerpassport 2>/dev/null

# Start the application with PM2
echo -e "${YELLOW}Starting the application with PM2...${NC}"
pm2 start server.js --name practitionerpassport --node-args="--max_old_space_size=220" --env production

# Save PM2 configuration
pm2 save

# Show status
pm2 status

echo -e "${GREEN}Setup complete! The application is now running at:${NC}"
echo -e "${GREEN}https://sudarshangautam.com.np/practitionerpassport${NC}"
echo -e "${YELLOW}If you encounter any issues, check the logs with: pm2 logs practitionerpassport${NC}" 