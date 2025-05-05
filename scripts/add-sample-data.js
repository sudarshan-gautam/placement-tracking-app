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

// Main function to add sample data
async function addSampleData() {
  try {
    console.log('Adding additional sample data...');

    // Get all users by role
    const students = await getAllRows(`SELECT id, name FROM users WHERE role = 'student'`);
    const mentors = await getAllRows(`SELECT id, name FROM users WHERE role = 'mentor'`);
    const admins = await getAllRows(`SELECT id, name FROM users WHERE role = 'admin'`);

    if (students.length === 0 || mentors.length === 0) {
      console.log('No students or mentors found, cannot add sample data');
      return;
    }

    console.log(`Found ${students.length} students and ${mentors.length} mentors`);

    // 1. Ensure each mentor has 5 students assigned
    await ensureMentorAssignments(mentors, students);
    
    // 2. Add more teaching activities (sessions)
    await addMoreTeachingActivities(students);
    
    // 3. Add more student activities
    await addMoreStudentActivities(students);
    
    // 4. Add more verification requests
    await addMoreVerificationRequests(students, mentors);

    // 5. Add activity log entries
    await addActivityLogs(students, mentors, admins);

    console.log('Additional sample data added successfully');
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    db.close();
  }
}

// Ensure each mentor has 5 students assigned
async function ensureMentorAssignments(mentors, students) {
  console.log('Ensuring mentor-student assignments...');
  
  // First, clear existing assignments
  await runQuery('DELETE FROM mentor_student');
  
  // For each mentor, assign 5 students (or as many as possible)
  for (let i = 0; i < mentors.length; i++) {
    const mentor = mentors[i];
    // Calculate which students to assign to this mentor
    for (let j = 0; j < 5; j++) {
      // Use modulo to wrap around if we don't have enough students
      const studentIndex = (i * 5 + j) % students.length;
      const student = students[studentIndex];
      
      // Random assigned date in the past 6 months
      const daysAgo = Math.floor(Math.random() * 180);
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
          `${mentor.name} was assigned to ${student.name} as part of the placement program.`
        ]
      );
    }
    
    console.log(`Assigned 5 students to mentor: ${mentor.name}`);
  }
}

// Add more teaching activities (sessions)
async function addMoreTeachingActivities(students) {
  console.log('Adding more teaching activities...');
  
  const sessionTypes = ['classroom', 'online', 'one-on-one', 'group', 'other'];
  const subjects = ['Mathematics', 'English', 'Science', 'History', 'Computer Science', 'Art', 'Physical Education'];
  const ageGroups = ['Primary (5-11)', 'Secondary (11-16)', 'College (16-18)', 'University', 'Adult Education'];
  const sessionStatuses = ['planned', 'completed', 'cancelled'];
  
  // Get count of existing sessions
  const existingSessions = await getAllRows('SELECT COUNT(*) as count FROM sessions');
  console.log(`Found ${existingSessions[0].count} existing sessions`);
  
  // Add more sessions (aiming for 50 total)
  const additionalSessions = Math.max(0, 50 - existingSessions[0].count);
  let sessionCount = 0;
  
  // Distribute sessions among students
  for (let i = 0; i < additionalSessions; i++) {
    const studentIndex = i % students.length;
    const student = students[studentIndex];
    
    const type = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
    
    // Random status weighted towards completed
    const status = Math.random() < 0.6 ? 
                   'completed' : // 60% chance of completed
                   sessionStatuses[Math.floor(Math.random() * sessionStatuses.length)]; // 40% chance of any status
    
    // Session dates - mixture of past and future
    let sessionDate;
    if (status === 'planned') {
      // Future date for planned sessions
      const daysAhead = Math.floor(Math.random() * 30) + 1;
      sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + daysAhead);
    } else {
      // Past date for completed or cancelled
      const daysAgo = Math.floor(Math.random() * 60) + 1;
      sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - daysAgo);
    }
    
    // Random duration between 30 and 120 minutes
    const duration = (Math.floor(Math.random() * 4) + 1) * 30;
    
    // Location based on type
    let location;
    if (type === 'online') {
      location = ['Zoom', 'Microsoft Teams', 'Google Meet'][Math.floor(Math.random() * 3)];
    } else if (type === 'classroom') {
      location = ['Room 101', 'Room 203', 'Lab 3', 'Auditorium', 'Gymnasium'][Math.floor(Math.random() * 5)];
    } else {
      location = ['School Library', 'Community Center', 'University Campus', 'Meeting Room 4'][Math.floor(Math.random() * 4)];
    }
    
    // Reflection and feedback only for completed sessions
    let reflection = null;
    let feedback = null;
    
    if (status === 'completed') {
      reflection = `I found this session to be ${['very effective', 'challenging but rewarding', 'a good learning experience', 'instructive', 'well received by students'][Math.floor(Math.random() * 5)]}. Next time I would ${['incorporate more group activities', 'allow more time for questions', 'prepare additional examples', 'use more visual aids', 'include a practical exercise'][Math.floor(Math.random() * 5)]}.`;
      
      feedback = `${['Good job! ', 'Well done. ', 'Excellent work! ', 'Nice effort. '][Math.floor(Math.random() * 4)]}${['Students were engaged', 'Clear explanations provided', 'Good classroom management', 'Effective use of resources', 'Well-structured lesson'][Math.floor(Math.random() * 5)]}. ${['Consider adding more interactive elements', 'Try to involve quieter students more', 'Could benefit from more real-world examples', 'Good pacing throughout', 'Excellent questioning techniques'][Math.floor(Math.random() * 5)]}.`;
    }
    
    const title = `${subject} ${['Lesson', 'Tutorial', 'Workshop', 'Lecture', 'Seminar'][Math.floor(Math.random() * 5)]} - ${['Introduction to', 'Advanced', 'Exploring', 'Fundamentals of', 'Practical'][Math.floor(Math.random() * 5)]} ${subject}`;
    
    await runQuery(
      `INSERT INTO sessions (
        id, student_id, title, description, date, duration, 
        location, session_type, learner_age_group, subject, objectives,
        reflection, feedback, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )`,
      [
        generateUUID(),
        student.id,
        title,
        `A ${duration}-minute ${type} session focusing on ${subject} concepts appropriate for ${ageGroup} learners.`,
        sessionDate.toISOString().split('T')[0],
        duration,
        location,
        type,
        ageGroup,
        subject,
        `Students will be able to demonstrate understanding of key ${subject} concepts through ${['discussion', 'practice exercises', 'project work', 'collaborative activities'][Math.floor(Math.random() * 4)]}.`,
        reflection,
        feedback,
        status
      ]
    );
    sessionCount++;
  }
  
  console.log(`Added ${sessionCount} new teaching activities`);
}

// Add more student activities
async function addMoreStudentActivities(students) {
  console.log('Adding more student activities...');
  
  // Sample activities
  const activities = [
    { title: 'Web Development Workshop', type: 'workshop', description: 'Attended a workshop on React.js' },
    { title: 'Database Design Project', type: 'project', description: 'Created a database schema for a retail application' },
    { title: 'Summer Internship at Tech Co', type: 'internship', description: 'Completed a 3-month internship' },
    { title: 'AWS Cloud Practitioner', type: 'certification', description: 'Obtained AWS certification' },
    { title: 'Career Development Seminar', type: 'seminar', description: 'Attended a seminar on job search strategies' },
    { title: 'Python Programming Course', type: 'certification', description: 'Completed advanced Python course' },
    { title: 'UI/UX Design Workshop', type: 'workshop', description: 'Learned principles of user interface design' },
    { title: 'Data Science Bootcamp', type: 'certification', description: 'Intensive 2-week data science program' },
    { title: 'Web Accessibility Conference', type: 'seminar', description: 'Conference on making web content accessible' },
    { title: 'Mobile App Development Project', type: 'project', description: 'Created a cross-platform mobile application' },
    { title: 'Advanced JavaScript Course', type: 'certification', description: 'Learned modern JavaScript frameworks' },
    { title: 'DevOps Workshop', type: 'workshop', description: 'Practiced CI/CD pipeline setup' },
    { title: 'Career Fair', type: 'seminar', description: 'Networked with potential employers' },
    { title: 'Git Version Control Workshop', type: 'workshop', description: 'Advanced Git usage and team workflows' },
    { title: 'Scrum Master Certification', type: 'certification', description: 'Obtained Scrum Master certification' },
    { title: 'Industry Internship', type: 'internship', description: 'Worked with a leading technology company' },
    { title: 'Backend API Design Project', type: 'project', description: 'Designed and implemented a RESTful API' },
    { title: 'Frontend Framework Comparison', type: 'project', description: 'Analyzed React, Vue, and Angular performance' },
    { title: 'Cloud Computing Workshop', type: 'workshop', description: 'Learned AWS cloud architecture' },
    { title: 'Technical Interview Prep', type: 'seminar', description: 'Prepared for technical coding interviews' }
  ];
  
  // Get existing activities count
  const existingActivities = await getAllRows('SELECT COUNT(*) as count FROM student_activities');
  console.log(`Found ${existingActivities[0].count} existing student activities`);
  
  // Add more activities (aiming for 100 total)
  const additionalActivities = Math.max(0, 100 - existingActivities[0].count);
  let activityCount = 0;
  
  // Insert activities for each student
  for (let i = 0; i < additionalActivities; i++) {
    const studentIndex = i % students.length;
    const student = students[studentIndex];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    // Random status with distribution: 50% approved, 30% pending, 20% rejected
    let status;
    const statusRoll = Math.random();
    if (statusRoll < 0.5) {
      status = 'approved';
    } else if (statusRoll < 0.8) {
      status = 'pending';
    } else {
      status = 'rejected';
    }
    
    // Random date in the past 180 days
    const daysAgo = Math.floor(Math.random() * 180);
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
    activityCount++;
  }
  
  console.log(`Added ${activityCount} new student activities`);
}

// Add more verification requests
async function addMoreVerificationRequests(students, mentors) {
  console.log('Adding more verification requests...');

  // Get existing qualifications count to avoid duplicating
  const existingVerifications = await getAllRows('SELECT COUNT(*) as count FROM approvals');
  console.log(`Found ${existingVerifications[0].count} existing verification requests`);
  
  // Add more verification requests (aiming for 40 total)
  const additionalVerifications = Math.max(0, 40 - existingVerifications[0].count);
  
  // First get some sessions and activities to use for verification requests
  const sessions = await getAllRows(`SELECT id, student_id, title FROM sessions LIMIT 20`);
  const activities = await getAllRows(`SELECT id, student_id, title FROM student_activities LIMIT 20`);
  const qualifications = await getAllRows(`SELECT id, student_id, title FROM qualifications LIMIT 20`);
  
  if (sessions.length === 0 && activities.length === 0 && qualifications.length === 0) {
    console.log('No items to verify, skipping verification request creation');
    return;
  }
  
  let verificationCount = 0;
  
  // Create verification requests
  for (let i = 0; i < additionalVerifications; i++) {
    // Choose random type of item to verify
    const itemTypeRoll = Math.random();
    let itemType, itemId, studentId, title;
    
    if (itemTypeRoll < 0.33 && sessions.length > 0) {
      // Verify a session
      const sessionIndex = i % sessions.length;
      itemType = 'session';
      itemId = sessions[sessionIndex].id;
      studentId = sessions[sessionIndex].student_id;
      title = sessions[sessionIndex].title;
    } else if (itemTypeRoll < 0.66 && activities.length > 0) {
      // Verify an activity
      const activityIndex = i % activities.length;
      itemType = 'activity';
      itemId = activities[activityIndex].id;
      studentId = activities[activityIndex].student_id;
      title = activities[activityIndex].title;
    } else if (qualifications.length > 0) {
      // Verify a qualification
      const qualificationIndex = i % qualifications.length;
      itemType = 'qualification';
      itemId = qualifications[qualificationIndex].id;
      studentId = qualifications[qualificationIndex].student_id;
      title = qualifications[qualificationIndex].title;
    } else {
      // Skip if we don't have items of this type
      continue;
    }
    
    // Find an assigned mentor for this student
    const assignedMentors = await getAllRows(
      `SELECT mentor_id FROM mentor_student WHERE student_id = ?`,
      [studentId]
    );
    
    if (assignedMentors.length === 0) {
      // Use any mentor if no assigned mentor is found
      const mentorIndex = i % mentors.length;
      mentorId = mentors[mentorIndex].id;
    } else {
      // Use an assigned mentor
      const assignedMentorIndex = Math.floor(Math.random() * assignedMentors.length);
      mentorId = assignedMentors[assignedMentorIndex].mentor_id;
    }
    
    // Random status with distribution: 40% pending, 40% approved, 20% rejected
    let status;
    const statusRoll = Math.random();
    if (statusRoll < 0.4) {
      status = 'pending';
    } else if (statusRoll < 0.8) {
      status = 'approved';
    } else {
      status = 'rejected';
    }
    
    // Random feedback based on status
    let feedback = null;
    if (status === 'approved') {
      feedback = [
        'Excellent work! All requirements met.',
        'Verified and approved. Well done!',
        'Meets all expectations. Approved.',
        'Good job. Happy to approve this.',
        'Verified with supporting evidence.'
      ][Math.floor(Math.random() * 5)];
    } else if (status === 'rejected') {
      feedback = [
        'Missing required documentation. Please resubmit with complete evidence.',
        'Information provided is insufficient. More details needed.',
        'Could not verify authenticity. Please provide original certificate.',
        'Requirements not met. Please review criteria and resubmit.',
        'Incomplete submission. Please add more supporting evidence.'
      ][Math.floor(Math.random() * 5)];
    }
    
    await runQuery(
      `INSERT INTO approvals (id, student_id, mentor_id, item_type, item_id, status, feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        generateUUID(),
        studentId,
        mentorId,
        itemType,
        itemId,
        status,
        feedback
      ]
    );
    verificationCount++;
  }
  
  console.log(`Added ${verificationCount} new verification requests`);
}

// Add activity logs
async function addActivityLogs(students, mentors, admins) {
  console.log('Adding activity logs...');
  
  // Check if we already have activity logs
  const existingLogs = await getAllRows('SELECT COUNT(*) as count FROM activity_logs');
  console.log(`Found ${existingLogs[0].count} existing activity logs`);
  
  // Add more logs (aiming for 50 total)
  const additionalLogs = Math.max(0, 50 - existingLogs[0].count);
  
  // Sample actions
  const actions = [
    { action: 'account_created', details: 'User account created' },
    { action: 'profile_updated', details: 'Profile information updated' },
    { action: 'activity_added', details: 'New activity recorded' },
    { action: 'verification_requested', details: 'Verification request submitted' },
    { action: 'verification_approved', details: 'Verification request approved' },
    { action: 'verification_rejected', details: 'Verification request rejected' },
    { action: 'session_created', details: 'New teaching session recorded' },
    { action: 'session_completed', details: 'Teaching session marked as completed' },
    { action: 'qualification_added', details: 'New qualification added' },
    { action: 'job_applied', details: 'Applied for a job posting' },
    { action: 'login', details: 'User logged in' },
    { action: 'password_changed', details: 'Password updated' },
    { action: 'permission_changed', details: 'User permissions updated' },
    { action: 'document_generated', details: 'Document generated' },
    { action: 'message_sent', details: 'Message sent' }
  ];
  
  // Get some item IDs to reference
  const sessions = await getAllRows(`SELECT id FROM sessions LIMIT 10`);
  const qualifications = await getAllRows(`SELECT id FROM qualifications LIMIT 10`);
  const applications = await getAllRows(`SELECT id FROM applications LIMIT 10`);
  
  let logCount = 0;
  
  for (let i = 0; i < additionalLogs; i++) {
    // Select a random user
    let userId, userType;
    const userRoll = Math.random();
    
    if (userRoll < 0.6) {
      // 60% chance it's a student action
      const studentIndex = Math.floor(Math.random() * students.length);
      userId = students[studentIndex].id;
      userType = 'student';
    } else if (userRoll < 0.9) {
      // 30% chance it's a mentor action
      const mentorIndex = Math.floor(Math.random() * mentors.length);
      userId = mentors[mentorIndex].id;
      userType = 'mentor';
    } else {
      // 10% chance it's an admin action
      const adminIndex = Math.floor(Math.random() * admins.length);
      userId = admins[adminIndex].id;
      userType = 'admin';
    }
    
    // Select a random action
    const actionIndex = Math.floor(Math.random() * actions.length);
    const action = actions[actionIndex];
    
    // Select a random item type and ID if appropriate
    let itemType = 'other', itemId = null;
    
    if (action.action.includes('session') && sessions.length > 0) {
      itemType = 'session';
      itemId = sessions[Math.floor(Math.random() * sessions.length)].id;
    } else if (action.action.includes('qualification') && qualifications.length > 0) {
      itemType = 'qualification';
      itemId = qualifications[Math.floor(Math.random() * qualifications.length)].id;
    } else if (action.action.includes('applied') && applications.length > 0) {
      itemType = 'application';
      itemId = applications[Math.floor(Math.random() * applications.length)].id;
    }
    
    // Random date in the past 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const actionDate = new Date();
    actionDate.setDate(actionDate.getDate() - daysAgo);
    
    await runQuery(
      `INSERT INTO activity_logs (id, user_id, item_id, item_type, action, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        generateUUID(),
        userId,
        itemId,
        itemType,
        action.action,
        `${userType}: ${action.details}`,
        actionDate.toISOString()
      ]
    );
    logCount++;
  }
  
  console.log(`Added ${logCount} new activity logs`);
}

// Run the main function
addSampleData().catch(console.error); 