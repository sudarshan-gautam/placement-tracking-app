'use client';

import userProfiles from './user-profiles';

// Store mentor-student assignments in localStorage
const LOCAL_STORAGE_KEY = 'mentor_student_assignments';

export interface MentorStudentAssignment {
  mentorId: number;
  studentId: number;
  assignedDate: string;
  notes?: string;
}

// Ensure ID is always a number
function ensureNumber(id: string | number): number {
  if (typeof id === 'string') {
    return parseInt(id, 10);
  }
  return id;
}

// Get all mentor-student assignments
export function getAllAssignments(): MentorStudentAssignment[] {
  if (typeof window === 'undefined') return [];
  
  const assignmentsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!assignmentsJson) return [];
  
  try {
    return JSON.parse(assignmentsJson);
  } catch (error) {
    console.error('Error parsing mentor-student assignments', error);
    return [];
  }
}

// Save assignments to localStorage
function saveAssignments(assignments: MentorStudentAssignment[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assignments));
}

// Assign a student to a mentor
export function assignStudentToMentor(
  mentorId: string | number, 
  studentId: string | number, 
  notes?: string
): boolean {
  // Convert IDs to numbers
  const numericMentorId = ensureNumber(mentorId);
  const numericStudentId = ensureNumber(studentId);
  
  // Validate mentor and student exist
  const mentor = userProfiles.find(p => p.id === numericMentorId && p.role === 'mentor');
  const student = userProfiles.find(p => p.id === numericStudentId && p.role === 'student');
  
  if (!mentor || !student) {
    console.error('Invalid mentor or student ID');
    return false;
  }
  
  const assignments = getAllAssignments();
  
  // Check if assignment already exists
  const existingAssignment = assignments.find(
    a => a.mentorId === numericMentorId && a.studentId === numericStudentId
  );
  
  if (existingAssignment) {
    // Update notes if provided
    if (notes) {
      existingAssignment.notes = notes;
      saveAssignments(assignments);
    }
    return true;
  }
  
  // Create new assignment
  const newAssignment: MentorStudentAssignment = {
    mentorId: numericMentorId,
    studentId: numericStudentId,
    assignedDate: new Date().toISOString(),
    notes
  };
  
  assignments.push(newAssignment);
  saveAssignments(assignments);
  return true;
}

// Remove a student from a mentor
export function unassignStudentFromMentor(
  mentorId: string | number, 
  studentId: string | number,
  reason?: string
): boolean {
  // Convert IDs to numbers
  const numericMentorId = ensureNumber(mentorId);
  const numericStudentId = ensureNumber(studentId);
  
  const assignments = getAllAssignments();
  
  const initialLength = assignments.length;
  const filteredAssignments = assignments.filter(
    a => !(a.mentorId === numericMentorId && a.studentId === numericStudentId)
  );
  
  // If no assignments were removed, return false
  if (filteredAssignments.length === initialLength) {
    return false;
  }
  
  saveAssignments(filteredAssignments);
  
  // Store removal reason if provided
  if (reason && typeof window !== 'undefined') {
    const removalKey = `mentor_student_removal_${numericMentorId}_${numericStudentId}`;
    localStorage.setItem(removalKey, JSON.stringify({
      date: new Date().toISOString(),
      reason
    }));
  }
  
  return true;
}

// Get all students assigned to a mentor
export function getStudentsForMentor(mentorId: string | number): number[] {
  const numericMentorId = ensureNumber(mentorId);
  const assignments = getAllAssignments();
  return assignments
    .filter(a => a.mentorId === numericMentorId)
    .map(a => a.studentId);
}

// Get the mentor assigned to a student (if any)
export function getMentorForStudent(studentId: string | number): number | null {
  const numericStudentId = ensureNumber(studentId);
  const assignments = getAllAssignments();
  const assignment = assignments.find(a => a.studentId === numericStudentId);
  return assignment ? assignment.mentorId : null;
}

// Check if a student is assigned to a mentor
export function isStudentAssignedToMentor(
  mentorId: string | number, 
  studentId: string | number
): boolean {
  const numericMentorId = ensureNumber(mentorId);
  const numericStudentId = ensureNumber(studentId);
  
  const assignments = getAllAssignments();
  return assignments.some(
    a => a.mentorId === numericMentorId && a.studentId === numericStudentId
  );
}

// Get all mentors with their assigned students count
export function getMentorsWithStudentCounts(): { mentorId: number; studentCount: number }[] {
  const assignments = getAllAssignments();
  const mentors = userProfiles.filter(p => p.role === 'mentor');
  
  return mentors.map(mentor => {
    const studentCount = assignments.filter(a => a.mentorId === mentor.id).length;
    return { mentorId: mentor.id, studentCount };
  });
}

// Initialize with some default assignments if not present
export function initializeDefaultAssignments(): void {
  const assignments = getAllAssignments();
  
  // Only initialize if no assignments exist
  if (assignments.length === 0) {
    // Find mentor and student IDs
    const mentors = userProfiles.filter(p => p.role === 'mentor');
    const students = userProfiles.filter(p => p.role === 'student');
    
    if (mentors.length > 0 && students.length > 0) {
      // Assign first two students to first mentor as an example
      students.slice(0, 2).forEach(student => {
        assignStudentToMentor(mentors[0].id, student.id, 'Initial assignment');
      });
      
      // If there's a second mentor, assign a student to them
      if (mentors.length > 1 && students.length > 2) {
        assignStudentToMentor(mentors[1].id, students[2].id, 'Initial assignment');
      }
    }
  }
}

// Call initialization when the module is imported
if (typeof window !== 'undefined') {
  // Small delay to ensure it runs after localStorage is available
  setTimeout(initializeDefaultAssignments, 100);
} 