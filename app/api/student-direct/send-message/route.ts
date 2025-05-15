import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Direct API for sending messages from student to mentor (no authentication)
export async function POST(request: Request) {
  try {
    console.log('Direct student send message API called - bypassing authentication');
    const body = await request.json();
    const { studentId, mentorId, content } = body;

    // Basic validation
    if (!studentId || !mentorId || !content) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: studentId, mentorId, and content are required' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    
    // Verify that the mentor is assigned to this student
    const [assignmentCheck] = await pool.query(
      'SELECT 1 FROM mentor_student_assignments WHERE student_id = ? AND mentor_id = ?',
      [studentId, mentorId]
    );
    
    if (!assignmentCheck || assignmentCheck.length === 0) {
      console.error(`Mentor ${mentorId} is not assigned to student ${studentId}`);
      return NextResponse.json(
        { error: 'Mentor is not assigned to this student' },
        { status: 403 }
      );
    }
    
    // Create the message
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();
    
    console.log(`Direct student send message API: Creating message from student ${studentId} to mentor ${mentorId}`);
    
    await pool.query(`
      INSERT INTO messages (
        id, sender_id, receiver_id, content, timestamp, read, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `, [messageId, studentId, mentorId, content, timestamp]);
    
    console.log('Direct student send message API: Message created successfully');
    
    return NextResponse.json({
      success: true,
      message: {
        id: messageId,
        senderId: studentId,
        receiverId: mentorId,
        content,
        timestamp,
        read: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error in direct student send message API:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 