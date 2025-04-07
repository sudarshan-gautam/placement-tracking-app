import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'MONGODB_URI environment variable is not defined' 
    }, { status: 500 });
  }
  
  // Hide password in logs
  const redactedUri = uri.replace(/:[^:@]*@/, ':****@');
  console.log('Testing connection to MongoDB:', redactedUri);
  
  let client: typeof mongoose | null = null;
  
  try {
    // Manual connection without caching to test connectivity
    client = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Quick timeout for testing
    });
    
    const dbs = Object.keys(client.connection.models);
    const dbName = client.connection.db?.databaseName || 'unknown';
    
    await client.disconnect();
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'MongoDB connection successful',
      database: dbName,
      models: dbs,
      uri: redactedUri
    });
  } catch (error: any) {
    console.error('MongoDB test connection error:', error);
    
    // Try to provide helpful error messages
    let errorMessage = 'Unknown error connecting to MongoDB';
    let errorType = error.name || 'Unknown';
    
    if (error.name === 'MongooseServerSelectionError') {
      errorMessage = 'Could not connect to MongoDB server. IP may not be whitelisted.';
    } else if (error.name === 'MongoAPIError') {
      errorMessage = `MongoDB API Error: ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    if (client) {
      try {
        await client.disconnect();
      } catch (e) {
        console.error('Error disconnecting MongoDB:', e);
      }
    }
    
    return NextResponse.json({ 
      status: 'error', 
      message: errorMessage,
      errorType,
      uri: redactedUri
    }, { status: 500 });
  }
} 