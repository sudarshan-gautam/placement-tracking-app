import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    // Get the session to check authentication and get the mentor's ID
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user data from the session token
    const user = session.user as { id?: string; role?: string; };
    
    if (user.role !== 'mentor') {
      return NextResponse.json({ error: 'Unauthorized: User is not a mentor' }, { status: 401 });
    }

    const mentorId = user.id;
    if (!mentorId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const pool = await getPool();

    // Query to get all pending verifications for this mentor's students
    const [verifications] = await pool.query(`
      SELECT 
        sa.id,
        u.name as student,
        sa.title as activity,
        sa.date_completed as date,
        sa.activity_type as type,
        'pending' as status
      FROM student_activities sa
      JOIN users u ON sa.student_id = u.id
      JOIN mentor_student_assignments ms ON u.id = ms.student_id
      WHERE ms.mentor_id = ? AND sa.status = 'pending'
      ORDER BY sa.date_completed DESC
    `, [mentorId]);

    return NextResponse.json({ 
      pendingVerifications: verifications || [] 
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending verifications', pendingVerifications: [] },
      { status: 500 }
    );
  }
} 