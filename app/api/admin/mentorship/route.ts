import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Get all mentor-student assignments
export async function GET() {
  try {
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Get all assignments with mentor and student details
    const assignments = await db.all(`
      SELECT 
        msa.id, 
        msa.mentor_id, 
        msa.student_id, 
        msa.assigned_date, 
        msa.notes,
        mentor.name as mentor_name,
        mentor.email as mentor_email,
        student.name as student_name,
        student.email as student_email
      FROM mentor_student_assignments msa
      JOIN users mentor ON msa.mentor_id = mentor.id
      JOIN users student ON msa.student_id = student.id
      ORDER BY msa.assigned_date DESC
    `);

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching mentor-student assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

// Assign a student to a mentor
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { mentor_id, student_id, notes } = data;
    
    console.log('Received assignment request:', { mentor_id, student_id, notes });

    if (!mentor_id || !student_id) {
      console.error('Missing required fields:', { mentor_id, student_id });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Both mentor_id and student_id are required' 
      }, { status: 400 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Check if mentor and student exist and have correct roles
    const mentor = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [mentor_id, 'mentor']);
    if (!mentor) {
      console.error('Invalid mentor ID or role:', mentor_id);
      return NextResponse.json({ 
        error: 'Invalid mentor',
        details: 'The specified mentor ID does not exist or is not a mentor' 
      }, { status: 400 });
    }

    const student = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [student_id, 'student']);
    if (!student) {
      console.error('Invalid student ID or role:', student_id);
      return NextResponse.json({ 
        error: 'Invalid student',
        details: 'The specified student ID does not exist or is not a student' 
      }, { status: 400 });
    }

    console.log('Verified mentor and student:', { mentor: mentor.name, student: student.name });

    // Check if student is already assigned to a mentor
    const existingAssignment = await db.get('SELECT * FROM mentor_student_assignments WHERE student_id = ?', [student_id]);
    
    console.log('Existing assignment check:', existingAssignment);
    
    if (existingAssignment) {
      // If the student is already assigned to this mentor, we can update the notes
      if (existingAssignment.mentor_id === mentor_id) {
        console.log('Updating existing assignment with same mentor');
        await db.run(
          'UPDATE mentor_student_assignments SET notes = ?, assigned_date = datetime("now") WHERE id = ?',
          [notes || '', existingAssignment.id]
        );

        return NextResponse.json({ 
          success: true, 
          message: 'Mentor-student assignment updated',
          id: existingAssignment.id
        }, { status: 200 });
      }
      
      // If student is assigned to a different mentor, remove the old assignment first
      console.log('Removing existing assignment with different mentor');
      await db.run('DELETE FROM mentor_student_assignments WHERE id = ?', [existingAssignment.id]);
    }

    // Create the new assignment
    console.log('Creating new assignment');
    try {
      const result = await db.run(
        'INSERT INTO mentor_student_assignments (mentor_id, student_id, notes) VALUES (?, ?, ?)',
        [mentor_id, student_id, notes || '']
      );
      
      console.log('Assignment created successfully:', result);

      return NextResponse.json({ 
        success: true, 
        message: 'Student successfully assigned to mentor',
        id: result.lastID
      }, { status: 201 });
    } catch (dbError) {
      console.error('Database error creating assignment:', dbError);
      return NextResponse.json({ 
        error: 'Database error',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating mentor-student assignment:', error);
    return NextResponse.json({ 
      error: 'Failed to create assignment',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Unassign a student from a mentor
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get('student_id');

    if (!student_id) {
      return NextResponse.json({ 
        error: 'Missing student ID',
        details: 'Student ID is required to remove an assignment' 
      }, { status: 400 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Check if assignment exists
    const existingAssignment = await db.get('SELECT * FROM mentor_student_assignments WHERE student_id = ?', [student_id]);
    if (!existingAssignment) {
      return NextResponse.json({ 
        error: 'Assignment not found',
        details: 'No mentor is assigned to this student' 
      }, { status: 404 });
    }

    // Delete the assignment
    await db.run('DELETE FROM mentor_student_assignments WHERE student_id = ?', [student_id]);

    return NextResponse.json({ 
      success: true, 
      message: 'Student successfully unassigned from mentor' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting mentor-student assignment:', error);
    return NextResponse.json({ 
      error: 'Failed to delete assignment',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Get mentor for a specific student
export async function getStudentMentor(studentId: string) {
  try {
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    const assignment = await db.get(`
      SELECT 
        msa.mentor_id,
        u.name as mentor_name,
        u.email as mentor_email
      FROM mentor_student_assignments msa
      JOIN users u ON msa.mentor_id = u.id
      WHERE msa.student_id = ?
    `, [studentId]);

    return assignment;
  } catch (error) {
    console.error('Error fetching student mentor:', error);
    return null;
  }
}

// Get all students for a specific mentor
export async function getMentorStudents(mentorId: string) {
  try {
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    const students = await db.all(`
      SELECT 
        msa.student_id,
        u.name as student_name,
        u.email as student_email,
        msa.assigned_date,
        msa.notes
      FROM mentor_student_assignments msa
      JOIN users u ON msa.student_id = u.id
      WHERE msa.mentor_id = ?
      ORDER BY u.name
    `, [mentorId]);

    return students;
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    return [];
  }
} 