import { NextResponse } from 'next/server';
import { clearMongoCache } from '@/lib/mongodb';

export async function GET() {
  try {
    // Clear MongoDB connection cache
    clearMongoCache();
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'MongoDB connection cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing MongoDB cache:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to clear MongoDB cache' },
      { status: 500 }
    );
  }
} 