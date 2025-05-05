// Sample data for the student skills radar chart
export const studentSkillsData = [
  { subject: 'Leadership', self: 80, mentor: 70, fullMark: 100 },
  { subject: 'Communication', self: 75, mentor: 65, fullMark: 100 },
  { subject: 'Technical Skills', self: 65, mentor: 70, fullMark: 100 },
  { subject: 'Problem Solving', self: 70, mentor: 75, fullMark: 100 },
  { subject: 'Teamwork', self: 85, mentor: 80, fullMark: 100 },
  { subject: 'Adaptability', self: 60, mentor: 70, fullMark: 100 },
];

// Sample data for the activity chart
export const activityChartData = [
  { name: 'Week 1', sessions: 3, competencies: 2 },
  { name: 'Week 2', sessions: 5, competencies: 4 },
  { name: 'Week 3', sessions: 4, competencies: 3 },
  { name: 'Week 4', sessions: 6, competencies: 5 },
  { name: 'Week 5', sessions: 7, competencies: 4 },
  { name: 'Week 6', sessions: 5, competencies: 6 }
];

// Sample student data for mentors
export const mentorStudentData = [
  { id: 1, name: 'John Smith', email: 'john.smith@example.com', status: 'Active', progress: 75 },
  { id: 2, name: 'Emma Johnson', email: 'emma.johnson@example.com', status: 'Active', progress: 60 },
  { id: 3, name: 'Michael Wong', email: 'michael.wong@example.com', status: 'Inactive', progress: 30 },
];

// Sample competency data for radar chart
export const competencyData = [
  { subject: 'Classroom Management', self: 4, benchmark: 5 },
  { subject: 'Differentiated Instruction', self: 3, benchmark: 5 },
  { subject: 'Assessment', self: 5, benchmark: 5 },
  { subject: 'Technology Integration', self: 4, benchmark: 5 },
  { subject: 'Communication', self: 5, benchmark: 5 },
  { subject: 'Professional Ethics', self: 4, benchmark: 5 }
];

// Sample job interests
export const jobInterestsData = [
  { id: 1, title: 'Primary School Teacher', match: 85 },
  { id: 2, title: 'Secondary School Teacher', match: 72 },
  { id: 3, title: 'Teaching Assistant', match: 90 },
];

// Sample qualifications
export const qualificationsData = [
  { id: 1, title: 'Bachelor of Education', institution: 'University of London', date: '2020-06-15', verified: true },
  { id: 2, title: 'First Aid Certificate', institution: 'Red Cross', date: '2022-03-10', verified: true },
  { id: 3, title: 'Classroom Management Course', institution: 'Online Learning Platform', date: '2023-01-20', verified: false },
];

// Sample activities data for all students
export const activitiesData = [
  {
    id: 1,
    title: 'Primary School Teaching Session',
    date: '2023-07-15',
    duration: '2 hours',
    type: 'Teaching',
    status: 'verified',
    reflectionCompleted: true,
    mentor: 'Dr. Jane Smith',
    student: 'Alice Johnson',
    studentId: 1,
    description: 'Conducted a math lesson for 3rd grade students focusing on multiplication and division.',
    location: 'Springfield Elementary School',
    evidence: 'Lesson plan, student feedback',
    reflection: 'Students responded well to the visual aids. Will incorporate more hands-on activities next time.'
  },
  {
    id: 2,
    title: 'Curriculum Planning Meeting',
    date: '2023-07-20',
    duration: '1.5 hours',
    type: 'Planning',
    status: 'pending',
    reflectionCompleted: false,
    mentor: 'Prof. Michael Johnson',
    student: 'Alice Johnson',
    studentId: 1,
    description: 'Participated in planning next semester\'s science curriculum with department faculty.',
    location: 'University Conference Room',
    evidence: 'Meeting notes, draft curriculum documents'
  },
  {
    id: 3,
    title: 'Parent-Teacher Conference',
    date: '2023-07-25',
    duration: '1 hour',
    type: 'Communication',
    status: 'verified',
    reflectionCompleted: true,
    mentor: 'Dr. Jane Smith',
    student: 'Bob Smith',
    studentId: 2,
    description: 'Discussed student progress with parents, addressing concerns and setting goals.',
    location: 'Westfield Middle School',
    evidence: 'Conference notes, action plan document',
    reflection: 'Need to improve on providing more specific examples of student work next time.'
  },
  {
    id: 4,
    title: 'Resource Development Workshop',
    date: '2023-07-28',
    duration: '3 hours',
    type: 'Development',
    status: 'rejected',
    reflectionCompleted: true,
    mentor: 'Prof. Michael Johnson',
    student: 'Bob Smith',
    studentId: 2,
    rejectionReason: 'Insufficient detail in evidence provided. Please include workshop materials and specific contributions.',
    description: 'Created teaching materials for special needs students in mathematics.',
    location: 'Education Resource Center',
    evidence: 'Sample worksheets',
    reflection: 'Learned new techniques for creating accessible learning materials.'
  },
  {
    id: 5,
    title: 'Classroom Management Seminar',
    date: '2023-08-05',
    duration: '4 hours',
    type: 'Training',
    status: 'verified',
    reflectionCompleted: true,
    mentor: 'Dr. Sarah Williams',
    student: 'Michael Wong',
    studentId: 3,
    description: 'Attended professional development seminar on classroom management techniques.',
    location: 'District Training Center',
    evidence: 'Certificate of attendance, implementation plan',
    reflection: 'The de-escalation techniques were particularly valuable. Will implement in my classroom immediately.'
  },
  {
    id: 6,
    title: 'Science Lab Teaching Session',
    date: '2023-08-10',
    duration: '2.5 hours',
    type: 'Teaching',
    status: 'pending',
    reflectionCompleted: false,
    mentor: 'Dr. Robert Chen',
    student: 'Michael Wong',
    studentId: 3,
    description: 'Led a high school chemistry lab experiment on acid-base reactions.',
    location: 'Northside High School',
    evidence: 'Lab instructions, safety procedures document'
  },
  {
    id: 7,
    title: 'Special Education Strategy Meeting',
    date: '2023-08-15',
    duration: '2 hours',
    type: 'Planning',
    status: 'verified',
    reflectionCompleted: true,
    mentor: 'Dr. Emily Parker',
    student: 'Emma Johnson',
    studentId: 4,
    description: 'Collaborated with special education team to develop IEP strategies.',
    location: 'District Support Center',
    evidence: 'Meeting minutes, strategy documents',
    reflection: 'Gained valuable insight into the IEP process and legal requirements.'
  },
  {
    id: 8,
    title: 'Digital Learning Workshop',
    date: '2023-08-18',
    duration: '6 hours',
    type: 'Training',
    status: 'pending',
    reflectionCompleted: false,
    mentor: 'Prof. David Wilson',
    student: 'Emma Johnson',
    studentId: 4,
    description: 'Participated in hands-on training for new educational technology tools.',
    location: 'Education Technology Center',
    evidence: 'Workshop materials, sample digital lesson'
  },
  {
    id: 9,
    title: 'Elementary Reading Intervention',
    date: '2023-08-22',
    duration: '1.5 hours',
    type: 'Teaching',
    status: 'verified',
    reflectionCompleted: true,
    mentor: 'Dr. Lisa Johnson',
    student: 'John Smith',
    studentId: 5,
    description: 'Conducted small group reading intervention for struggling 2nd grade readers.',
    location: 'Eastside Elementary School',
    evidence: 'Intervention plan, progress notes, supervisor feedback',
    reflection: 'The phonics-based approach showed immediate results with two students. Need to adjust pace for the others.'
  },
  {
    id: 10,
    title: 'School Leadership Meeting',
    date: '2023-08-25',
    duration: '1 hour',
    type: 'Administration',
    status: 'rejected',
    reflectionCompleted: false,
    mentor: 'Principal Thomas Garcia',
    student: 'John Smith',
    studentId: 5,
    rejectionReason: 'Meeting attendance alone is insufficient for a practicum activity. Please include specific leadership contributions or learning outcomes.',
    description: 'Participated in school leadership team meeting discussing budget allocations.',
    location: 'Administration Building',
    evidence: 'Meeting agenda'
  }
]; 