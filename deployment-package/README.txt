# PRACTITIONER PASSPORT - DEPLOYMENT GUIDE

## OVERVIEW
This guide provides step-by-step instructions for deploying the Practitioner Passport application to your cPanel shared hosting.

## DEPLOYMENT OPTIONS

### OPTION 1: DIRECT DEPLOYMENT
Use this method if you want to upload the files directly.

1. Upload the entire "practitionerpassport" folder to your cPanel public_html directory
2. If uploading via ZIP, extract it after uploading
3. Run the setup script (see below)

### OPTION 2: GITHUB DEPLOYMENT (RECOMMENDED)
Use this method for easier updates in the future.

1. Upload only the `git-deploy.sh` script to your `public_html/practitionerpassport` directory
2. Make it executable: `chmod +x git-deploy.sh`
3. Run it: `./git-deploy.sh`
4. The script will automatically clone the repository and set everything up

## TERMINAL COMMANDS

### NAVIGATE TO YOUR APP DIRECTORY
```bash
cd ~/public_html/practitionerpassport
```

### SET EXECUTION PERMISSIONS
```bash
chmod +x setup.sh
chmod +x build.sh
chmod +x update.sh
```

### BUILD AND RUN THE APPLICATION
```bash
# Run the setup script to install Node.js and dependencies
./setup.sh

# If the application wasn't built properly, run:
./build.sh

# Then run setup again to start the server
./setup.sh
```

### UPDATING FROM GITHUB
After making changes to your repository, simply run:
```bash
./update.sh
```

## IMPORTANT FILES

- `setup.sh` - Install Node.js, dependencies, and start the server
- `build.sh` - Build the Next.js application
- `update.sh` - Pull latest changes from GitHub and update the application
- `git-deploy.sh` - Initial deployment from GitHub
- `server.js` - The server configuration file
- `.env` - Environment variables

## TROUBLESHOOTING

If you encounter issues, check the logs:
```bash
pm2 logs practitionerpassport
```

To stop the server:
```bash
pm2 stop practitionerpassport
```

To restart the server:
```bash
pm2 restart practitionerpassport
```

## BROWSER ACCESS
After deployment, access your application at:
https://sudarshangautam.com.np/practitionerpassport

## SECURITY NOTES
- The deployment includes pre-configured security keys
- For production use, consider changing these keys
- Update the .env file if you change domain names

## DEVELOPMENT WORKFLOW
1. Make changes to your code locally
2. Commit and push to the deployment branch
3. On your server, run `./update.sh` to apply the changes 