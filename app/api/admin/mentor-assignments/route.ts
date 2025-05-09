import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();

    // Get mentor-student assignments with names
    const [assignments] = await pool.query(`
      SELECT 
        ms.id as assignment_id,
        mentor.id as mentor_id,
        mentor.name as mentor_name,
        mentor.email as mentor_email,
        student.id as student_id,
        student.name as student_name,
        student.email as student_email,
        ms.assigned_date
      FROM mentor_student_assignments ms
      JOIN users mentor ON ms.mentor_id = mentor.id
      JOIN users student ON ms.student_id = student.id
      ORDER BY mentor.name, student.name
    `);

    // Group assignments by mentor
    const mentorAssignments = (assignments as any[]).reduce((acc, curr) => {
      const mentor = {
        id: curr.mentor_id,
        name: curr.mentor_name,
        email: curr.mentor_email
      };
      
      const student = {
        id: curr.student_id,
        name: curr.student_name,
        email: curr.student_email,
        assignedDate: curr.assigned_date
      };

      if (!acc[mentor.id]) {
        acc[mentor.id] = {
          ...mentor,
          students: []
        };
      }

      acc[mentor.id].students.push(student);
      return acc;
    }, {});

    return NextResponse.json({ 
      assignments: Object.values(mentorAssignments)
    });
  } catch (error) {
    console.error('Error fetching mentor assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentor assignments' },
      { status: 500 }
    );
  }
} 