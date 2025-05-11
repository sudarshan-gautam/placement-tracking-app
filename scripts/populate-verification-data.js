/**
 * Script to populate verification tables with sample data
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Connect to the database
const db = new sqlite3.Database(
  path.join(__dirname, '..', 'database.sqlite'),
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error('Failed to connect to the database:', err.message);
      process.exit(1);
    }
    console.log('Connected to the database');
  }
);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON', (err) => {
  if (err) {
    console.error('Failed to enable foreign keys:', err.message);
    process.exit(1);
  }
});

// Main function to orchestrate data population
async function populateData() {
  try {
    // Get users
    const users = await getUsers();
    if (!users.students.length || !users.mentors.length) {
      console.error('Need at least one student and one mentor to populate data');
      process.exit(1);
    }

    // Add sample qualifications
    await addQualifications(users.students);
    
    // Add sample sessions
    await addSessions(users.students);
    
    // Add sample activities
    await addActivities(users.students);
    
    // Add sample competencies if needed
    const competencies = await getCompetencies();
    if (competencies.length === 0) {
      await addCompetencies();
    }
    
    // Add student competencies
    await addStudentCompetencies(users.students);
    
    // Add profile verifications
    await addProfileVerifications(users.students);
    
    // Verify some items by mentors
    await verifyRandomItems(users.mentors);

    console.log('Successfully populated verification data!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating data:', error);
    process.exit(1);
  }
}

// Get users from the database
function getUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, name, email, role FROM users', (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const students = rows.filter(user => user.role === 'student');
      const mentors = rows.filter(user => user.role === 'mentor');
      const admins = rows.filter(user => user.role === 'admin');
      
      resolve({ students, mentors, admins });
    });
  });
}

// Get competencies from the database
function getCompetencies() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, name, category FROM competencies', (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// Add qualifications for each student
function addQualifications(students) {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if we already have qualifications
      const { count } = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM qualifications', (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        });
      });
      
      if (count > 0) {
        console.log(`Qualifications already exist (${count} records), skipping...`);
        resolve();
        return;
      }
      
      console.log('Adding qualifications...');
      
      // Sample qualifications data
      const qualificationsData = [
        {
          title: 'Bachelor of Education',
          issuing_organization: 'University of Cambridge',
          description: 'Primary Education specialization',
          date_obtained: '2020-06-15',
          expiry_date: '2030-06-15',
          certificate_url: 'https://example.com/cert1',
          type: 'degree'
        },
        {
          title: 'Teaching English as a Foreign Language (TEFL)',
          issuing_organization: 'British Council',
          description: '120-hour certification course',
          date_obtained: '2021-03-10',
          expiry_date: '2026-03-10',
          certificate_url: 'https://example.com/cert2',
          type: 'certificate'
        },
        {
          title: 'First Aid at Work',
          issuing_organization: 'Red Cross',
          description: 'Standard 3-day course',
          date_obtained: '2022-01-20',
          expiry_date: '2025-01-20',
          certificate_url: 'https://example.com/cert3',
          type: 'certificate'
        },
        {
          title: 'Master of Education',
          issuing_organization: 'University of Oxford',
          description: 'Educational Leadership focus',
          date_obtained: '2019-07-22',
          expiry_date: null,
          certificate_url: 'https://example.com/cert4',
          type: 'degree'
        },
        {
          title: 'Special Educational Needs Coordination',
          issuing_organization: 'National College for Teaching and Leadership',
          description: 'Specialized training for SEN coordination',
          date_obtained: '2022-05-18',
          expiry_date: '2027-05-18',
          certificate_url: 'https://example.com/cert5',
          type: 'certificate'
        }
      ];
      
      // Add 2-3 random qualifications for each student with different verification statuses
      const statuses = ['pending', 'verified', 'rejected', 'pending', 'pending']; // Weighted towards pending
      const stmt = db.prepare(`
        INSERT INTO qualifications (
          id, student_id, title, issuing_organization, description, 
          date_obtained, expiry_date, certificate_url, type, 
          verification_status, feedback, verified_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const student of students) {
        // Decide how many qualifications for this student (2-3)
        const numQuals = Math.floor(Math.random() * 2) + 2; 
        const qualsIndices = shuffleArray([...Array(qualificationsData.length).keys()]).slice(0, numQuals);
        
        for (const idx of qualsIndices) {
          const qual = qualificationsData[idx];
          const id = uuidv4();
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          // Only add feedback and verified_by if not pending
          let feedback = null;
          let verifiedBy = null;
          
          if (status === 'verified') {
            feedback = 'Verification completed successfully. All documentation is in order.';
            // We'll set verified_by later in the verifyRandomItems function
          } else if (status === 'rejected') {
            feedback = 'Please provide additional documentation as the certificate seems incomplete.';
            // We'll set verified_by later in the verifyRandomItems function
          }
          
          stmt.run(
            id, 
            student.id, 
            qual.title, 
            qual.issuing_organization, 
            qual.description,
            qual.date_obtained,
            qual.expiry_date,
            qual.certificate_url,
            qual.type,
            status,
            feedback,
            verifiedBy
          );
        }
      }
      
      stmt.finalize();
      console.log('Qualifications added successfully');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Add sessions for each student
function addSessions(students) {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if we already have sessions
      const { count } = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM sessions', (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        });
      });
      
      if (count > 0) {
        console.log(`Sessions already exist (${count} records), skipping...`);
        resolve();
        return;
      }
      
      console.log('Adding sessions...');
      
      // Sample sessions data
      const sessionsData = [
        {
          title: 'Initial Placement Planning',
          description: 'Session to discuss placement goals and expectations',
          status: 'completed'
        },
        {
          title: 'Mid-term Progress Review',
          description: 'Discussion of progress and adjustments to placement plan',
          status: 'completed'
        },
        {
          title: 'Teaching Technique Workshop',
          description: 'Hands-on workshop focusing on modern teaching techniques',
          status: 'completed'
        },
        {
          title: 'End of Term Evaluation',
          description: 'Comprehensive review of placement achievements',
          status: 'completed'
        },
        {
          title: 'Career Development Planning',
          description: 'Discussing future career paths and opportunities',
          status: 'planned'
        }
      ];
      
      // Add 2-3 random sessions for each student
      const sessionStmt = db.prepare(`
        INSERT INTO sessions (
          id, student_id, title, description, date, start_time, end_time,
          location, status, reflection, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      const verificationStmt = db.prepare(`
        INSERT INTO session_verifications (
          id, session_id, verification_status, verified_by, feedback,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      for (const student of students) {
        // Decide how many sessions for this student (2-4)
        const numSessions = Math.floor(Math.random() * 3) + 2;
        const sessionIndices = shuffleArray([...Array(sessionsData.length).keys()]).slice(0, numSessions);
        
        // Generate dates spread over the last few months
        const dates = generatePastDates(numSessions, 120);
        
        for (let i = 0; i < sessionIndices.length; i++) {
          const session = sessionsData[sessionIndices[i]];
          const sessionId = uuidv4();
          const date = dates[i];
          
          // Generate random time between 9am and 5pm
          const hour = Math.floor(Math.random() * 8) + 9;
          const startTime = `${hour.toString().padStart(2, '0')}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:30`;
          
          // Random location
          const locations = ['Room 101', 'Virtual', 'Library', 'Conference Room', 'Teacher\'s Lounge'];
          const location = locations[Math.floor(Math.random() * locations.length)];
          
          // Add reflection if completed
          let reflection = null;
          if (session.status === 'completed') {
            reflection = 'This session was productive and provided valuable insights. We discussed several key aspects of teaching practice and identified areas for improvement.';
          }
          
          sessionStmt.run(
            sessionId,
            student.id,
            session.title,
            session.description,
            date,
            startTime,
            endTime,
            location,
            session.status,
            reflection
          );
          
          // Add verification if session is completed
          if (session.status === 'completed') {
            const verificationId = uuidv4();
            const statuses = ['pending', 'pending', 'pending', 'verified', 'rejected'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Feedback based on status
            let feedback = null;
            if (status === 'verified') {
              feedback = 'Session verified successfully. Good reflection notes.';
            } else if (status === 'rejected') {
              feedback = 'Please provide more detailed reflection on outcomes from this session.';
            }
            
            verificationStmt.run(
              verificationId,
              sessionId,
              status,
              null, // verified_by will be set later
              feedback
            );
          }
        }
      }
      
      sessionStmt.finalize();
      verificationStmt.finalize();
      console.log('Sessions added successfully');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Add activities for each student
function addActivities(students) {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if we already have activities
      const { count } = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM activities', (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        });
      });
      
      if (count > 0) {
        console.log(`Activities already exist (${count} records), skipping...`);
        resolve();
        return;
      }
      
      console.log('Adding activities...');
      
      // Sample activities data
      const activitiesData = [
        {
          title: 'Classroom Observation',
          description: 'Observed experienced teacher delivering mathematics lesson',
          activity_type: 'workshop',
          duration_minutes: 90
        },
        {
          title: 'Lesson Planning Workshop',
          description: 'Participated in collaborative lesson planning',
          activity_type: 'workshop',
          duration_minutes: 120
        },
        {
          title: 'Student Assessment Research',
          description: 'Researched modern assessment techniques and their effectiveness',
          activity_type: 'research',
          duration_minutes: 180
        },
        {
          title: 'Parent Communication Project',
          description: 'Developed guidelines for effective parent-teacher communication',
          activity_type: 'project',
          duration_minutes: 240
        },
        {
          title: 'Inclusive Education Coursework',
          description: 'Completed online course on inclusive education practices',
          activity_type: 'coursework',
          duration_minutes: 300
        },
        {
          title: 'Teaching Resource Creation',
          description: 'Created digital resources for science teaching',
          activity_type: 'project',
          duration_minutes: 150
        }
      ];
      
      // Add 3-5 activities for each student
      const activityStmt = db.prepare(`
        INSERT INTO activities (
          id, student_id, title, description, activity_type, date_completed,
          duration_minutes, evidence_url, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      const verificationStmt = db.prepare(`
        INSERT INTO activity_verifications (
          id, activity_id, verification_status, verified_by, feedback,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      for (const student of students) {
        // Decide how many activities for this student (3-5)
        const numActivities = Math.floor(Math.random() * 3) + 3;
        const indices = shuffleArray([...Array(activitiesData.length).keys()]).slice(0, numActivities);
        
        // Generate dates spread over the last few months
        const dates = generatePastDates(numActivities, 90);
        
        for (let i = 0; i < indices.length; i++) {
          const activity = activitiesData[indices[i]];
          const activityId = uuidv4();
          const date = dates[i];
          
          // Random status
          const statuses = ['submitted', 'completed'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          // Evidence URL
          const evidenceUrl = `https://example.com/evidence/${activityId}`;
          
          activityStmt.run(
            activityId,
            student.id,
            activity.title,
            activity.description,
            activity.activity_type,
            date,
            activity.duration_minutes,
            evidenceUrl,
            status
          );
          
          // Add verification
          const verificationId = uuidv4();
          const verificationStatuses = ['pending', 'pending', 'pending', 'verified', 'rejected'];
          const verificationStatus = verificationStatuses[Math.floor(Math.random() * verificationStatuses.length)];
          
          // Feedback based on status
          let feedback = null;
          if (verificationStatus === 'verified') {
            feedback = 'Activity verified successfully. Good documentation provided.';
          } else if (verificationStatus === 'rejected') {
            feedback = 'Please provide more evidence for this activity.';
          }
          
          verificationStmt.run(
            verificationId,
            activityId,
            verificationStatus,
            null, // verified_by will be set later
            feedback
          );
        }
      }
      
      activityStmt.finalize();
      verificationStmt.finalize();
      console.log('Activities added successfully');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Add competencies
function addCompetencies() {
  return new Promise((resolve, reject) => {
    console.log('Adding competencies...');
    
    // Sample competencies
    const competenciesData = [
      { name: 'Curriculum Design', category: 'Education', description: 'Ability to design comprehensive curricula aligned with educational standards' },
      { name: 'Classroom Management', category: 'Teaching', description: 'Skills in managing student behavior and creating a positive learning environment' },
      { name: 'Assessment Design', category: 'Evaluation', description: 'Creating valid and reliable assessment tools to measure student learning' },
      { name: 'Technology Integration', category: 'Technology', description: 'Incorporating digital tools and platforms into educational experiences' },
      { name: 'Inclusive Teaching', category: 'Teaching', description: 'Adapting instruction to meet the needs of all learners' },
      { name: 'Educational Leadership', category: 'Leadership', description: 'Leading educational initiatives and mentoring other educators' },
      { name: 'Research Methods', category: 'Research', description: 'Applying research methodologies to educational contexts' },
      { name: 'Cultural Competence', category: 'Diversity', description: 'Understanding and respecting cultural differences in the classroom' }
    ];
    
    const stmt = db.prepare(`
      INSERT INTO competencies (
        id, name, category, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    for (const competency of competenciesData) {
      stmt.run(
        uuidv4(),
        competency.name,
        competency.category,
        competency.description
      );
    }
    
    stmt.finalize((err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Competencies added successfully');
      resolve();
    });
  });
}

// Add student competencies
function addStudentCompetencies(students) {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if we already have student competencies
      const { count } = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM student_competencies', (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        });
      });
      
      if (count > 0) {
        console.log(`Student competencies already exist (${count} records), skipping...`);
        resolve();
        return;
      }
      
      console.log('Adding student competencies...');
      
      // Get competencies
      const competencies = await getCompetencies();
      if (competencies.length === 0) {
        console.log('No competencies found, skipping');
        resolve();
        return;
      }
      
      const compStmt = db.prepare(`
        INSERT INTO student_competencies (
          id, student_id, competency_id, level, evidence_url,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      const verificationStmt = db.prepare(`
        INSERT INTO competency_verifications (
          id, student_competency_id, verification_status, verified_by, feedback,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      for (const student of students) {
        // Assign 3-6 random competencies to each student
        const numCompetencies = Math.floor(Math.random() * 4) + 3;
        const indices = shuffleArray([...Array(competencies.length).keys()]).slice(0, numCompetencies);
        
        for (const idx of indices) {
          const competency = competencies[idx];
          const scId = uuidv4();
          
          // Random level
          const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
          const level = levels[Math.floor(Math.random() * levels.length)];
          
          // Evidence URL
          const evidenceUrl = `https://example.com/evidence/${scId}`;
          
          compStmt.run(
            scId,
            student.id,
            competency.id,
            level,
            evidenceUrl
          );
          
          // Add verification
          const verificationId = uuidv4();
          const statuses = ['pending', 'pending', 'pending', 'verified', 'rejected'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          // Feedback based on status
          let feedback = null;
          if (status === 'verified') {
            feedback = 'Competency level verified based on evidence provided.';
          } else if (status === 'rejected') {
            feedback = 'Please provide more evidence to support this competency level claim.';
          }
          
          verificationStmt.run(
            verificationId,
            scId,
            status,
            null, // verified_by will be set later
            feedback
          );
        }
      }
      
      compStmt.finalize();
      verificationStmt.finalize();
      console.log('Student competencies added successfully');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Add profile verifications for students
function addProfileVerifications(students) {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if we already have profile verifications
      const { count } = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM profile_verifications', (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        });
      });
      
      if (count > 0) {
        console.log(`Profile verifications already exist (${count} records), skipping...`);
        resolve();
        return;
      }
      
      console.log('Adding profile verifications...');
      
      const stmt = db.prepare(`
        INSERT INTO profile_verifications (
          id, user_id, document_url, verification_status, verified_by, feedback,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      for (const student of students) {
        const id = uuidv4();
        const documentUrl = `https://example.com/profile_docs/${id}`;
        
        // Random status
        const statuses = ['pending', 'pending', 'pending', 'verified', 'rejected'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Feedback based on status
        let feedback = null;
        if (status === 'verified') {
          feedback = 'Profile information verified successfully.';
        } else if (status === 'rejected') {
          feedback = 'Please update your profile with accurate information.';
        }
        
        stmt.run(
          id,
          student.id,
          documentUrl,
          status,
          null, // verified_by will be set later
          feedback
        );
      }
      
      stmt.finalize();
      console.log('Profile verifications added successfully');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Verify random items by randomly assigning mentors
async function verifyRandomItems(mentors) {
  try {
    if (mentors.length === 0) {
      console.log('No mentors available for verification, skipping');
      return;
    }
    
    console.log('Assigning verifiers to verified/rejected items...');
    
    // Get a random mentor ID
    const mentorId = mentors[Math.floor(Math.random() * mentors.length)].id;
    
    // Update qualifications - make sure the mentor ID exists in the users table
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE qualifications 
         SET verified_by = ?
         WHERE verification_status IN ('verified', 'rejected') AND verified_by IS NULL`,
        [mentorId],
        (err) => {
          if (err) {
            console.error('Error updating qualifications:', err.message);
            resolve(); // Continue despite errors
            return;
          }
          console.log('Updated qualifications');
          resolve();
        }
      );
    });
    
    // Update session verifications
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE session_verifications 
         SET verified_by = ?
         WHERE verification_status IN ('verified', 'rejected') AND verified_by IS NULL`,
        [mentorId],
        (err) => {
          if (err) {
            console.error('Error updating session verifications:', err.message);
            resolve(); // Continue despite errors
            return;
          }
          console.log('Updated session verifications');
          resolve();
        }
      );
    });
    
    // Update activity verifications
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE activity_verifications 
         SET verified_by = ?
         WHERE verification_status IN ('verified', 'rejected') AND verified_by IS NULL`,
        [mentorId],
        (err) => {
          if (err) {
            console.error('Error updating activity verifications:', err.message);
            resolve(); // Continue despite errors
            return;
          }
          console.log('Updated activity verifications');
          resolve();
        }
      );
    });
    
    // Update competency verifications
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE competency_verifications 
         SET verified_by = ?
         WHERE verification_status IN ('verified', 'rejected') AND verified_by IS NULL`,
        [mentorId],
        (err) => {
          if (err) {
            console.error('Error updating competency verifications:', err.message);
            resolve(); // Continue despite errors
            return;
          }
          console.log('Updated competency verifications');
          resolve();
        }
      );
    });
    
    // Update profile verifications
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE profile_verifications 
         SET verified_by = ?
         WHERE verification_status IN ('verified', 'rejected') AND verified_by IS NULL`,
        [mentorId],
        (err) => {
          if (err) {
            console.error('Error updating profile verifications:', err.message);
            resolve(); // Continue despite errors
            return;
          }
          console.log('Updated profile verifications');
          resolve();
        }
      );
    });
    
    console.log('Verifiers assigned successfully');
  } catch (error) {
    console.error('Error assigning verifiers:', error);
    // Continue despite errors
  }
}

// Utility function: Shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Utility function: Generate random past dates
function generatePastDates(count, maxDaysAgo) {
  const dates = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * maxDaysAgo);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // Sort by date (newest first)
  return dates.sort((a, b) => b.localeCompare(a));
}

// Run the population
populateData(); 