import { NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function GET() {
  try {
    // Open the database connection
    const dbPath = path.resolve('./database.sqlite');
    console.log('Database file exists at:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Test the connection by getting a list of tables
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    
    // Close the connection
    await db.close();

    return NextResponse.json({ 
      status: 'success',
      message: 'Database connected successfully',
      tables: tables
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to connect to database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 