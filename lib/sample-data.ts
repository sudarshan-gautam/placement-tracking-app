/**
 * FALLBACK DATA FOR UI COMPONENTS
 * 
 * This file contains minimal sample data that is used ONLY as fallback
 * when database API calls fail. In normal operation, this data should
 * never be used as the application should retrieve real data from the database.
 * 
 * These samples are kept for backwards compatibility during the transition
 * to fully database-driven content.
 */

// Sample data for the student skills radar chart (fallback only)
export const studentSkillsData = [
  { subject: 'Leadership', self: 80, mentor: 70, fullMark: 100 },
  { subject: 'Communication', self: 75, mentor: 65, fullMark: 100 },
  { subject: 'Technical Skills', self: 65, mentor: 70, fullMark: 100 },
  { subject: 'Problem Solving', self: 70, mentor: 75, fullMark: 100 },
  { subject: 'Teamwork', self: 85, mentor: 80, fullMark: 100 },
  { subject: 'Adaptability', self: 60, mentor: 70, fullMark: 100 },
];

// Sample data for the activity chart (fallback only)
export const activityChartData = [
  { name: 'Week 1', sessions: 3, competencies: 2 },
  { name: 'Week 2', sessions: 5, competencies: 4 },
  { name: 'Week 3', sessions: 4, competencies: 3 },
  { name: 'Week 4', sessions: 6, competencies: 5 },
  { name: 'Week 5', sessions: 7, competencies: 4 },
  { name: 'Week 6', sessions: 5, competencies: 6 }
];

// Sample competency data for radar chart (fallback only)
export const competencyData = [
  { subject: 'Classroom Management', self: 4, benchmark: 5 },
  { subject: 'Differentiated Instruction', self: 3, benchmark: 5 },
  { subject: 'Assessment', self: 5, benchmark: 5 },
  { subject: 'Technology Integration', self: 4, benchmark: 5 },
  { subject: 'Communication', self: 5, benchmark: 5 },
  { subject: 'Professional Ethics', self: 4, benchmark: 5 }
];

// Minimal mentor student data (fallback only)
export const mentorStudentData = [
  { id: 1, name: 'John Smith', email: 'john.smith@example.com', status: 'Active', progress: 75 },
  { id: 2, name: 'Emma Johnson', email: 'emma.johnson@example.com', status: 'Active', progress: 60 },
  { id: 3, name: 'Michael Wong', email: 'michael.wong@example.com', status: 'Inactive', progress: 30 },
];

// Minimal job interests data (fallback only)
export const jobInterestsData = [
  { id: 1, title: 'Primary School Teacher', match: 85 },
  { id: 2, title: 'Secondary School Teacher', match: 72 },
  { id: 3, title: 'Teaching Assistant', match: 90 },
];

// Minimal qualifications data (fallback only)
export const qualificationsData = [
  { id: 1, title: 'Bachelor of Education', institution: 'University of London', date: '2020-06-15', verified: true },
  { id: 2, title: 'First Aid Certificate', institution: 'Red Cross', date: '2022-03-10', verified: true },
]; 