import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Direct access API to get messages between a student and mentor (bypassing authentication)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const mentorId = url.searchParams.get('mentorId');
    
    console.log(`Direct student messages API called for student ${studentId} and mentor ${mentorId}`);
    
    // Validate parameters
    if (!studentId || !mentorId) {
      console.error('Missing required parameters');
      return NextResponse.json(
        { error: 'Missing studentId or mentorId parameter' },
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
        { error: 'Mentor is not assigned to this student', messages: [] },
        { status: 403 }
      );
    }
    
    // Mark all messages from mentor to student as read
    await pool.query(`
      UPDATE messages
      SET read = 1, updated_at = datetime('now')
      WHERE sender_id = ? AND receiver_id = ? AND read = 0
    `, [mentorId, studentId]);
    
    // Fetch conversation between the student and mentor
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
    `, [studentId, mentorId, mentorId, studentId]);
    
    console.log(`Direct student messages API: Found ${messages.length} messages between student ${studentId} and mentor ${mentorId}`);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in direct student messages API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', messages: [] },
      { status: 500 }
    );
  }
} 