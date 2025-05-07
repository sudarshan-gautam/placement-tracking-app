PRACTITIONER PASSPORT DEPLOYMENT INSTRUCTIONS
===========================================

Follow these steps to deploy the Practitioner Passport app to your cPanel shared hosting:

1. EXTRACT AND UPLOAD
   - Extract this deployment package to your local computer
   - Upload the entire "practitionerpassport" folder to the public_html directory of your cPanel account
   - Ensure all files maintain their directory structure

2. ENVIRONMENT SETUP
   - The .env file is already configured with secure random keys
   - No changes are needed to the environment variables
   - The NEXTAUTH_URL is set to https://sudarshangautam.com.np/practitionerpassport
   - If you're using a different domain, edit the NEXTAUTH_URL in the .env file

3. SET FILE PERMISSIONS
   - Set directories to 755 (rwxr-xr-x)
   - Set files to 644 (rw-r--r--)
   - Set database.sqlite to 664 (rw-rw-r--)
   - Make sure the practitionerpassport directory is writeable

4. SET UP NODE.JS APP IN CPANEL
   - In cPanel, find "Setup Node.js App"
   - Create a new application with:
     * Application path: /home/[username]/public_html/practitionerpassport
     * Application URL: https://sudarshangautam.com.np/practitionerpassport
     * Application startup file: server.js
     * Node.js version: 18.x (or latest LTS)
     * NPM dependencies: none (already included in package)
   - Start the application

5. TEST YOUR DEPLOYMENT
   - Visit https://sudarshangautam.com.np/practitionerpassport
   - Try logging in with the sample credentials from the database
   - Check for any errors in the browser console

6. TROUBLESHOOTING
   - Check cPanel error logs
   - Verify file permissions
   - Ensure Node.js is properly configured
   - Check that .htaccess is properly formatted
   - Make sure database.sqlite exists and is writeable

For additional help, refer to host.txt in the original project. 