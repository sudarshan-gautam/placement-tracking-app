# PRACTITIONER PASSPORT - DEPLOYMENT GUIDE

## OVERVIEW
This guide provides step-by-step instructions for deploying the Practitioner Passport application to your cPanel shared hosting.

## DEPLOYMENT STEPS

### 1. UPLOAD FILES
- Upload the entire "practitionerpassport" folder to your cPanel public_html directory
- If uploading via ZIP, extract it after uploading

### 2. CONNECT TO TERMINAL
- Log in to your cPanel
- Open Terminal or SSH into your server

### 3. NAVIGATE TO YOUR APP DIRECTORY
```bash
cd ~/public_html/practitionerpassport
```

### 4. SET EXECUTION PERMISSIONS
```bash
chmod +x setup.sh
chmod +x build.sh
```

### 5. BUILD AND RUN THE APPLICATION
```bash
# Run the setup script to install Node.js and dependencies
./setup.sh

# If the application wasn't built properly, run:
./build.sh

# Then run setup again to start the server
./setup.sh
```

## IMPORTANT FILES

- `setup.sh` - Install Node.js, dependencies, and start the server
- `build.sh` - Build the Next.js application
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