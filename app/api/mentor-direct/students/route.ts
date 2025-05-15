import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Direct access API to get students assigned to a mentor (bypassing authentication)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mentorId = url.searchParams.get('mentorId');
    
    console.log(`Direct mentor students API called for mentor ${mentorId}`);
    
    // Validate mentor ID
    if (!mentorId) {
      console.error('No mentor ID provided');
      return NextResponse.json(
        { error: 'Missing mentorId parameter' },
        { status: 400 }
      );
    }
    
    const pool = await getPool();
    
    // Get students assigned to this mentor
    const [assignedStudents] = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email,
        a.assigned_date as assignedDate
      FROM users u
      JOIN mentor_student_assignments a ON u.id = a.student_id
      WHERE a.mentor_id = ? AND u.role = 'student'
      ORDER BY u.name
    `, [mentorId]);
    
    console.log(`Direct mentor students API: Found ${assignedStudents.length} assigned students for mentor ${mentorId}`);
    
    return NextResponse.json({ assignedStudents });
  } catch (error) {
    console.error('Error in direct mentor students API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned students', assignedStudents: [] },
      { status: 500 }
    );
  }
} 