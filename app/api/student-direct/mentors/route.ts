import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Direct access API to get mentors assigned to a student (bypassing authentication)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    
    console.log(`Direct student mentors API called for student ${studentId}`);
    
    // Validate student ID
    if (!studentId) {
      console.error('No student ID provided');
      return NextResponse.json(
        { error: 'Missing studentId parameter' },
        { status: 400 }
      );
    }
    
    const pool = await getPool();
    
    // Get mentors assigned to this student
    const [assignedMentors] = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email,
        a.assigned_date as assignedDate
      FROM users u
      JOIN mentor_student_assignments a ON u.id = a.mentor_id
      WHERE a.student_id = ? AND u.role = 'mentor'
      ORDER BY u.name
    `, [studentId]);
    
    console.log(`Direct student mentors API: Found ${assignedMentors.length} assigned mentors for student ${studentId}`);
    
    return NextResponse.json({ assignedMentors });
  } catch (error) {
    console.error('Error in direct student mentors API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned mentors', assignedMentors: [] },
      { status: 500 }
    );
  }
} 