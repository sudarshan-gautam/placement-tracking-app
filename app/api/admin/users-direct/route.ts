import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Get all users directly (bypassing authentication for debugging)
export async function GET() {
  try {
    console.log('Direct users API called - bypassing authentication');

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Get all users from the database with complete information
    try {
      const users = await db.all(`
        SELECT 
          id, 
          name, 
          email, 
          role,
          created_at,
          updated_at
        FROM users
        ORDER BY created_at DESC
      `);

      // Format users to match expected structure
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'active', // Hardcoded for now
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      console.log(`Direct users API: Found ${formattedUsers.length} users`);
      // Return array directly instead of wrapping in a users property
      return NextResponse.json(formattedUsers);
    } catch (dbError) {
      console.error('Error fetching users from database:', dbError);
      // Return empty array instead of error
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error in direct users API:', error);
    // Return empty array instead of error
    return NextResponse.json([]);
  }
} 