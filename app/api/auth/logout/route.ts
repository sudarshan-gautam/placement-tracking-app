import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Clear all auth-related cookies
    response.cookies.set({
      name: 'authToken',
      value: '',
      expires: new Date(0), // Expire immediately
      path: '/'
    });
    
    response.cookies.set({
      name: 'userData',
      value: '',
      expires: new Date(0), // Expire immediately
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 