#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Building Practitioner Passport Application =====${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found. Please run setup.sh first.${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Create .env.production file for build
echo -e "${YELLOW}Creating production environment variables...${NC}"
echo "NODE_ENV=production" > .env.production
echo "NEXTAUTH_URL=https://sudarshangautam.com.np/practitionerpassport" >> .env.production
echo "NEXTAUTH_SECRET=66d7f7a64229e3915e1d94d45dcc910a87219058661bd0899081ebbb2af25b77" >> .env.production
echo "JWT_SECRET=1aab58f52e31dac086905a9da4ec956b791a72241c1ca6a8b9c0ba0144742fb0" >> .env.production

# Clean any existing build
echo -e "${YELLOW}Cleaning previous build...${NC}"
rm -rf .next

# Build the Next.js application
echo -e "${YELLOW}Building the application (this may take a few minutes)...${NC}"
NODE_OPTIONS="--max_old_space_size=220" npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build completed successfully!${NC}"
    echo -e "${YELLOW}Now run setup.sh to start the application.${NC}"
else
    echo -e "${RED}Build failed. Check the error messages above.${NC}"
    exit 1
fi 