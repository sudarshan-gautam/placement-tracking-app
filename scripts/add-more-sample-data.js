const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Connect to the SQLite database
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('SQLite connection successful');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Function to run a query and return a promise
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Function to get all rows from a query
function getAllRows(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// Generate a UUID
function generateUUID() {
  return uuidv4().replace(/-/g, '');
}

// Main function to add more sample data
async function addMoreSampleData() {
  try {
    console.log('Adding more sample data to the database...');

    // Get all mentors
    const mentors = await getAllRows('SELECT * FROM users WHERE role = "mentor"');
    console.log(`Found ${mentors.length} mentors`);

    // Get all students
    const students = await getAllRows('SELECT * FROM users WHERE role = "student"');
    console.log(`Found ${students.length} students`);

    // Clear existing mentor-student relationships to reassign
    await runQuery('DELETE FROM mentor_student');
    
    // Assign 5 students to each mentor
    await assignStudentsToMentors(mentors, students);
    
    // Add more student activities with different statuses
    await addMoreStudentActivities(students);
    
    // Add more verification data
    await addMoreVerificationData(students);

    console.log('Additional sample data added successfully');
  } catch (error) {
    console.error('Error adding more sample data:', error);
  } finally {
    db.close();
  }
}

// Assign students to mentors (5 students per mentor)
async function assignStudentsToMentors(mentors, students) {
  console.log('Assigning students to mentors (5 per mentor)...');
  
  for (let i = 0; i < mentors.length; i++) {
    const mentor = mentors[i];
    const studentsForMentor = [];
    
    // Assign 5 students to this mentor
    for (let j = 0; j < 5; j++) {
      // Get a student from the array using modulo to wrap around if needed
      const studentIndex = (i * 5 + j) % students.length;
      studentsForMentor.push(students[studentIndex]);
    }
    
    // Insert mentor-student relationships
    for (const student of studentsForMentor) {
      // Date between 1 and 90 days ago
      const daysAgo = Math.floor(Math.random() * 90) + 1;
      const assignedDate = new Date();
      assignedDate.setDate(assignedDate.getDate() - daysAgo);
      
      await runQuery(
        `INSERT INTO mentor_student (id, mentor_id, student_id, assigned_date, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          generateUUID(),
          mentor.id,
          student.id,
          assignedDate.toISOString().split('T')[0],
          `${mentor.name} is mentoring ${student.name} for their placement.`
        ]
      );
    }
    
    console.log(`Assigned 5 students to mentor: ${mentor.name}`);
  }
}

// Add more student activities with different statuses
async function addMoreStudentActivities(students) {
  console.log('Adding more student activities...');
  
  // First, clear existing student activities
  await runQuery('DELETE FROM student_activities');
  
  // Sample activities
  const activities = [
    // Workshops
    { title: 'React.js Workshop', type: 'workshop', description: 'Participated in a workshop on building React components and understanding React hooks.' },
    { title: 'Python for Education', type: 'workshop', description: 'Attended workshop on using Python for educational tools and assessments.' },
    { title: 'Inclusive Teaching Practices', type: 'workshop', description: 'Workshop focused on creating inclusive classroom environments.' },
    { title: 'Digital Assessment Tools', type: 'workshop', description: 'Hands-on workshop exploring digital assessment tools for the classroom.' },
    { title: 'EdTech Implementation', type: 'workshop', description: 'Workshop on implementing technology in educational settings.' },
    
    // Projects
    { title: 'Lesson Plan Development', type: 'project', description: 'Created a series of lesson plans for primary science education.' },
    { title: 'Educational Game Design', type: 'project', description: 'Designed and developed an educational game for teaching mathematics.' },
    { title: 'Classroom Management System', type: 'project', description: 'Created a digital system for managing classroom activities and student progress.' },
    { title: 'Curriculum Development Project', type: 'project', description: 'Contributed to developing a new English curriculum for secondary education.' },
    { title: 'Learning Resource Creation', type: 'project', description: 'Created learning resources for students with diverse learning needs.' },
    
    // Internships/Certifications
    { title: 'Primary School Teaching Practicum', type: 'internship', description: 'Completed teaching practicum at Lincoln Primary School.' },
    { title: 'Secondary School Teaching Activity', type: 'internship', description: 'Led a series of classes at Washington Secondary School.' },
    { title: 'Online Teaching Experience', type: 'internship', description: 'Conducted online teaching sessions for remote learners.' },
    { title: 'Special Education Experience', type: 'internship', description: 'Worked with special education students at Jefferson School.' },
    { title: 'ESL Teaching Experience', type: 'internship', description: 'Taught English as a Second Language to international students.' },
    
    // Certifications
    { title: 'First Aid Certification', type: 'certification', description: 'Obtained certification in First Aid and CPR for educators.' },
    { title: 'Digital Learning Certification', type: 'certification', description: 'Completed certification program in digital learning strategies.' },
    { title: 'Educational Psychology Certificate', type: 'certification', description: 'Obtained certificate in Educational Psychology fundamentals.' },
    { title: 'TEFL Certification', type: 'certification', description: 'Completed Teaching English as a Foreign Language certification.' },
    { title: 'Special Education Certification', type: 'certification', description: 'Certified in specialized teaching methods for special education.' },
    
    // Seminars
    { title: 'Modern Teaching Methods Seminar', type: 'seminar', description: 'Attended seminar on modern teaching methods and approaches.' },
    { title: 'Education Technology Seminar', type: 'seminar', description: 'Participated in seminar about latest educational technologies.' },
    { title: 'Student Assessment Seminar', type: 'seminar', description: 'Seminar focusing on effective student assessment techniques.' },
    { title: 'Classroom Diversity Seminar', type: 'seminar', description: 'Attended seminar on managing diverse classrooms and inclusive teaching.' },
    { title: 'Educational Leadership Seminar', type: 'seminar', description: 'Seminar on developing leadership skills in educational settings.' }
  ];
  
  // Statuses with distribution
  const statuses = [
    { value: 'pending', weight: 0.4 },   // 40% pending
    { value: 'approved', weight: 0.5 },  // 50% approved
    { value: 'rejected', weight: 0.1 }   // 10% rejected
  ];
  
  // Helper function to select a status based on weights
  function selectStatus() {
    const random = Math.random();
    let sum = 0;
    for (const status of statuses) {
      sum += status.weight;
      if (random < sum) {
        return status.value;
      }
    }
    return statuses[0].value; // Fallback to first status
  }
  
  // Insert activities for each student
  for (const student of students) {
    // Each student gets 4-8 random activities
    const numActivities = 4 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numActivities; i++) {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const status = selectStatus();
      
      // Date between 1 and 120 days ago
      const daysAgo = Math.floor(Math.random() * 120) + 1;
      const dateCompleted = new Date();
      dateCompleted.setDate(dateCompleted.getDate() - daysAgo);
      
      await runQuery(
        `INSERT INTO student_activities (id, student_id, title, description, activity_type, date_completed, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          generateUUID(),
          student.id,
          activity.title,
          activity.description,
          activity.type,
          dateCompleted.toISOString().split('T')[0],
          status
        ]
      );
    }
  }
  
  console.log(`Added activities for ${students.length} students`);
}

// Add more verification data (pending/approved/rejected)
async function addMoreVerificationData(students) {
  console.log('Adding more verification data...');
  
  // First, clear existing approvals
  await runQuery('DELETE FROM approvals');
  
  // Get mentors for verification
  const mentors = await getAllRows('SELECT * FROM users WHERE role = "mentor"');
  if (mentors.length === 0) {
    console.error('No mentors found for verification data');
    return;
  }
  
  // Get all student activities
  const activities = await getAllRows('SELECT * FROM student_activities');
  console.log(`Found ${activities.length} student activities for verification`);
  
  // Create approvals with different statuses
  for (const activity of activities) {
    // Skip if already has a status that's not pending
    if (activity.status !== 'pending') {
      continue;
    }
    
    // Assign a random mentor
    const mentor = mentors[Math.floor(Math.random() * mentors.length)];
    
    // Date between 1 and 30 days ago
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - daysAgo);
    
    // Status distribution: 50% pending, 35% approved, 15% rejected
    const random = Math.random();
    let status;
    let feedback = null;
    
    if (random < 0.5) {
      status = 'pending';
    } else if (random < 0.85) {
      status = 'approved';
      feedback = [
        'Great work! This activity meets all the requirements.',
        'Excellent demonstration of teaching skills.',
        'Well documented and meets all standards.',
        'Approved. Good example of effective teaching practice.',
        'This activity shows good planning and execution.'
      ][Math.floor(Math.random() * 5)];
    } else {
      status = 'rejected';
      feedback = [
        'Please provide more documentation for this activity.',
        'This activity doesn\'t meet the required standards.',
        'More reflection needed on teaching outcomes.',
        'Please resubmit with more details about student learning outcomes.',
        'Insufficient evidence of planning and assessment methods.'
      ][Math.floor(Math.random() * 5)];
    }
    
    await runQuery(
      `INSERT INTO approvals (id, student_id, mentor_id, item_type, item_id, status, feedback, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateUUID(),
        activity.student_id,
        mentor.id,
        'activity',
        activity.id,
        status,
        feedback,
        createdDate.toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1].split('.')[0]
      ]
    );
    
    // Update activity status to match approval status
    await runQuery(
      `UPDATE student_activities SET status = ? WHERE id = ?`,
      [status, activity.id]
    );
  }
  
  console.log(`Added verification data for activities`);
}

// Run the script
addMoreSampleData().catch(console.error); 