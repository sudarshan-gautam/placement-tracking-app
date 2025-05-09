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

    // Get students assigned to this mentor
    const [students] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email
      FROM users u
      JOIN mentor_student_assignments ms ON u.id = ms.student_id
      WHERE ms.mentor_id = ?
    `, [mentorId]);

    // For each student, get their activity stats
    const studentActivities = [];
    
    for (const student of students as any[]) {
      // Get recent activity
      const [recentActivity] = await pool.query(`
        SELECT title as recent
        FROM student_activities
        WHERE student_id = ?
        ORDER BY date_completed DESC
        LIMIT 1
      `, [student.id]);
      
      // Get completed activities count
      const [completedActivities] = await pool.query(`
        SELECT COUNT(*) as count
        FROM student_activities
        WHERE student_id = ? AND status = 'approved'
      `, [student.id]);
      
      // Get pending activities count
      const [pendingActivities] = await pool.query(`
        SELECT COUNT(*) as count
        FROM student_activities
        WHERE student_id = ? AND status = 'pending'
      `, [student.id]);
      
      studentActivities.push({
        id: student.id,
        student: student.name,
        email: student.email,
        recent: recentActivity[0]?.recent || 'No recent activity',
        completed: completedActivities[0]?.count || 0,
        pending: pendingActivities[0]?.count || 0
      });
    }

    return NextResponse.json({ 
      studentActivities 
    });
  } catch (error) {
    console.error('Error fetching student activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student activities', studentActivities: [] },
      { status: 500 }
    );
  }
} 