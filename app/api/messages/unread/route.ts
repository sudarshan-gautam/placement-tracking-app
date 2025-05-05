import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as { id?: string; role?: string; };
    
    if (!user.id) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const pool = await getPool();
    
    // Get total unread message count
    const [totalUnreadResult] = await pool.query(`
      SELECT COUNT(*) as totalUnread
      FROM messages
      WHERE receiver_id = ? AND read = 0
    `, [user.id]);
    
    // Get unread count per sender
    const [senderUnreadResults] = await pool.query(`
      SELECT 
        sender_id as senderId,
        COUNT(*) as unreadCount,
        MAX(timestamp) as latestMessageTime,
        u.name as senderName,
        u.email as senderEmail,
        u.role as senderRole
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.receiver_id = ? AND m.read = 0
      GROUP BY m.sender_id
    `, [user.id]);
    
    return NextResponse.json({
      totalUnread: totalUnreadResult[0]?.totalUnread || 0,
      senderUnreads: senderUnreadResults || []
    });
  } catch (error) {
    console.error('Error fetching unread message counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread message counts', totalUnread: 0, senderUnreads: [] },
      { status: 500 }
    );
  }
} 