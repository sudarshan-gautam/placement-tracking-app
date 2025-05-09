const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to database file
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Common education job skills
const educationSkills = [
  'Classroom Management',
  'Curriculum Planning',
  'Assessment',
  'Communication',
  'Differentiated Instruction',
  'Educational Technology',
  'Special Needs Education',
  'Behavior Management',
  'Lesson Planning',
  'Student Engagement',
  'Critical Thinking',
  'Subject Knowledge',
  'Educational Psychology',
  'Group Facilitation',
  'Inclusive Education',
  'Child Development',
  'ESL/EFL Teaching',
  'Parent Communication',
  'Educational Leadership',
  'Cultural Awareness',
  'Online Learning',
  'Project-Based Learning',
  'Formative Assessment',
  'Educational Research',
  'Curriculum Development',
  'STEM Education',
  'Digital Literacy',
  'Educational Administration',
  'Early Childhood Education',
  'Student Support',
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Languages',
  'Physical Education',
  'Music',
  'Art',
  'Drama'
];

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error(`Database file not found at: ${dbPath}`);
  process.exit(1);
}

// Connect to the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Function to assign random skills to a job
async function assignRandomSkillsToJob(jobId, count = 4) {
  return new Promise((resolve, reject) => {
    // Get random skills
    const shuffled = educationSkills.sort(() => 0.5 - Math.random());
    const selectedSkills = shuffled.slice(0, count);
    
    // Begin transaction
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        return reject(err);
      }
      
      // Delete existing skills for this job
      db.run('DELETE FROM job_skills WHERE job_id = ?', [jobId], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return reject(err);
        }
        
        // Insert new skills
        const stmt = db.prepare('INSERT INTO job_skills (job_id, skill) VALUES (?, ?)');
        
        let inserted = 0;
        for (const skill of selectedSkills) {
          stmt.run(jobId, skill, function(err) {
            if (err) {
              console.error(`Error inserting skill "${skill}" for job ${jobId}:`, err.message);
              db.run('ROLLBACK');
              stmt.finalize();
              return reject(err);
            }
            
            inserted++;
            if (inserted === selectedSkills.length) {
              stmt.finalize();
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                resolve(selectedSkills);
              });
            }
          });
        }
      });
    });
  });
}

// Main function
async function populateJobSkills() {
  try {
    // Check if job_skills table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='job_skills'", async (err, table) => {
      if (err) {
        console.error('Error checking if table exists:', err.message);
        db.close();
        return;
      }
      
      // Create table if it doesn't exist
      if (!table) {
        console.log('Creating job_skills table...');
        db.run(`
          CREATE TABLE job_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT NOT NULL,
            skill TEXT NOT NULL,
            FOREIGN KEY (job_id) REFERENCES jobs(id),
            UNIQUE(job_id, skill)
          )
        `, async (err) => {
          if (err) {
            console.error('Error creating table:', err.message);
            db.close();
            return;
          }
          await processJobs();
        });
      } else {
        await processJobs();
      }
    });
  } catch (error) {
    console.error('Error in populateJobSkills:', error);
    db.close();
  }
}

// Process all jobs
async function processJobs() {
  console.log('Fetching jobs...');
  db.all("SELECT id, title FROM jobs", async (err, jobs) => {
    if (err) {
      console.error('Error fetching jobs:', err.message);
      db.close();
      return;
    }
    
    console.log(`Found ${jobs.length} jobs.`);
    
    // Process each job
    for (const job of jobs) {
      try {
        console.log(`Assigning skills to job: ${job.title}...`);
        const skillCount = 3 + Math.floor(Math.random() * 5); // 3-7 skills per job
        const skills = await assignRandomSkillsToJob(job.id, skillCount);
        console.log(`✓ Assigned ${skills.length} skills to job: ${job.title}`);
      } catch (error) {
        console.error(`Error assigning skills to job ${job.title}:`, error);
      }
    }
    
    console.log('Job skills population complete.');
    db.close();
  });
}

// Run the script
populateJobSkills(); 