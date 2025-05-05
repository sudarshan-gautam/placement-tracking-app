import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET(request: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'mentor') {
      console.log('Unauthorized access attempt:', { session });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentorId = session.user.id;
    if (!mentorId) {
      console.log('Missing mentor ID in session:', { session });
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const pool = await getPool();

    // Get all students assigned to the mentor
    const [students] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.course,
        u.year
      FROM users u
      JOIN mentor_student ms ON u.id = ms.student_id
      WHERE ms.mentor_id = ?
      ORDER BY u.name ASC
    `, [mentorId]);

    // For each student, get their stats and recent activity
    const transformedStudents = [];
    
    for (const student of students) {
      // Get verified activities count
      const [verifiedResult] = await pool.query(`
        SELECT COUNT(*) as count
        FROM student_activities 
        WHERE student_id = ? AND status = 'approved'
      `, [student.id]);
      
      // Get pending activities count
      const [pendingResult] = await pool.query(`
        SELECT COUNT(*) as count
        FROM student_activities 
        WHERE student_id = ? AND status = 'pending'
      `, [student.id]);
      
      // Get rejected activities count
      const [rejectedResult] = await pool.query(`
        SELECT COUNT(*) as count
        FROM student_activities 
        WHERE student_id = ? AND status = 'rejected'
      `, [student.id]);
      
      // Get total hours
      const [hoursResult] = await pool.query(`
        SELECT SUM(duration) as total
        FROM sessions 
        WHERE student_id = ? AND status = 'completed'
      `, [student.id]);
      
      // Get recent activity
      const [recentActivity] = await pool.query(`
        SELECT title, date_completed as date
        FROM student_activities
        WHERE student_id = ?
        ORDER BY date_completed DESC
        LIMIT 1
      `, [student.id]);
      
      // Get competencies
      const [competencies] = await pool.query(`
        SELECT 
          c.name,
          CASE 
            WHEN sc.self_rating >= 4 THEN 'Proficient'
            ELSE 'Developing'
          END as status
        FROM student_competencies sc
        JOIN competencies c ON sc.competency_id = c.id
        WHERE sc.student_id = ?
      `, [student.id]);
      
      transformedStudents.push({
        id: student.id,
        name: student.name,
        email: student.email,
        course: student.course,
        year: student.year,
        stats: {
          verified: verifiedResult[0]?.count || 0,
          pending: pendingResult[0]?.count || 0,
          rejected: rejectedResult[0]?.count || 0,
          totalHours: hoursResult[0]?.total || 0
        },
        recentActivity: recentActivity[0] || null,
        competencies: competencies || []
      });
    }

    return NextResponse.json({ students: transformedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
} 