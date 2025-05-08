const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if we want to force clear all auth data (more secure)
const CLEAR_AUTH_ON_RESTART = process.env.CLEAR_AUTH_ON_RESTART === 'true' || true;

// Determine environment
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

// Add timestamp to logs
function logWithTimestamp(message) {
  const now = new Date();
  console.log(`[${now.toISOString()}] ${message}`);
}

// Run the database initialization script
logWithTimestamp('Running database initialization script...');
const initScript = spawn('node', [path.join(__dirname, 'scripts', 'init-database.js')]);

initScript.stdout.on('data', (data) => {
  logWithTimestamp(`Init script: ${data}`);
});

initScript.stderr.on('data', (data) => {
  logWithTimestamp(`Init script error: ${data}`);
});

initScript.on('close', (code) => {
  logWithTimestamp(`Database initialization script exited with code ${code}`);
  
  // Continue with Next.js app preparation after script completes
  app.prepare().then(() => {
    createServer((req, res) => {
      // Set security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
      if (err) throw err;
      logWithTimestamp(`> Ready on http://localhost:${port}`);
      logWithTimestamp(`> Auth clear on restart: ${CLEAR_AUTH_ON_RESTART ? 'Enabled' : 'Disabled'}`);
    });
  });
}); 