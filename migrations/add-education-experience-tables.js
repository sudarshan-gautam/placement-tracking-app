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
        
        // Create user_education table
        db.run(`
          CREATE TABLE IF NOT EXISTS user_education (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            institution TEXT NOT NULL,
            degree TEXT NOT NULL,
            field_of_study TEXT,
            start_date TEXT,
            end_date TEXT,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `, (err) => {
          if (err) {
            console.error('Error creating user_education table:', err.message);
            db.run('ROLLBACK');
            db.close();
            reject(err);
            return;
          }
          
          // Create user_experience table
          db.run(`
            CREATE TABLE IF NOT EXISTS user_experience (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id TEXT NOT NULL,
              company TEXT NOT NULL,
              position TEXT NOT NULL,
              location TEXT,
              start_date TEXT,
              end_date TEXT,
              current_job BOOLEAN DEFAULT 0,
              description TEXT,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating user_experience table:', err.message);
              db.run('ROLLBACK');
              db.close();
              reject(err);
              return;
            }
            
            // If the user has existing education data, migrate it to the new table
            db.run(`
              INSERT INTO user_education (user_id, institution, degree, end_date)
              SELECT user_id, education, 'Degree', graduation_year || '-06-01' 
              FROM user_profiles 
              WHERE education IS NOT NULL AND education != ''
            `, (err) => {
              if (err) {
                console.error('Error migrating existing education data:', err.message);
                // Continue anyway, as this is not critical
                console.log('Continuing with migration despite education data transfer error');
              }
              
              // Commit the transaction
              db.run('COMMIT', (err) => {
                if (err) {
                  console.error('Error committing transaction:', err.message);
                  db.run('ROLLBACK');
                  reject(err);
                } else {
                  console.log('Successfully created education and experience tables');
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