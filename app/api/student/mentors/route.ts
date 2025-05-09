import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    // Get the session to check authentication and get the student's ID
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user data from the session token
    const user = session.user as { id?: string; role?: string; };
    
    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized: User is not a student' }, { status: 401 });
    }

    const studentId = user.id;
    if (!studentId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const pool = await getPool();

    // Query to get all mentors assigned to this student
    const [mentors] = await pool.query(`
      SELECT 
        mentor.id as id,
        mentor.name as name,
        mentor.email as email,
        ms.assigned_date as assignedDate
      FROM mentor_student_assignments ms
      JOIN users mentor ON ms.mentor_id = mentor.id
      WHERE ms.student_id = ?
      ORDER BY mentor.name
    `, [studentId]);

    return NextResponse.json({ 
      assignedMentors: mentors || [] 
    });
  } catch (error) {
    console.error('Error fetching assigned mentors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned mentors', assignedMentors: [] },
      { status: 500 }
    );
  }
} 