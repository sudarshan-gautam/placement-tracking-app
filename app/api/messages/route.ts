import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPool } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET endpoint to retrieve conversations for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as { id?: string; role?: string; };
    
    if (!user.id) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const url = new URL(request.url);
    const otherUserId = url.searchParams.get('userId');

    const pool = await getPool();
    
    // If otherUserId is provided, fetch messages between the two users
    if (otherUserId) {
      // Mark all messages from otherUser to currentUser as read
      await pool.query(`
        UPDATE messages
        SET read = 1, updated_at = datetime('now')
        WHERE sender_id = ? AND receiver_id = ? AND read = 0
      `, [otherUserId, user.id]);
      
      // Fetch conversation between the two users
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
      `, [user.id, otherUserId, otherUserId, user.id]);
      
      return NextResponse.json({ messages });
    } 
    
    // Otherwise, fetch all conversations summary for the current user
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
    `, [user.id, user.id, user.id, user.id, user.id]);
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST endpoint to send a new message
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as { id?: string; role?: string; };
    
    if (!user.id) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: receiverId and content are required' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    
    // Make sure the receiver exists
    const [receiverResults] = await pool.query(
      'SELECT id, role FROM users WHERE id = ?',
      [receiverId]
    );
    
    if (!receiverResults || receiverResults.length === 0) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }
    
    const receiver = receiverResults[0];
    
    // Apply messaging permissions based on roles
    
    // 1. Admin can message anyone
    if (user.role === 'admin') {
      // No restrictions - admin can message anyone
    }
    // 2. Mentor can message admin and their assigned students
    else if (user.role === 'mentor') {
      // Mentor can message admin
      if (receiver.role === 'admin') {
        // Allowed
      }
      // Mentor can message their assigned students
      else if (receiver.role === 'student') {
        // Check if this student is assigned to the mentor
        const [assignmentCheck] = await pool.query(
          'SELECT 1 FROM mentor_students WHERE mentor_id = ? AND student_id = ?',
          [user.id, receiverId]
        );
        
        if (!assignmentCheck || assignmentCheck.length === 0) {
          return NextResponse.json(
            { error: 'You can only message students assigned to you' },
            { status: 403 }
          );
        }
      }
      // Mentor cannot message other mentors
      else if (receiver.role === 'mentor') {
        return NextResponse.json(
          { error: 'Mentors cannot message other mentors' },
          { status: 403 }
        );
      }
    }
    // 3. Student can only message assigned mentors
    else if (user.role === 'student') {
      // Student can message their mentors
      if (receiver.role === 'mentor') {
        // Check if this mentor is assigned to the student
        const [assignmentCheck] = await pool.query(
          'SELECT 1 FROM mentor_students WHERE student_id = ? AND mentor_id = ?',
          [user.id, receiverId]
        );
        
        if (!assignmentCheck || assignmentCheck.length === 0) {
          return NextResponse.json(
            { error: 'You can only message mentors assigned to you' },
            { status: 403 }
          );
        }
      }
      // Student cannot message admins
      else if (receiver.role === 'admin') {
        return NextResponse.json(
          { error: 'Students cannot message administrators directly' },
          { status: 403 }
        );
      }
      // Student cannot message other students
      else if (receiver.role === 'student') {
        return NextResponse.json(
          { error: 'Students cannot message other students' },
          { status: 403 }
        );
      }
    }
    
    // Create the message
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();
    
    await pool.query(`
      INSERT INTO messages (
        id, sender_id, receiver_id, content, timestamp, read, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `, [messageId, user.id, receiverId, content, timestamp]);
    
    return NextResponse.json({
      message: {
        id: messageId,
        senderId: user.id,
        receiverId,
        content,
        timestamp,
        read: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 