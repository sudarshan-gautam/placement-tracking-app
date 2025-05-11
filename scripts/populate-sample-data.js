const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function populateSampleData() {
  try {
    console.log('Starting sample data population...');
    
    // Open database connection
    const dbPath = path.resolve('./database.sqlite');
    console.log('Using database at:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Get existing users
    console.log('Fetching existing users...');
    const users = await db.all("SELECT id, role, name FROM users");
    
    if (users.length === 0) {
      console.log('No users found. Please run init-database.js first.');
      return;
    }
    
    console.log(`Found ${users.length} users.`);
    
    // Prepare sample education data
    for (const user of users) {
      console.log(`Adding sample education and experience for ${user.name} (${user.role})`);
      
      // Add sample education
      if (user.role === 'student') {
        // Check if the user already has education entries
        const existingEducation = await db.get("SELECT COUNT(*) as count FROM user_education WHERE user_id = ?", user.id);
        
        if (existingEducation.count === 0) {
          console.log(`Adding education for student ${user.name}`);
          
          // Recent education
          await db.run(`
            INSERT INTO user_education (
              id, user_id, institution, degree, field_of_study, 
              start_date, end_date, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'University of Education', 
              'Bachelor of Arts', 'Education', 
              '2018-09-01', '2022-06-30', 
              'Focused on primary education techniques and child development.', 
              datetime('now'), datetime('now')
            )
          `, user.id);
          
          // Earlier education
          await db.run(`
            INSERT INTO user_education (
              id, user_id, institution, degree, field_of_study, 
              start_date, end_date, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'Community College', 
              'Associate Degree', 'General Studies', 
              '2016-09-01', '2018-05-30', 
              'General education with focus on social sciences.', 
              datetime('now'), datetime('now')
            )
          `, user.id);
        } else {
          console.log(`Student ${user.name} already has education entries.`);
        }
      } else if (user.role === 'mentor') {
        // Check if the user already has education entries
        const existingEducation = await db.get("SELECT COUNT(*) as count FROM user_education WHERE user_id = ?", user.id);
        
        if (existingEducation.count === 0) {
          console.log(`Adding education for mentor ${user.name}`);
          
          // Add education for mentor
          await db.run(`
            INSERT INTO user_education (
              id, user_id, institution, degree, field_of_study, 
              start_date, end_date, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'University of Leadership', 
              'Master of Education', 'Educational Leadership', 
              '2010-09-01', '2012-06-30', 
              'Specialized in educational leadership and mentoring.', 
              datetime('now'), datetime('now')
            )
          `, user.id);
          
          await db.run(`
            INSERT INTO user_education (
              id, user_id, institution, degree, field_of_study, 
              start_date, end_date, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'State University', 
              'Bachelor of Science', 'Education', 
              '2006-09-01', '2010-05-30', 
              'Foundations of education and teaching methodologies.', 
              datetime('now'), datetime('now')
            )
          `, user.id);
        } else {
          console.log(`Mentor ${user.name} already has education entries.`);
        }
      } else if (user.role === 'admin') {
        // Check if the user already has education entries
        const existingEducation = await db.get("SELECT COUNT(*) as count FROM user_education WHERE user_id = ?", user.id);
        
        if (existingEducation.count === 0) {
          console.log(`Adding education for admin ${user.name}`);
          
          // Add education for admin
          await db.run(`
            INSERT INTO user_education (
              id, user_id, institution, degree, field_of_study, 
              start_date, end_date, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'Tech University', 
              'Master of Business Administration', 'Education Management', 
              '2008-09-01', '2010-06-30', 
              'Focus on educational systems management and administration.', 
              datetime('now'), datetime('now')
            )
          `, user.id);
        } else {
          console.log(`Admin ${user.name} already has education entries.`);
        }
      }
      
      // Add sample experience
      if (user.role === 'student') {
        // Check if the user already has experience entries
        const existingExperience = await db.get("SELECT COUNT(*) as count FROM user_experience WHERE user_id = ?", user.id);
        
        if (existingExperience.count === 0) {
          console.log(`Adding experience for student ${user.name}`);
          
          // Recent internship
          await db.run(`
            INSERT INTO user_experience (
              id, user_id, title, company, location,
              start_date, end_date, current, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'Teaching Assistant', 'Elementary School', 'London',
              '2022-01-15', '2022-06-30', 0, 
              'Assisted lead teachers with classroom management and lesson preparation.',
              datetime('now'), datetime('now')
            )
          `, user.id);
          
          // Volunteer work
          await db.run(`
            INSERT INTO user_experience (
              id, user_id, title, company, location,
              start_date, end_date, current, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'Volunteer Tutor', 'Community Learning Center', 'London',
              '2021-06-01', '2021-08-30', 0, 
              'Provided after-school tutoring to elementary school students.',
              datetime('now'), datetime('now')
            )
          `, user.id);
        } else {
          console.log(`Student ${user.name} already has experience entries.`);
        }
      } else if (user.role === 'mentor') {
        // Check if the user already has experience entries
        const existingExperience = await db.get("SELECT COUNT(*) as count FROM user_experience WHERE user_id = ?", user.id);
        
        if (existingExperience.count === 0) {
          console.log(`Adding experience for mentor ${user.name}`);
          
          // Current job
          await db.run(`
            INSERT INTO user_experience (
              id, user_id, title, company, location,
              start_date, end_date, current, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'Senior Teacher', 'High School Academy', 'Manchester',
              '2018-08-01', NULL, 1, 
              'Lead teacher for mathematics and science programs. Mentor for new teachers.',
              datetime('now'), datetime('now')
            )
          `, user.id);
          
          // Previous job
          await db.run(`
            INSERT INTO user_experience (
              id, user_id, title, company, location,
              start_date, end_date, current, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'Teacher', 'Middle School', 'Birmingham',
              '2013-09-01', '2018-07-31', 0, 
              'Taught mathematics and science to students in grades 6-8.',
              datetime('now'), datetime('now')
            )
          `, user.id);
        } else {
          console.log(`Mentor ${user.name} already has experience entries.`);
        }
      } else if (user.role === 'admin') {
        // Check if the user already has experience entries
        const existingExperience = await db.get("SELECT COUNT(*) as count FROM user_experience WHERE user_id = ?", user.id);
        
        if (existingExperience.count === 0) {
          console.log(`Adding experience for admin ${user.name}`);
          
          // Current admin job
          await db.run(`
            INSERT INTO user_experience (
              id, user_id, title, company, location,
              start_date, end_date, current, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'Education System Administrator', 'Department of Education', 'London',
              '2015-01-15', NULL, 1, 
              'Overseeing educational program implementation and system administration.',
              datetime('now'), datetime('now')
            )
          `, user.id);
          
          // Previous admin job
          await db.run(`
            INSERT INTO user_experience (
              id, user_id, title, company, location,
              start_date, end_date, current, description, created_at, updated_at
            ) VALUES (
              lower(hex(randomblob(16))), ?, 'Assistant Principal', 'Secondary School', 'Oxford',
              '2010-08-01', '2014-12-31', 0, 
              'Assisted with school administration, staff management, and curriculum development.',
              datetime('now'), datetime('now')
            )
          `, user.id);
        } else {
          console.log(`Admin ${user.name} already has experience entries.`);
        }
      }
      
      // Ensure user profile exists with links to education/experience
      const userProfile = await db.get("SELECT * FROM user_profiles WHERE user_id = ?", user.id);
      
      if (!userProfile) {
        console.log(`Creating user profile for ${user.name}`);
        
        // Sample profile data based on role
        let education = '';
        let graduation_year = '';
        let preferred_job_type = '';
        let preferred_location = '';
        let bio = '';
        
        if (user.role === 'student') {
          education = 'Bachelor of Arts in Education';
          graduation_year = '2022';
          preferred_job_type = 'Full-time';
          preferred_location = 'London';
          bio = 'Passionate about education and helping students learn and grow. Recently graduated with a focus on primary education.';
        } else if (user.role === 'mentor') {
          education = 'Master of Education';
          graduation_year = '2012';
          preferred_job_type = 'Senior Position';
          preferred_location = 'Manchester';
          bio = 'Experienced educator with a passion for mentoring new teachers. Specializing in mathematics and science education.';
        } else {
          education = 'Master of Business Administration';
          graduation_year = '2010';
          preferred_job_type = 'Administration';
          preferred_location = 'London';
          bio = 'Education administrator with experience in system management and program implementation.';
        }
        
        // Insert profile
        await db.run(`
          INSERT INTO user_profiles (
            user_id, bio, education, graduation_year, 
            preferred_job_type, preferred_location, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
          )
        `, user.id, bio, education, graduation_year, preferred_job_type, preferred_location);
      } else {
        console.log(`User profile for ${user.name} already exists.`);
      }
      
      // Add skills for each user
      const existingSkills = await db.get("SELECT COUNT(*) as count FROM user_skills WHERE user_id = ?", user.id);
      
      if (existingSkills.count === 0) {
        console.log(`Adding skills for ${user.name}`);
        
        if (user.role === 'student') {
          // Student skills
          await db.run(`
            INSERT INTO user_skills (user_id, skill, level, years_experience)
            VALUES 
            (?, 'Classroom Management', 'intermediate', 1),
            (?, 'Lesson Planning', 'beginner', 1),
            (?, 'Student Assessment', 'beginner', 1)
          `, user.id, user.id, user.id);
        } else if (user.role === 'mentor') {
          // Mentor skills
          await db.run(`
            INSERT INTO user_skills (user_id, skill, level, years_experience)
            VALUES 
            (?, 'Classroom Management', 'expert', 8),
            (?, 'Curriculum Development', 'advanced', 5),
            (?, 'Student Assessment', 'expert', 8),
            (?, 'Teacher Mentoring', 'advanced', 4)
          `, user.id, user.id, user.id, user.id);
        } else {
          // Admin skills
          await db.run(`
            INSERT INTO user_skills (user_id, skill, level, years_experience)
            VALUES 
            (?, 'Educational Administration', 'expert', 10),
            (?, 'Staff Management', 'advanced', 8),
            (?, 'Curriculum Development', 'intermediate', 5),
            (?, 'Budget Management', 'advanced', 7)
          `, user.id, user.id, user.id, user.id);
        }
      } else {
        console.log(`Skills for ${user.name} already exist.`);
      }
    }
    
    console.log('Sample data population completed successfully!');
    await db.close();
    
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
}

// Run the function
populateSampleData(); 