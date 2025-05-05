import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // Test the connection
    await connection.connect();
    
    // Get all tables in the database
    const [tables] = await connection.execute('SHOW TABLES');
    
    // Close the connection
    await connection.end();

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