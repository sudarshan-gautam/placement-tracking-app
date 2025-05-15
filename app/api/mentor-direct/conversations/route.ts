import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Direct access API to get conversations for a mentor (bypassing authentication)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mentorId = url.searchParams.get('mentorId');
    
    console.log(`Direct mentor conversations API called for mentor ${mentorId}`);
    
    // Validate mentor ID
    if (!mentorId) {
      console.error('No mentor ID provided');
      return NextResponse.json(
        { error: 'Missing mentorId parameter' },
        { status: 400 }
      );
    }
    
    const pool = await getPool();
    
    // Get all conversations for the mentor
    // This gets the latest message from each conversation partner
    // (includes admin messages and student messages)
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
        u.role as otherUserRole,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = rm.other_user_id 
         AND receiver_id = ? 
         AND read = 0) as unreadCount
      FROM ranked_messages rm
      JOIN users u ON u.id = rm.other_user_id
      WHERE rn = 1
      ORDER BY rm.timestamp DESC
    `, [mentorId, mentorId, mentorId, mentorId, mentorId]);
    
    console.log(`Direct mentor conversations API: Found ${conversations.length} conversations for mentor ${mentorId}`);
    
    // Check for admin messages specifically
    const adminIds = conversations
      .filter((conv: any) => conv.otherUserRole === 'admin')
      .map((conv: any) => conv.otherUserId);
      
    if (adminIds.length > 0) {
      console.log(`Found messages from ${adminIds.length} admin users`);
    } else {
      console.log('No admin conversations found');
    }
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error in direct mentor conversations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations', conversations: [] },
      { status: 500 }
    );
  }
} 