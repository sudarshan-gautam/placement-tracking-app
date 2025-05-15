import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPool, findUserById } from '@/lib/db';

// Helper to get authenticated user from request
async function getAuthenticatedUser(request: Request) {
  // First try NextAuth session
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id) {
    return { id: session.user.id, role: session.user.role };
  }
  
  // If no session, try token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Parse the token (in a real app, verify it)
    try {
      // This is a simple implementation - in a real app, you'd verify the token
      // For now, we'll just extract the user ID from token
      // In this app, the token is just the user ID since we're using a simplified auth
      const userData = await findUserById(token);
      if (userData) {
        return { id: userData.id, role: userData.role };
      }
    } catch (error) {
      console.error('Token validation error:', error);
    }
  }
  
  return null;
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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