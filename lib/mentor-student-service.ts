import { getAll } from '@/lib/db';

export interface MentorStudent {
  id: number;
  student_id: string;
  mentor_id: string;
  name: string;
  email: string;
  status: string;
  assigned_date: string;
  notes: string;
  progress: number;
}

/**
 * Get all students assigned to a mentor
 * @param mentorId The ID of the mentor
 */
export async function getStudentsForMentor(mentorId: string): Promise<MentorStudent[]> {
  try {
    // Get the students assigned to this mentor
    const assignments = await getAll<any>(
      `SELECT 
        msa.id,
        msa.student_id,
        msa.mentor_id,
        msa.assigned_date,
        msa.notes,
        u.name,
        u.email
      FROM 
        mentor_student_assignments msa
      JOIN 
        users u ON msa.student_id = u.id
      WHERE 
        msa.mentor_id = ?`,
      [mentorId]
    );

    // Transform the data to include progress (this would come from actual progress tracking)
    return assignments.map(assignment => ({
      id: assignment.id,
      student_id: assignment.student_id,
      mentor_id: assignment.mentor_id,
      name: assignment.name,
      email: assignment.email,
      status: 'Active', // Default status
      assigned_date: assignment.assigned_date,
      notes: assignment.notes || '',
      progress: Math.floor(Math.random() * 100) // Simulated progress for now
    }));
  } catch (error) {
    console.error('Error fetching students for mentor:', error);
    return [];
  }
}

/**
 * Assign a student to a mentor
 * @param mentorId The ID of the mentor
 * @param studentId The ID of the student
 * @param notes Optional notes about the assignment
 */
export async function assignStudentToMentor(
  mentorId: string, 
  studentId: string, 
  notes: string = ''
): Promise<boolean> {
  try {
    // First check if the student is already assigned to any mentor
    const existingAssignment = await getAll(
      'SELECT * FROM mentor_student_assignments WHERE student_id = ?',
      [studentId]
    );
    
    if (existingAssignment.length > 0) {
      throw new Error('Student is already assigned to a mentor');
    }
    
    // Insert the new assignment
    await getAll(
      `INSERT INTO mentor_student_assignments 
        (mentor_id, student_id, assigned_date, notes) 
      VALUES (?, ?, datetime('now'), ?)`,
      [mentorId, studentId, notes]
    );
    
    return true;
  } catch (error) {
    console.error('Error assigning student to mentor:', error);
    return false;
  }
}

/**
 * Remove a student assignment from a mentor
 * @param assignmentId The ID of the assignment to remove
 */
export async function removeStudentAssignment(assignmentId: number): Promise<boolean> {
  try {
    await getAll(
      'DELETE FROM mentor_student_assignments WHERE id = ?',
      [assignmentId]
    );
    return true;
  } catch (error) {
    console.error('Error removing student assignment:', error);
    return false;
  }
}

/**
 * Get all available students (not assigned to any mentor)
 */
export async function getAvailableStudents(): Promise<any[]> {
  try {
    return await getAll(
      `SELECT 
        u.id, 
        u.name, 
        u.email
      FROM 
        users u
      WHERE 
        u.role = 'student' 
        AND u.id NOT IN (
          SELECT student_id FROM mentor_student_assignments
        )`,
      []
    );
  } catch (error) {
    console.error('Error fetching available students:', error);
    return [];
  }
} 