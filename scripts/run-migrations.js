/**
 * Script to run all migrations in sequence
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting database migrations...');

// List of migration scripts to run in order
const migrations = [
  '../migrations/create-mentor-students.js',
  '../migrations/create-verification-tables.js',
  '../migrations/add-feedback-to-qualifications.js',
  '../migrations/create-messages-table.js',
  '../migrations/drop-mentor-students.js'
];

// Run migrations sequentially
async function runMigrations() {
  for (const migration of migrations) {
    try {
      console.log(`Running migration: ${migration}`);
      
      // Run the migration script
      await new Promise((resolve, reject) => {
        const migrationPath = path.join(__dirname, migration);
        const process = spawn('node', [migrationPath], { stdio: 'inherit' });
        
        process.on('close', (code) => {
          if (code === 0) {
            console.log(`Migration ${migration} completed successfully`);
            resolve();
          } else {
            console.error(`Migration ${migration} failed with code ${code}`);
            reject(new Error(`Migration failed with code ${code}`));
          }
        });
        
        process.on('error', (err) => {
          console.error(`Error starting migration ${migration}:`, err);
          reject(err);
        });
      });
      
    } catch (error) {
      console.error(`Failed to run migration ${migration}:`, error);
      process.exit(1);
    }
  }
  
  console.log('All migrations completed successfully!');
}

// Run migrations
runMigrations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  }); 