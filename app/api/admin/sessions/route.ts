import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // TEMPORARY: Skip authentication for debugging
    console.log('API: Attempting to fetch all sessions');
    
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    // Fetch all sessions with short numeric IDs for display purposes
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
      displayId: session.display_id, // Add a displayId property for UI display
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

    console.log(`API: Fetched ${formattedSessions.length} sessions from database`);
    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('API: Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
} 