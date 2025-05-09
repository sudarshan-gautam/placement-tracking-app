const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');

async function main() {
  try {
    console.log('Starting to populate user skills...');
    
    // Check if database file exists
    if (!fs.existsSync('./database.sqlite')) {
      console.error('Database file not found. Please create the database first.');
      process.exit(1);
    }
    
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
    
    console.log('SQLite connection successful');
    
    // Create user_skills table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        skill TEXT NOT NULL,
        level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
        years_experience INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, skill)
      )
    `);
    
    // Create user_profile table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        biography TEXT,
        education TEXT,
        graduation_year INTEGER,
        preferred_job_type TEXT,
        preferred_location TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id)
      )
    `);
    
    // Get all users
    const users = await db.all('SELECT id, role, name, email FROM users');
    
    if (users.length === 0) {
      console.log('No users found in the database. Please add users first.');
      process.exit(0);
    }
    
    console.log(`Found ${users.length} users in the database.`);
    
    // Clear existing skills and profiles
    await db.exec('DELETE FROM user_skills');
    await db.exec('DELETE FROM user_profiles');
    
    console.log('Cleared existing user skills and profiles.');
    
    // Define skills by role
    const skillsByRole = {
      student: [
        { skill: 'Classroom Management', levels: ['beginner', 'intermediate'] },
        { skill: 'Curriculum Planning', levels: ['beginner', 'intermediate'] },
        { skill: 'Differentiated Instruction', levels: ['beginner', 'intermediate'] },
        { skill: 'Assessment', levels: ['beginner', 'intermediate'] },
        { skill: 'Lesson Planning', levels: ['beginner', 'intermediate'] },
        { skill: 'Educational Technology', levels: ['beginner', 'intermediate', 'advanced'] },
        { skill: 'Project-Based Learning', levels: ['beginner', 'intermediate'] },
        { skill: 'Communication', levels: ['intermediate', 'advanced'] },
        { skill: 'Child Development', levels: ['beginner', 'intermediate'] },
        { skill: 'Inclusive Education', levels: ['beginner', 'intermediate'] },
        { skill: 'Special Education', levels: ['beginner', 'intermediate'] },
        { skill: 'Behavior Management', levels: ['beginner', 'intermediate'] },
        { skill: 'Digital Literacy', levels: ['intermediate', 'advanced'] },
        { skill: 'STEM Education', levels: ['beginner', 'intermediate'] },
      ],
      mentor: [
        { skill: 'Mentoring', levels: ['advanced', 'expert'] },
        { skill: 'Coaching', levels: ['advanced', 'expert'] },
        { skill: 'Teacher Development', levels: ['advanced', 'expert'] },
        { skill: 'Curriculum Design', levels: ['advanced', 'expert'] },
        { skill: 'Assessment Development', levels: ['advanced', 'expert'] },
        { skill: 'Educational Leadership', levels: ['advanced', 'expert'] },
        { skill: 'Professional Development', levels: ['advanced', 'expert'] },
        { skill: 'Education Policy', levels: ['intermediate', 'advanced'] },
        { skill: 'Research', levels: ['intermediate', 'advanced', 'expert'] },
        { skill: 'Data Analysis', levels: ['intermediate', 'advanced'] },
        { skill: 'Program Evaluation', levels: ['intermediate', 'advanced'] },
      ],
      admin: [
        { skill: 'Educational Administration', levels: ['advanced', 'expert'] },
        { skill: 'School Management', levels: ['advanced', 'expert'] },
        { skill: 'Policy Development', levels: ['advanced', 'expert'] },
        { skill: 'Budget Management', levels: ['advanced', 'expert'] },
        { skill: 'Staff Development', levels: ['advanced', 'expert'] },
        { skill: 'Strategic Planning', levels: ['advanced', 'expert'] },
        { skill: 'Accreditation', levels: ['advanced', 'expert'] },
        { skill: 'Compliance', levels: ['advanced', 'expert'] },
        { skill: 'Stakeholder Engagement', levels: ['advanced', 'expert'] },
        { skill: 'Crisis Management', levels: ['advanced', 'expert'] },
      ]
    };
    
    // Educational backgrounds by role
    const educationByRole = {
      student: ['Bachelor of Education', 'PGCE', 'Bachelor of Arts in Education', 'Bachelor of Science in Education'],
      mentor: ['Master of Education', 'Master of Arts in Teaching', 'Doctorate in Education'],
      admin: ['Master of Educational Administration', 'MBA', 'PhD in Educational Leadership']
    };
    
    // Locations
    const locations = ['London, UK', 'Manchester, UK', 'Birmingham, UK', 'Leeds, UK', 'Liverpool, UK', 'Bristol, UK', 'Remote'];
    
    // Job types
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
    
    // Add skills and profiles for each user
    for (const user of users) {
      const roleSkills = skillsByRole[user.role] || skillsByRole.student;
      
      // Determine how many skills to add (random between 3-8)
      const numSkills = Math.floor(Math.random() * 6) + 3;
      
      // Shuffle skills and take a subset
      const shuffledSkills = [...roleSkills].sort(() => 0.5 - Math.random()).slice(0, numSkills);
      
      console.log(`Adding ${numSkills} skills for ${user.name} (${user.role})...`);
      
      // Add skills for this user
      for (const skillInfo of shuffledSkills) {
        const level = skillInfo.levels[Math.floor(Math.random() * skillInfo.levels.length)];
        const yearsExperience = Math.floor(Math.random() * 5) + 1;
        
        await db.run(
          'INSERT INTO user_skills (user_id, skill, level, years_experience) VALUES (?, ?, ?, ?)',
          [user.id, skillInfo.skill, level, yearsExperience]
        );
      }
      
      // Add user profile
      const education = educationByRole[user.role] ? 
        educationByRole[user.role][Math.floor(Math.random() * educationByRole[user.role].length)] : 
        'Bachelor of Education';
      
      const graduationYear = 2020 + Math.floor(Math.random() * 4);
      const preferredJobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
      const preferredLocation = locations[Math.floor(Math.random() * locations.length)];
      const biography = `${user.name} is a ${user.role} with expertise in ${shuffledSkills[0].skill} and ${shuffledSkills[1].skill}.`;
      
      await db.run(
        'INSERT INTO user_profiles (user_id, biography, education, graduation_year, preferred_job_type, preferred_location) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, biography, education, graduationYear, preferredJobType, preferredLocation]
      );
    }
    
    console.log('Successfully populated user skills and profiles.');
    
    // Get count of added skills
    const { count } = await db.get('SELECT COUNT(*) as count FROM user_skills');
    console.log(`Added ${count} skills across ${users.length} users.`);
    
    await db.close();
  } catch (error) {
    console.error('Error populating user skills:', error);
    process.exit(1);
  }
}

main(); 