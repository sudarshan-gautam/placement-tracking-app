const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));

// Start a transaction
db.serialize(() => {
  // Check if social_media column already exists
  db.get("PRAGMA table_info(user_profiles)", (err, row) => {
    if (err) {
      console.error('Error checking table structure:', err.message);
      db.close();
      return;
    }
    
    // Add social_media column to user_profiles table if it doesn't exist
    db.run('ALTER TABLE user_profiles ADD COLUMN social_media TEXT;', (err) => {
      if (err) {
        // Column might already exist, which is fine
        console.log('Social media column already exists or error:', err?.message);
      } else {
        console.log('Added social_media column to user_profiles table');
      }
      
      // Add phone numbers and social media for existing users
      db.all('SELECT user_id FROM user_profiles', (err, rows) => {
        if (err) {
          console.error('Error fetching users:', err.message);
          db.close();
          return;
        }

        // Prepare sample social media data
        const socialMediaSamples = [
          { website: 'https://www.example.com', linkedin: 'https://linkedin.com/in/exampleuser', twitter: 'https://twitter.com/exampleuser' },
          { website: 'https://www.example-edu.org', linkedin: 'https://linkedin.com/in/educator', twitter: 'https://twitter.com/edutweets' },
          { website: 'https://www.mentorship.com', linkedin: 'https://linkedin.com/in/mentorexpert', twitter: 'https://twitter.com/mentorhelp' },
          { website: 'https://www.teachingportfolio.net', linkedin: 'https://linkedin.com/in/teachingpro', twitter: 'https://twitter.com/teaching101' },
          { website: 'https://www.educationalresources.org', linkedin: 'https://linkedin.com/in/edresources', twitter: 'https://twitter.com/edresources' }
        ];

        // Phone number samples with country codes
        const phoneSamples = [
          '+44 7911 123456',
          '+44 7922 234567',
          '+44 7933 345678',
          '+44 7944 456789',
          '+44 7955 567890'
        ];

        let completed = 0;
        
        // Update each user with random social media and phone data
        rows.forEach((row, index) => {
          const socialMediaIndex = index % socialMediaSamples.length;
          const phoneIndex = index % phoneSamples.length;
          
          const socialMedia = JSON.stringify(socialMediaSamples[socialMediaIndex]);
          const phone = phoneSamples[phoneIndex];

          // Update user_profiles with social media and phone
          db.run(
            'UPDATE user_profiles SET social_media = ?, phone = ? WHERE user_id = ?',
            [socialMedia, phone, row.user_id],
            function(err) {
              completed++;
              
              if (err) {
                console.error(`Error updating user ${row.user_id}:`, err.message);
              } else {
                console.log(`Updated user ${row.user_id} with social media and phone`);
              }
              
              // Close database when all updates are done
              if (completed === rows.length) {
                console.log('All updates completed');
                db.close((err) => {
                  if (err) {
                    console.error('Error closing the database:', err.message);
                  } else {
                    console.log('Database connection closed');
                  }
                });
              }
            }
          );
        });
      });
    });
  });
}); 