import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Direct access API to get messages between a mentor and student (bypassing authentication)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mentorId = url.searchParams.get('mentorId');
    const studentId = url.searchParams.get('studentId');
    
    console.log(`Direct mentor messages API called for mentor ${mentorId} and student ${studentId}`);
    
    // Validate parameters
    if (!mentorId || !studentId) {
      console.error('Missing required parameters');
      return NextResponse.json(
        { error: 'Missing mentorId or studentId parameter' },
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
        { error: 'Student is not assigned to this mentor', messages: [] },
        { status: 403 }
      );
    }
    
    // Mark all messages from student to mentor as read
    await pool.query(`
      UPDATE messages
      SET read = 1, updated_at = datetime('now')
      WHERE sender_id = ? AND receiver_id = ? AND read = 0
    `, [studentId, mentorId]);
    
    // Fetch conversation between the mentor and student
    const [messages] = await pool.query(`
      SELECT 
        id,
        sender_id as senderId,
        receiver_id as receiverId,
        content,
        timestamp,
        read,
        created_at as createdAt,
        updated_at as updatedAt
      FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY timestamp ASC
    `, [mentorId, studentId, studentId, mentorId]);
    
    console.log(`Direct mentor messages API: Found ${messages.length} messages between mentor ${mentorId} and student ${studentId}`);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in direct mentor messages API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', messages: [] },
      { status: 500 }
    );
  }
} 