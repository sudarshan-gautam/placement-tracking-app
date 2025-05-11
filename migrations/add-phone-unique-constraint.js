const sqlite3 = require('sqlite3').verbose();

async function migrate() {
  return new Promise((resolve, reject) => {
    // Connect to the database
    const db = new sqlite3.Database('./database.sqlite', (err) => {
      if (err) {
        console.error('Error connecting to database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to the SQLite database.');
      
      // Begin transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Step 1: Create a new temporary table with the UNIQUE constraint
        db.run(`
          CREATE TABLE user_profiles_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            biography TEXT,
            education TEXT,
            graduation_year INTEGER,
            preferred_job_type TEXT,
            preferred_location TEXT, 
            phone TEXT UNIQUE, 
            secondary_email TEXT, 
            social_media TEXT, 
            profileImage TEXT, 
            coverImage TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id)
          )
        `, (err) => {
          if (err) {
            console.error('Error creating new table:', err.message);
            db.run('ROLLBACK');
            db.close();
            reject(err);
            return;
          }
          
          // Step 2: Copy data from the old table to the new table
          db.run(`
            INSERT INTO user_profiles_new 
            SELECT id, user_id, biography, education, graduation_year, preferred_job_type, preferred_location, 
                   phone, secondary_email, social_media, profileImage, coverImage 
            FROM user_profiles
          `, (err) => {
            if (err) {
              console.error('Error copying data to new table:', err.message);
              db.run('ROLLBACK');
              db.close();
              reject(err);
              return;
            }
            
            // Step 3: Drop the old table
            db.run('DROP TABLE user_profiles', (err) => {
              if (err) {
                console.error('Error dropping old table:', err.message);
                db.run('ROLLBACK');
                db.close();
                reject(err);
                return;
              }
              
              // Step 4: Rename the new table to the original name
              db.run('ALTER TABLE user_profiles_new RENAME TO user_profiles', (err) => {
                if (err) {
                  console.error('Error renaming new table:', err.message);
                  db.run('ROLLBACK');
                  db.close();
                  reject(err);
                  return;
                }
                
                // Commit the transaction
                db.run('COMMIT', (err) => {
                  if (err) {
                    console.error('Error committing transaction:', err.message);
                    db.run('ROLLBACK');
                    reject(err);
                  } else {
                    console.log('Successfully added UNIQUE constraint to phone column in user_profiles table');
                    resolve();
                  }
                  
                  // Close the database connection
                  db.close();
                });
              });
            });
          });
        });
      });
    });
  });
}

// Run the migration
migrate()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  }); 