// Memory optimization - reduce memory usage for shared hosting
process.env.NODE_OPTIONS = '--max_old_space_size=220';
const path = require('path');

const dir = path.join(__dirname);

// Set production mode
process.env.NODE_ENV = 'production';
process.chdir(__dirname);

// Server configuration
const currentPort = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOST || '0.0.0.0';

// Setup environment variables if not present
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'https://sudarshangautam.com.np/practitionerpassport';
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = '66d7f7a64229e3915e1d94d45dcc910a87219058661bd0899081ebbb2af25b77';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = '1aab58f52e31dac086905a9da4ec956b791a72241c1ca6a8b9c0ba0144742fb0';
}

try {
  // Start the server with a catch to handle errors
  require('./.next/standalone/server.js');
  console.log(`Server running at http://${hostname}:${currentPort}/practitionerpassport`);
} catch (error) {
  console.error('Server startup error:', error);
  
  // Check if .next directory exists
  const fs = require('fs');
  if (!fs.existsSync(path.join(__dirname, '.next'))) {
    console.error('ERROR: .next directory not found! Please build the application first.');
    console.error('Run the following commands:');
    console.error('npm run build');
  }
}