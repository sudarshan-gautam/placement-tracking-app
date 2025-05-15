import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Direct access API to get conversations for a student (bypassing authentication)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    
    console.log(`Direct student conversations API called for student ${studentId}`);
    
    // Validate student ID
    if (!studentId) {
      console.error('No student ID provided');
      return NextResponse.json(
        { error: 'Missing studentId parameter' },
        { status: 400 }
      );
    }
    
    const pool = await getPool();
    
    // Get all conversations for the student
    // This gets the latest message from each conversation partner
    const [conversations] = await pool.query(`
      WITH ranked_messages AS (
        SELECT 
          m.*,
          ROW_NUMBER() OVER (
            PARTITION BY 
              CASE 
                WHEN m.sender_id = ? THEN m.receiver_id 
                ELSE m.sender_id 
              END
            ORDER BY m.timestamp DESC
          ) as rn,
          CASE 
            WHEN m.sender_id = ? THEN m.receiver_id 
            ELSE m.sender_id 
          END as other_user_id
        FROM messages m
        WHERE m.sender_id = ? OR m.receiver_id = ?
      )
      SELECT 
        rm.id,
        rm.sender_id as senderId,
        rm.receiver_id as receiverId,
        rm.content,
        rm.timestamp,
        rm.read,
        rm.other_user_id as otherUserId,
        u.name as otherUserName,
        u.email as otherUserEmail,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = rm.other_user_id 
         AND receiver_id = ? 
         AND read = 0) as unreadCount
      FROM ranked_messages rm
      JOIN users u ON u.id = rm.other_user_id
      WHERE rn = 1
      ORDER BY rm.timestamp DESC
    `, [studentId, studentId, studentId, studentId, studentId]);
    
    console.log(`Direct student conversations API: Found ${conversations.length} conversations for student ${studentId}`);
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error in direct student conversations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations', conversations: [] },
      { status: 500 }
    );
  }
} 