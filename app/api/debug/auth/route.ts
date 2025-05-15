import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { findUserById } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    
    // Check token from header
    const authHeader = request.headers.get('Authorization');
    let tokenData = null;
    let tokenUser = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      tokenData = token;
      
      // Try to get user from token
      try {
        tokenUser = await findUserById(token);
      } catch (e) {
        console.error('Error finding user by token:', e);
      }
    }
    
    // Return debugging info
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        userId: session.user?.id,
        userRole: session.user?.role,
        userName: session.user?.name,
      } : null,
      hasToken: !!authHeader,
      tokenValue: tokenData ? tokenData.substring(0, 10) + '...' : null,
      tokenUserFound: !!tokenUser,
      tokenUser: tokenUser ? {
        id: tokenUser.id,
        role: tokenUser.role,
        name: tokenUser.name,
      } : null,
      headers: Object.fromEntries(request.headers.entries())
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json({ error: 'Auth debug failed' }, { status: 500 });
  }
} 