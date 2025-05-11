'use client';

// Type definitions for mentor-student assignments
export interface MentorStudentAssignment {
  id?: number;
  mentor_id: string;
  student_id: string;
  assigned_date?: string;
  notes?: string;
  mentor_name?: string;
  student_name?: string;
}

// Fetch all mentor-student assignments
export async function getAllAssignments(): Promise<MentorStudentAssignment[]> {
  try {
    const response = await fetch('/api/admin/mentorship');
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
}

// Assign a student to a mentor
export async function assignStudentToMentor(
  mentorId: string | number, 
  studentId: string | number, 
  notes?: string
): Promise<boolean> {
  try {
    console.log(`Attempting to assign mentor ${mentorId} to student ${studentId}`);
    
    const requestBody = {
      mentor_id: mentorId.toString(),
      student_id: studentId.toString(),
      notes
    };
    
    console.log('Request body:', requestBody);
    
    const response = await fetch('/api/admin/mentorship', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error assigning student to mentor. Status:', response.status);
      console.error('Error details:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Assignment successful:', result);
    return true;
  } catch (error) {
    console.error('Exception in assignStudentToMentor:', error);
    return false;
  }
}

// Unassign a student from a mentor
export async function unassignStudentFromMentor(
  studentId: string | number
): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/mentorship?student_id=${studentId.toString()}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error unassigning student from mentor:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error unassigning student from mentor:', error);
    return false;
  }
}

// Get all students assigned to a mentor
export async function getStudentsForMentor(mentorId: string | number): Promise<any[]> {
  try {
    console.log('db-mentor-student-service: Fetching students for mentor:', mentorId);
    const response = await fetch(`/api/admin/mentorship/students/${mentorId.toString()}`);
    if (!response.ok) {
      console.error('db-mentor-student-service: Error response:', response.status, response.statusText);
      throw new Error('Failed to fetch students for mentor');
    }
    
    const data = await response.json();
    console.log('db-mentor-student-service: Students data received:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('db-mentor-student-service: Error fetching students for mentor:', error);
    return [];
  }
}

// Get the mentor assigned to a student (if any)
export async function getMentorForStudent(studentId: string | number): Promise<any> {
  try {
    const response = await fetch(`/api/admin/mentorship/mentor/${studentId.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch mentor for student');
    }
    const data = await response.json();
    
    // Check if a mentor was found
    if (!data || !data.mentor_id) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching mentor for student:', error);
    return null;
  }
}

// Check if a student is assigned to a mentor
export async function isStudentAssignedToMentor(
  mentorId: string | number, 
  studentId: string | number
): Promise<boolean> {
  try {
    const mentor = await getMentorForStudent(studentId);
    return mentor && mentor.mentor_id === mentorId.toString();
  } catch (error) {
    console.error('Error checking student-mentor assignment:', error);
    return false;
  }
}

// Get all mentors with their assigned students count
export async function getMentorsWithStudentCounts(): Promise<{ mentorId: string; studentCount: number }[]> {
  try {
    const response = await fetch('/api/admin/mentorship');
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }
    const assignments = await response.json();
    
    // Group by mentor_id and count
    const mentorCounts: Record<string, number> = {};
    assignments.forEach((assignment: MentorStudentAssignment) => {
      if (!mentorCounts[assignment.mentor_id]) {
        mentorCounts[assignment.mentor_id] = 0;
      }
      mentorCounts[assignment.mentor_id]++;
    });
    
    // Convert to array of objects
    return Object.entries(mentorCounts).map(([mentorId, studentCount]) => ({
      mentorId,
      studentCount
    }));
  } catch (error) {
    console.error('Error fetching mentor student counts:', error);
    return [];
  }
} 