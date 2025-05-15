import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { findUserById } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Log all headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log('Request headers:', headers);
    
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    console.log('NextAuth session:', session);
    
    // Check token from header
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header:', authHeader);
    
    let tokenUser = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('Extracted token:', token.substring(0, 10) + '...');
      
      // Try to get user from token
      try {
        tokenUser = await findUserById(token);
        console.log('Found user from token:', tokenUser ? {
          id: tokenUser.id,
          role: tokenUser.role,
          name: tokenUser.name
        } : null);
      } catch (e) {
        console.error('Error finding user by token:', e);
      }
    }
    
    // Return debugging info
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session ? {
        userId: session.user?.id,
        userRole: session.user?.role,
        userName: session.user?.name,
      } : null,
      hasTokenAuth: !!authHeader,
      tokenValid: !!tokenUser,
      tokenUser: tokenUser ? {
        id: tokenUser.id,
        role: tokenUser.role,
        name: tokenUser.name,
      } : null,
      requestInfo: {
        method: request.method,
        url: request.url,
        headers: headers
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 