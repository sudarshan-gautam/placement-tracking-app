const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to database file
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Common education-related skills
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
  'Student Support'
];

// Add other domain skills
const techSkills = [
  'Programming',
  'Web Development',
  'Database Management',
  'UI/UX Design',
  'Office Applications',
  'Digital Literacy'
];

const softSkills = [
  'Leadership',
  'Teamwork',
  'Problem Solving',
  'Time Management',
  'Adaptability',
  'Critical Thinking',
  'Emotional Intelligence',
  'Interpersonal Skills',
  'Conflict Resolution'
];

const allSkills = [...educationSkills, ...techSkills, ...softSkills];

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

// Function to assign random skills to a student
async function assignRandomSkillsToStudent(userId, count = 5) {
  return new Promise((resolve, reject) => {
    // Get random skills
    const shuffled = allSkills.sort(() => 0.5 - Math.random());
    const selectedSkills = shuffled.slice(0, count);
    
    // Begin transaction
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        return reject(err);
      }
      
      // Delete existing skills for this user
      db.run('DELETE FROM user_skills WHERE user_id = ?', [userId], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return reject(err);
        }
        
        // Insert new skills
        const stmt = db.prepare('INSERT INTO user_skills (user_id, skill, level, years_experience) VALUES (?, ?, ?, ?)');
        
        let inserted = 0;
        for (const skill of selectedSkills) {
          const level = ['beginner', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)];
          const yearsExperience = Math.floor(Math.random() * 5);
          
          stmt.run(userId, skill, level, yearsExperience, function(err) {
            if (err) {
              console.error(`Error inserting skill "${skill}" for user ${userId}:`, err.message);
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
async function populateSkills() {
  try {
    // Check if user_skills table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='user_skills'", async (err, table) => {
      if (err) {
        console.error('Error checking if table exists:', err.message);
        db.close();
        return;
      }
      
      // Create table if it doesn't exist
      if (!table) {
        console.log('Creating user_skills table...');
        db.run(`
          CREATE TABLE user_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            skill TEXT NOT NULL,
            level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
            years_experience INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, skill)
          )
        `, async (err) => {
          if (err) {
            console.error('Error creating table:', err.message);
            db.close();
            return;
          }
          await processStudents();
        });
      } else {
        await processStudents();
      }
    });
  } catch (error) {
    console.error('Error in populateSkills:', error);
    db.close();
  }
}

// Process all students
async function processStudents() {
  console.log('Fetching students...');
  db.all("SELECT id, name, email FROM users WHERE role = 'student'", async (err, students) => {
    if (err) {
      console.error('Error fetching students:', err.message);
      db.close();
      return;
    }
    
    console.log(`Found ${students.length} students.`);
    
    // Process each student
    for (const student of students) {
      try {
        console.log(`Assigning skills to ${student.name} (${student.email})...`);
        const skillCount = 5 + Math.floor(Math.random() * 6); // 5-10 skills per student
        const skills = await assignRandomSkillsToStudent(student.id, skillCount);
        console.log(`✓ Assigned ${skills.length} skills to ${student.name}`);
      } catch (error) {
        console.error(`Error assigning skills to ${student.name}:`, error);
      }
    }
    
    console.log('Skills population complete.');
    db.close();
  });
}

// Run the script
populateSkills(); 