import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check authentication using custom headers
    const roleHeader = req.headers.get('X-User-Role');
    const userId = req.headers.get('X-User-ID');
    
    console.log('API: Auth headers received:', { 
      roleHeader,
      userId
    });
    
    // Basic authorization check
    if (roleHeader !== 'mentor' && roleHeader !== 'admin') {
      console.log('API: Unauthorized access attempt to mentor sessions API');
      return NextResponse.json({ 
        error: 'Unauthorized - Mentor or Admin access required',
        roleProvided: roleHeader 
      }, { status: 401 });
    }
    
    console.log('API: User authorized as mentor/admin, fetching sessions');
    
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    try {
      let sessions;
      
      // Admin can see all sessions, but mentors should only see sessions for their assigned students
      if (roleHeader === 'admin') {
        // Admin can see all sessions
        sessions = await db.all(`
          SELECT 
            s.id, 
            s.rowid as display_id,
            s.title, 
            s.description, 
            s.date, 
            s.start_time,
            s.end_time,
            s.location,
            s.status,
            s.reflection,
            s.assigned_by,
            u.id as student_id, 
            u.name as student_name,
            a.name as assigned_by_name
          FROM sessions s
          JOIN users u ON s.student_id = u.id
          LEFT JOIN users a ON s.assigned_by = a.id
          ORDER BY s.rowid DESC
        `);
      } else {
        // Mentors can only see sessions for their assigned students
        sessions = await db.all(`
          SELECT 
            s.id, 
            s.rowid as display_id,
            s.title, 
            s.description, 
            s.date, 
            s.start_time,
            s.end_time,
            s.location,
            s.status,
            s.reflection,
            s.assigned_by,
            u.id as student_id, 
            u.name as student_name,
            a.name as assigned_by_name
          FROM sessions s
          JOIN users u ON s.student_id = u.id
          LEFT JOIN users a ON s.assigned_by = a.id
          JOIN mentor_student_assignments msa ON s.student_id = msa.student_id
          WHERE msa.mentor_id = ?
          ORDER BY s.rowid DESC
        `, userId);
      }

      // Transform data structure to match the frontend expectations
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        displayId: session.display_id, 
        title: session.title,
        description: session.description || '',
        date: session.date,
        startTime: session.start_time,
        endTime: session.end_time,
        location: session.location || '',
        status: session.status || 'planned',
        reflection: session.reflection,
        student: {
          id: session.student_id,
          name: session.student_name
        },
        assignedBy: session.assigned_by ? {
          id: session.assigned_by,
          name: session.assigned_by_name
        } : null
      }));

      console.log(`API: Fetched ${formattedSessions.length} sessions for ${roleHeader}`);
      return NextResponse.json({ sessions: formattedSessions });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('API: Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'mentor' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { title, description, studentId, date, location, status, startTime, endTime } = body;

    // Validate required fields
    if (!title || !studentId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    // Check if student exists
    const studentExists = await db.get('SELECT id FROM users WHERE id = ? AND role = "student"', studentId);
    if (!studentExists) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    // Check if student is assigned to this mentor
    if (session.user.role === 'mentor') {
      const isStudentAssigned = await db.get(
        'SELECT * FROM mentor_student_assignments WHERE mentor_id = ? AND student_id = ?', 
        [session.user.id, studentId]
      );
      
      if (!isStudentAssigned) {
        return NextResponse.json({ 
          error: 'You can only create sessions for your assigned students' 
        }, { status: 403 });
      }
    }

    // Determine approval status (admin-created sessions are auto-approved)
    const approvalStatus = session.user.role === 'admin' ? 'approved' : 'pending';

    // Insert session - use UUID for ID
    const sessionId = generateUUID();
    
    await db.run(`
      INSERT INTO sessions (
        id,
        title, 
        description, 
        student_id, 
        date, 
        start_time,
        end_time,
        location, 
        status,
        assigned_by,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      sessionId, 
      title, 
      description || null, 
      studentId, 
      date, 
      startTime || null,
      endTime || null,
      location || null, 
      status || 'planned', 
      session.user.id
    ]);

    // Get the inserted session details
    const newSession = await db.get(`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.date, 
        s.start_time,
        s.end_time,
        s.location, 
        s.status,
        s.assigned_by,
        u.id as student_id, 
        u.name as student_name,
        a.name as assigned_by_name
      FROM sessions s
      JOIN users u ON s.student_id = u.id
      LEFT JOIN users a ON s.assigned_by = a.id
      WHERE s.id = ?
    `, sessionId);

    // Format the response
    const formattedSession = {
      id: newSession.id,
      title: newSession.title,
      description: newSession.description,
      date: newSession.date,
      startTime: newSession.start_time,
      endTime: newSession.end_time,
      location: newSession.location,
      status: newSession.status,
      student: {
        id: newSession.student_id,
        name: newSession.student_name
      },
      assignedBy: {
        id: newSession.assigned_by,
        name: newSession.assigned_by_name
      }
    };

    return NextResponse.json({ 
      message: 'Session created successfully', 
      session: formattedSession 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// Helper function to generate a UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 