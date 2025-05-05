import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();

    // Get student activities with student names and activity counts
    const [studentActivities] = await pool.query(`
      SELECT 
        u.id,
        u.name as student,
        (SELECT title FROM student_activities 
         WHERE student_id = u.id 
         ORDER BY date_completed DESC 
         LIMIT 1) as recent,
        COUNT(CASE WHEN sa.status = 'approved' THEN 1 ELSE NULL END) as completed,
        COUNT(CASE WHEN sa.status = 'pending' THEN 1 ELSE NULL END) as pending
      FROM users u
      LEFT JOIN student_activities sa ON u.id = sa.student_id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY u.name
    `);

    return NextResponse.json({ studentActivities: studentActivities || [] });
  } catch (error) {
    console.error('Error fetching student activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student activities', studentActivities: [] },
      { status: 500 }
    );
  }
} 