const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Helper function to generate a random date within the last year
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a random ISO date string within the last 3 months
function randomRecentDate() {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  return randomDate(threeMonthsAgo, now).toISOString();
}

// Generate a random status
function randomStatus() {
  const statuses = ['pending', 'approved', 'rejected'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Generate a random verification status, with higher probability of "pending"
function randomVerificationStatus() {
  const rand = Math.random();
  if (rand < 0.6) return 'pending';
  if (rand < 0.8) return 'approved';
  return 'rejected';
}

// Generate a random image URL
function randomImageUrl() {
  return `https://picsum.photos/200/300?random=${Math.floor(Math.random() * 1000)}`;
}

async function run() {
  try {
    console.log('Starting to add dashboard sample data...');
    
    // Get the absolute path to the database file
    const dbPath = path.resolve('./database.sqlite');
    
    // Check if the database file exists
    if (!fs.existsSync(dbPath)) {
      console.error(`Database file not found at: ${dbPath}`);
      return;
    }
    
    console.log(`Database file found at: ${dbPath}`);
    
    // Open the database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('Database connection established');
    
    // Get current counts to determine how many entries to add
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    const sessionCount = await db.get('SELECT COUNT(*) as count FROM sessions');
    const activityCount = await db.get('SELECT COUNT(*) as count FROM student_activities');
    
    // Make sure profile_verifications table exists
    try {
      await db.run(`
        CREATE TABLE IF NOT EXISTS profile_verifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          document_url TEXT,
          submitted_at TEXT NOT NULL,
          updated_at TEXT,
          rejection_reason TEXT,
          FOREIGN KEY (student_id) REFERENCES users(id)
        )
      `);
      console.log('Ensured profile_verifications table exists');
    } catch (err) {
      console.error('Error creating profile_verifications table:', err);
    }
    
    // Count pending verifications from all sources
    let pendingVerificationsCount = 0;
    
    try {
      const approvalCount = await db.get('SELECT COUNT(*) as count FROM approvals WHERE status = "pending"');
      pendingVerificationsCount += approvalCount.count;
    } catch (err) {
      console.error('Error counting pending approvals:', err);
    }
    
    try {
      const qualCount = await db.get('SELECT COUNT(*) as count FROM qualifications WHERE verification_status = "pending"');
      pendingVerificationsCount += qualCount.count;
    } catch (err) {
      console.error('Error counting pending qualifications:', err);
    }
    
    try {
      const profileCount = await db.get('SELECT COUNT(*) as count FROM profile_verifications WHERE status = "pending"');
      pendingVerificationsCount += profileCount.count;
    } catch (err) {
      console.error('Error counting pending profile verifications:', err);
    }
    
    console.log(`Current counts - Users: ${userCount.count}, Sessions: ${sessionCount.count}, Activities: ${activityCount.count}, Pending Verifications: ${pendingVerificationsCount}`);
    
    // Add users if needed to reach 20
    if (userCount.count < 20) {
      const usersToAdd = 20 - userCount.count;
      console.log(`Adding ${usersToAdd} users`);
      
      const roles = ['student', 'mentor', 'student', 'student']; // More students than mentors
      
      for (let i = 0; i < usersToAdd; i++) {
        const role = roles[Math.floor(Math.random() * roles.length)];
        const name = `Test ${role.charAt(0).toUpperCase() + role.slice(1)} ${userCount.count + i + 1}`;
        const email = `test.${role}${userCount.count + i + 1}@example.com`;
        
        await db.run(`
          INSERT INTO users (name, email, role, created_at, updated_at) 
          VALUES (?, ?, ?, datetime('now'), datetime('now'))
        `, [name, email, role]);
      }
      
      console.log(`Added ${usersToAdd} users`);
    }
    
    // Get all student IDs for sessions and activities
    const students = await db.all('SELECT id FROM users WHERE role = "student"');
    const studentIds = students.map(s => s.id);
    
    // Add sessions if needed to reach 40
    if (sessionCount.count < 40) {
      const sessionsToAdd = 40 - sessionCount.count;
      console.log(`Adding ${sessionsToAdd} teaching sessions`);
      
      const sessionTitles = [
        'Elementary Math Introduction', 
        'Reading Comprehension Skills', 
        'Basic Science Concepts',
        'Art and Creativity Workshop',
        'Physical Education Activities',
        'Introduction to History',
        'Social Studies Group Discussion',
        'Music and Rhythm Basics',
        'Computer Skills for Beginners',
        'Environmental Education'
      ];
      
      const locations = [
        'Main Classroom', 
        'Science Lab', 
        'Library',
        'Gym',
        'Computer Lab',
        'Art Room',
        'Music Room',
        'Playground',
        'Virtual Classroom'
      ];
      
      for (let i = 0; i < sessionsToAdd; i++) {
        if (studentIds.length === 0) {
          console.log('No student IDs found, cannot add sessions');
          break;
        }
        
        const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
        const title = sessionTitles[Math.floor(Math.random() * sessionTitles.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const status = ['planned', 'completed'][Math.floor(Math.random() * 2)];
        const date = randomRecentDate();
        
        await db.run(`
          INSERT INTO sessions (
            student_id, title, description, location, date, status, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [
          studentId,
          title,
          `Session description for ${title}`,
          location,
          date,
          status
        ]);
      }
      
      console.log(`Added ${sessionsToAdd} teaching sessions`);
    }
    
    // Add activities if needed to reach 42
    if (activityCount.count < 42) {
      const activitiesToAdd = 42 - activityCount.count;
      console.log(`Adding ${activitiesToAdd} professional activities`);
      
      const activityTitles = [
        'Professional Development Workshop',
        'Curriculum Planning Meeting',
        'Parent-Teacher Conference',
        'Staff Training Session',
        'Educational Technology Seminar',
        'Classroom Observation',
        'Department Meeting',
        'Student Assessment Review',
        'Resource Development',
        'Mentorship Session'
      ];
      
      const activityTypes = [
        'workshop',
        'meeting',
        'conference',
        'training',
        'seminar',
        'observation',
        'development'
      ];
      
      for (let i = 0; i < activitiesToAdd; i++) {
        if (studentIds.length === 0) {
          console.log('No student IDs found, cannot add activities');
          break;
        }
        
        const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
        const title = activityTitles[Math.floor(Math.random() * activityTitles.length)];
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const date = randomRecentDate();
        
        try {
          await db.run(`
            INSERT INTO student_activities (
              student_id, title, activity_type, description, date, 
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `, [
            studentId,
            title,
            type,
            `Activity description for ${title}`,
            date
          ]);
        } catch (err) {
          // Try alternative column names if the first approach fails
          try {
            await db.run(`
              INSERT INTO activities (
                student_id, title, type, description, date, 
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `, [
              studentId,
              title,
              type,
              `Activity description for ${title}`,
              date
            ]);
          } catch (innerErr) {
            console.error('Error adding activity with alternative schema:', innerErr);
          }
        }
      }
      
      console.log(`Added ${activitiesToAdd} professional activities`);
    }
    
    // Add pending verifications to reach 15
    if (pendingVerificationsCount < 15) {
      const verificationsToAdd = 15 - pendingVerificationsCount;
      console.log(`Adding ${verificationsToAdd} pending verifications`);
      
      // Distribute across different types
      const profileVerificationsToAdd = Math.ceil(verificationsToAdd / 3);
      const qualificationVerificationsToAdd = Math.ceil(verificationsToAdd / 3);
      const activityVerificationsToAdd = verificationsToAdd - profileVerificationsToAdd - qualificationVerificationsToAdd;
      
      // Add profile verifications
      if (profileVerificationsToAdd > 0) {
        console.log(`Adding ${profileVerificationsToAdd} pending profile verifications`);
        
        for (let i = 0; i < profileVerificationsToAdd; i++) {
          if (studentIds.length === 0) {
            console.log('No student IDs found, cannot add profile verifications');
            break;
          }
          
          const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
          const docUrl = randomImageUrl();
          const date = randomRecentDate();
          
          await db.run(`
            INSERT INTO profile_verifications (
              student_id, status, document_url, submitted_at, updated_at
            ) VALUES (?, 'pending', ?, ?, datetime('now'))
          `, [studentId, docUrl, date]);
        }
      }
      
      // Add qualification verifications
      if (qualificationVerificationsToAdd > 0) {
        console.log(`Adding ${qualificationVerificationsToAdd} pending qualification verifications`);
        
        const qualificationTitles = [
          'Teaching Certificate',
          'First Aid Training',
          'Digital Learning Badge',
          'Classroom Management Certificate',
          'Special Education Training',
          'Educational Leadership Certificate',
          'Language Teaching Qualification',
          'Child Development Diploma'
        ];
        
        for (let i = 0; i < qualificationVerificationsToAdd; i++) {
          if (studentIds.length === 0) {
            console.log('No student IDs found, cannot add qualification verifications');
            break;
          }
          
          const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
          const title = qualificationTitles[Math.floor(Math.random() * qualificationTitles.length)];
          const date = randomRecentDate();
          
          await db.run(`
            INSERT INTO qualifications (
              student_id, title, description, date_obtained, 
              verification_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
          `, [
            studentId,
            title,
            `Qualification description for ${title}`,
            date
          ]);
        }
      }
      
      // Add activity approvals
      if (activityVerificationsToAdd > 0) {
        console.log(`Adding ${activityVerificationsToAdd} pending activity verifications`);
        
        // Get activity IDs
        const activities = await db.all('SELECT id FROM student_activities LIMIT 20');
        const activityIds = activities.map(a => a.id);
        
        if (activityIds.length === 0) {
          console.log('No activity IDs found, cannot add activity verifications');
        } else {
          for (let i = 0; i < activityVerificationsToAdd; i++) {
            if (studentIds.length === 0 || activityIds.length === 0) {
              console.log('No student or activity IDs found, cannot add activity verifications');
              break;
            }
            
            const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
            const activityId = activityIds[Math.floor(Math.random() * activityIds.length)];
            const date = randomRecentDate();
            
            await db.run(`
              INSERT INTO approvals (
                student_id, item_id, item_type, status, 
                created_at, updated_at
              ) VALUES (?, ?, 'activity', 'pending', datetime('now'), datetime('now'))
            `, [studentId, activityId]);
          }
        }
      }
      
      console.log(`Added verifications - Profile: ${profileVerificationsToAdd}, Qualifications: ${qualificationVerificationsToAdd}, Activities: ${activityVerificationsToAdd}`);
    }
    
    console.log('Sample data update complete!');
    
    // Verify final counts
    const finalUserCount = await db.get('SELECT COUNT(*) as count FROM users');
    const finalSessionCount = await db.get('SELECT COUNT(*) as count FROM sessions');
    let finalActivityCount = 0;
    
    try {
      const count = await db.get('SELECT COUNT(*) as count FROM student_activities');
      finalActivityCount = count.count;
    } catch (err) {
      try {
        const count = await db.get('SELECT COUNT(*) as count FROM activities');
        finalActivityCount = count.count;
      } catch (innerErr) {
        console.error('Error counting activities:', innerErr);
      }
    }
    
    let finalPendingVerificationsCount = 0;
    
    try {
      const approvalCount = await db.get('SELECT COUNT(*) as count FROM approvals WHERE status = "pending"');
      finalPendingVerificationsCount += approvalCount.count;
    } catch (err) {
      console.error('Error counting pending approvals:', err);
    }
    
    try {
      const qualCount = await db.get('SELECT COUNT(*) as count FROM qualifications WHERE verification_status = "pending"');
      finalPendingVerificationsCount += qualCount.count;
    } catch (err) {
      console.error('Error counting pending qualifications:', err);
    }
    
    try {
      const profileCount = await db.get('SELECT COUNT(*) as count FROM profile_verifications WHERE status = "pending"');
      finalPendingVerificationsCount += profileCount.count;
    } catch (err) {
      console.error('Error counting pending profile verifications:', err);
    }
    
    console.log(`Final counts - Users: ${finalUserCount.count}, Sessions: ${finalSessionCount.count}, Activities: ${finalActivityCount}, Pending Verifications: ${finalPendingVerificationsCount}`);
    
    await db.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

run().catch(err => console.error('Uncaught error:', err)); 