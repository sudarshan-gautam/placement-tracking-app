import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check authentication using custom headers
    const authHeader = req.headers.get('Authorization');
    const roleHeader = req.headers.get('X-User-Role');
    
    console.log('API: Auth headers received:', { 
      authHeader: authHeader ? 'Present' : 'Missing',
      roleHeader 
    });
    
    // Basic authorization check - in production, you'd verify JWT signatures
    let isAuthorized = false;
    
    if (roleHeader === 'admin') {
      isAuthorized = true;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const tokenData = JSON.parse(atob(token));
        
        if (tokenData.payload && tokenData.payload.role === 'admin') {
          isAuthorized = true;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
    
    if (!isAuthorized) {
      console.log('API: Unauthorized access attempt to sessions API');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('API: User authorized, fetching sessions');
    
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