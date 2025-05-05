import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();

    // Get mentor-student relationships with names
    const [relationships] = await pool.query(`
      SELECT 
        ms.id,
        ms.assigned_date,
        mentor.name as mentor_name,
        student.name as student_name
      FROM mentor_students ms
      JOIN users mentor ON ms.mentor_id = mentor.id
      JOIN users student ON ms.student_id = student.id
    `);

    // Get student activities with student names
    const [activities] = await pool.query(`
      SELECT 
        sa.*,
        u.name as student_name
      FROM student_activities sa
      JOIN users u ON sa.student_id = u.id
      ORDER BY sa.date_completed DESC
    `);

    return NextResponse.json({
      relationships,
      activities
    });
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relationships' },
      { status: 500 }
    );
  }
} 