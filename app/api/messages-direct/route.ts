import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Direct access to messages data (bypassing authentication for debugging)
export async function GET(request: Request) {
  try {
    console.log('Direct messages API called - bypassing authentication');
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId'); // Optional user ID parameter
    const adminId = '97214de6b0038730265ffbc448850c6d'; // Hard-coded admin user ID for debugging
    
    const pool = await getPool();
    
    // If specific userId is provided, fetch messages between admin and that user
    if (userId) {
      console.log(`Direct messages API: Fetching messages between admin and user ${userId}`);
      
      // Fetch conversation between the admin and the specified user
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
      `, [adminId, userId, userId, adminId]);
      
      console.log(`Direct messages API: Found ${messages.length} messages`);
      return NextResponse.json({ messages });
    } 
    
    // Otherwise, fetch all conversations for the admin
    console.log('Direct messages API: Fetching all conversations for admin');
    
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
    `, [adminId, adminId, adminId, adminId, adminId]);
    
    console.log(`Direct messages API: Found ${conversations.length} conversations`);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error in direct messages API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', conversations: [], messages: [] },
      { status: 500 }
    );
  }
} 