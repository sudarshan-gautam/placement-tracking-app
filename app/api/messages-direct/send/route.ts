import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Direct API for sending messages (no authentication)
export async function POST(request: Request) {
  try {
    console.log('Direct messages send API called - bypassing authentication');
    const body = await request.json();
    const { receiverId, content, senderIsAdmin = false } = body;

    // Basic validation
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: receiverId and content are required' },
        { status: 400 }
      );
    }

    // For direct API, we'll use admin user ID as sender
    const adminId = '97214de6b0038730265ffbc448850c6d'; // Hard-coded admin ID
    const senderId = senderIsAdmin ? adminId : receiverId; // If not admin sending, assume it's a reply
    const actualReceiverId = senderIsAdmin ? receiverId : adminId; // If not admin sending, it goes to admin

    const pool = await getPool();
    
    // Check if receiver exists
    const [receiverResults] = await pool.query(
      'SELECT id, role FROM users WHERE id = ?',
      [actualReceiverId]
    );
    
    if (!receiverResults || receiverResults.length === 0) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Create the message
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();
    
    console.log(`Direct messages send API: Creating message from ${senderId} to ${actualReceiverId}`);
    
    await pool.query(`
      INSERT INTO messages (
        id, sender_id, receiver_id, content, timestamp, read, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `, [messageId, senderId, actualReceiverId, content, timestamp]);
    
    console.log('Direct messages send API: Message created successfully');
    
    return NextResponse.json({
      success: true,
      message: {
        id: messageId,
        senderId: senderId,
        receiverId: actualReceiverId,
        content,
        timestamp,
        read: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error in direct message send API:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 