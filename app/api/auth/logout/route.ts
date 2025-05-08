import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response for the logout
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
    
    // Clear all authentication-related cookies
    
    // Clear the main userData cookie
    response.cookies.set({
      name: 'userData',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Immediately expire the cookie
      path: '/'
    });
    
    // Clear Next Auth cookies if they exist
    response.cookies.set({
      name: 'next-auth.session-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      path: '/'
    });
    
    response.cookies.set({
      name: 'next-auth.csrf-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      expires: new Date(0),
      path: '/'
    });
    
    // For Safari and other browsers that might handle cookies differently
    response.cookies.set({
      name: 'userData',
      value: '',
      expires: new Date(0),
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 