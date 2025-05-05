import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'mentor' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    // Fetch all sessions
    const sessions = await db.all(`
      SELECT 
        s.id, 
        s.rowid as display_id,
        s.title, 
        s.description, 
        s.date, 
        s.location, 
        s.status,
        s.approval_status as approvalStatus,
        u.id as student_id, 
        u.name as student_name
      FROM sessions s
      JOIN users u ON s.student_id = u.id
      ORDER BY s.rowid ASC
    `);

    // Transform data structure
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      displayId: session.display_id,
      title: session.title,
      description: session.description,
      date: session.date,
      location: session.location,
      status: session.status,
      approvalStatus: session.approvalStatus || 'pending',
      student: {
        id: session.student_id,
        name: session.student_name
      }
    }));

    console.log(`Fetched ${formattedSessions.length} sessions for mentor`);
    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
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
    const { title, description, studentId, date, location, status } = body;

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
        location, 
        status,
        approval_status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [sessionId, title, description, studentId, date, location, status, approvalStatus]);

    // Get the inserted session details
    const newSession = await db.get(`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.date, 
        s.location, 
        s.status,
        s.approval_status as approvalStatus,
        u.id as student_id, 
        u.name as student_name
      FROM sessions s
      JOIN users u ON s.student_id = u.id
      WHERE s.id = ?
    `, sessionId);

    // Format the response
    const formattedSession = {
      id: newSession.id,
      title: newSession.title,
      description: newSession.description,
      date: newSession.date,
      location: newSession.location,
      status: newSession.status,
      approvalStatus: newSession.approvalStatus,
      student: {
        id: newSession.student_id,
        name: newSession.student_name
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