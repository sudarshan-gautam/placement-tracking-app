#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Practitioner Passport ROOT Deployment =====${NC}"
echo -e "${YELLOW}This script will setup your application directly in the current directory${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git not found. Installing Git...${NC}"
    yum install git -y || apt-get install git -y
fi

# Check current directory
CURRENT_DIR=$(pwd)
echo -e "${YELLOW}Deploying to: ${CURRENT_DIR}${NC}"

# Backup existing files
echo -e "${YELLOW}Backing up any existing files...${NC}"
BACKUP_DIR="${HOME}/backup_practitionerpassport_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Only backup important files if they exist
[ -f .env ] && cp .env "$BACKUP_DIR/"
[ -f database.sqlite ] && cp database.sqlite "$BACKUP_DIR/"

# Clean the current directory but preserve important files
echo -e "${YELLOW}Cleaning directory...${NC}"
find . -mindepth 1 -not -name "database.sqlite" -not -name ".env" -not -name "root-deploy.sh" -delete

# Clone the repository directly to current directory
echo -e "${YELLOW}Cloning repository from GitHub...${NC}"
git init
git remote add origin https://github.com/sudarshan-gautam/placement-tracking-app.git
git fetch origin deployment
git checkout -f deployment

# Make scripts executable
chmod +x setup.sh
chmod +x build.sh
chmod +x update.sh
chmod +x server.js

# Determine application path for configuration
# Extract path relative to public_html
if [[ "$CURRENT_DIR" == *"public_html"* ]]; then
    APP_PATH=$(echo "$CURRENT_DIR" | awk -F'public_html/' '{print $2}')
    if [ -z "$APP_PATH" ]; then
        # Root of public_html
        APP_PATH=""
        SITE_URL="https://sudarshangautam.com.np"
    else
        # Subdirectory
        SITE_URL="https://sudarshangautam.com.np/$APP_PATH"
    fi
else
    # Default if not in public_html
    APP_PATH=$(basename "$CURRENT_DIR")
    SITE_URL="https://sudarshangautam.com.np/$APP_PATH"
fi

echo -e "${YELLOW}Detected app path: ${APP_PATH}${NC}"
echo -e "${YELLOW}Site URL will be: ${SITE_URL}${NC}"

# Create/update .env file with proper URL
if [ -f .env ]; then
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=${SITE_URL}|g" .env
else
    echo "NODE_ENV=production" > .env
    echo "NEXTAUTH_URL=${SITE_URL}" >> .env
    echo "NEXTAUTH_SECRET=66d7f7a64229e3915e1d94d45dcc910a87219058661bd0899081ebbb2af25b77" >> .env
    echo "JWT_SECRET=1aab58f52e31dac086905a9da4ec956b791a72241c1ca6a8b9c0ba0144742fb0" >> .env
fi

# Update .htaccess with proper path
if [ -f .htaccess-template ]; then
    sed "s|__APP_PATH__|${APP_PATH}|g" .htaccess-template > .htaccess
    chmod 644 .htaccess
fi

# Update paths in next.config.js if it exists
if [ -f next.config.js ]; then
    # Update basePath if APP_PATH is not empty
    if [ -n "$APP_PATH" ]; then
        sed -i "s|basePath: .*|basePath: '/${APP_PATH}',|g" next.config.js
    else
        sed -i "s|basePath: .*|basePath: '',|g" next.config.js
    fi
fi

# Create or update the root-update.sh script for future updates
cat > root-update.sh << 'EOF'
#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Practitioner Passport ROOT Update =====${NC}"
echo -e "${YELLOW}This script will update your application from GitHub${NC}"

# Save current directory state
CURRENT_DIR=$(pwd)

# Backup important files
echo -e "${YELLOW}Backing up important files...${NC}"
[ -f .env ] && cp .env .env.backup
[ -f database.sqlite ] && cp database.sqlite database.sqlite.backup
[ -f .htaccess ] && cp .htaccess .htaccess.backup

# Reset any local changes and pull latest
echo -e "${GREEN}Pulling latest changes...${NC}"
git reset --hard
git pull origin deployment

# Restore backed up files
echo -e "${YELLOW}Restoring important files...${NC}"
[ -f .env.backup ] && mv .env.backup .env
[ -f database.sqlite.backup ] && mv database.sqlite.backup database.sqlite
[ -f .htaccess.backup ] && mv .htaccess.backup .htaccess

# Make scripts executable
chmod +x setup.sh
chmod +x build.sh
chmod +x update.sh
chmod +x server.js
chmod +x root-update.sh

# Update dependencies
echo -e "${YELLOW}Updating dependencies...${NC}"
npm install

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
./build.sh

# Restart the application
echo -e "${YELLOW}Restarting the application...${NC}"
./setup.sh

echo -e "${GREEN}Update completed successfully!${NC}"
echo -e "${GREEN}Your application is now running with the latest changes${NC}"
EOF

chmod +x root-update.sh

echo -e "${GREEN}GitHub repository cloned successfully!${NC}"
echo -e "${YELLOW}Now running setup...${NC}"

# Run the setup script
./setup.sh

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${GREEN}Your application is now running at: ${SITE_URL}${NC}"
echo -e "${YELLOW}In the future, to update from GitHub just run:${NC}"
echo -e "${YELLOW}./root-update.sh${NC}" 