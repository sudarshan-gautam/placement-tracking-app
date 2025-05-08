const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function createActivitiesTable() {
  try {
    console.log('Starting database fix for activities table...');
    
    // Open database connection
    const dbPath = path.resolve('./database.sqlite');
    console.log('Database file exists at:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Check if activities table exists
    const tableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='activities'");
    
    if (!tableCheck) {
      console.log('Creating activities table...');
      await db.run(`
        CREATE TABLE activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          student_id TEXT NOT NULL,
          mentor_id TEXT,
          date TEXT NOT NULL,
          duration TEXT,
          description TEXT,
          evidence TEXT,
          reflection TEXT,
          rejection_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          activity_type TEXT,
          location TEXT,
          document_url TEXT,
          learning_outcomes TEXT,
          feedback_comments TEXT
        )
      `);
      console.log('Successfully created activities table');
      
      // Add a few sample records to the table
      console.log('Adding sample activities data...');
      await db.run(`
        INSERT INTO activities (title, type, status, student_id, mentor_id, date, duration, description, activity_type) 
        VALUES 
        ('Research Project', 'Research', 'pending', '1', '5', '2025-05-01', '120', 'Conducted research on machine learning applications', 'Research'),
        ('Industry Workshop', 'Workshop', 'verified', '2', '6', '2025-05-02', '180', 'Attended industry workshop on cloud computing', 'Learning'),
        ('Programming Practice', 'Development', 'pending', '3', '5', '2025-05-03', '90', 'Practiced programming skills with new framework', 'Development')
      `);
      console.log('Added sample activities data');
    } else {
      console.log('activities table already exists');
    }
    
    // Fix profile_verifications table if needed
    const profileVerificationsCheck = await db.get("SELECT * FROM profile_verifications LIMIT 1");
    const hasDocumentUrl = await db.get("PRAGMA table_info(profile_verifications)").then(
      columns => columns.some(col => col.name === 'document_url')
    ).catch(() => false);
    
    if (profileVerificationsCheck && !hasDocumentUrl) {
      console.log('Adding document_url column to profile_verifications table...');
      await db.run("ALTER TABLE profile_verifications ADD COLUMN document_url TEXT");
      console.log('Successfully added document_url column to profile_verifications table');
    }
    
    await db.close();
    console.log('Database fix completed successfully');
    
  } catch (error) {
    console.error('Error fixing database:', error);
  }
}

createActivitiesTable(); 