# Practitioner Passport - Simplified Deployment Guide

## Overview
This guide provides the simplest way to deploy the Practitioner Passport application directly to your root or any directory on your cPanel shared hosting.

## Quick Deployment (One Step)

### Step 1: Download and Run the Deployment Script
```bash
# Navigate to the directory where you want to deploy (root or any directory)
cd ~/public_html
# or for a subdirectory:
# cd ~/public_html/myapp

# Download the deployment script
curl -O https://raw.githubusercontent.com/sudarshan-gautam/placement-tracking-app/deployment/root-deploy.sh

# Make it executable
chmod +x root-deploy.sh

# Run it
./root-deploy.sh
```

That's it! Your application will be deployed and running in the current directory.

## Updating Your Application
Whenever you make changes to your code and push them to GitHub, simply run:
```bash
./root-update.sh
```

## Key Features

- **Direct deployment**: Clone directly to your target directory without needing to move files around
- **Automatic path detection**: Automatically configures your app for the deployed directory path
- **Database preservation**: Automatically backs up your database during updates
- **Environment variable management**: Preserves your environment settings

## Important Files

- `root-deploy.sh` - Initial deployment script for first-time setup
- `root-update.sh` - Update script for pulling latest changes
- `setup.sh` - Installs Node.js, dependencies, and starts the server
- `build.sh` - Builds the application with proper environment variables
- `server.js` - The optimized server configuration

## Troubleshooting

If you encounter issues, check the logs:
```bash
pm2 logs practitionerpassport
```

Common commands:
```bash
# Stop the server
pm2 stop practitionerpassport

# Restart the server
pm2 restart practitionerpassport

# View server status
pm2 status
```

## Development Workflow

1. Make changes to your code locally
2. Commit and push to the deployment branch
3. On your server, run `./root-update.sh` to apply changes 