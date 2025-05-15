import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Direct API for sending messages from mentor to student (no authentication)
export async function POST(request: Request) {
  try {
    console.log('Direct mentor send message API called - bypassing authentication');
    const body = await request.json();
    const { mentorId, studentId, content } = body;

    // Basic validation
    if (!mentorId || !studentId || !content) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: mentorId, studentId, and content are required' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    
    // Verify that the student is assigned to this mentor
    const [assignmentCheck] = await pool.query(
      'SELECT 1 FROM mentor_student_assignments WHERE mentor_id = ? AND student_id = ?',
      [mentorId, studentId]
    );
    
    if (!assignmentCheck || assignmentCheck.length === 0) {
      console.error(`Student ${studentId} is not assigned to mentor ${mentorId}`);
      return NextResponse.json(
        { error: 'Student is not assigned to this mentor' },
        { status: 403 }
      );
    }
    
    // Create the message
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();
    
    console.log(`Direct mentor send message API: Creating message from mentor ${mentorId} to student ${studentId}`);
    
    await pool.query(`
      INSERT INTO messages (
        id, sender_id, receiver_id, content, timestamp, read, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `, [messageId, mentorId, studentId, content, timestamp]);
    
    console.log('Direct mentor send message API: Message created successfully');
    
    return NextResponse.json({
      success: true,
      message: {
        id: messageId,
        senderId: mentorId,
        receiverId: studentId,
        content,
        timestamp,
        read: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error in direct mentor send message API:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 