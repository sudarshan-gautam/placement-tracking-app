import { NextRequest, NextResponse } from 'next/server';
import { roleMiddleware } from '@/lib/auth-middleware';
import db from '@/lib/db';

// GET all mentors
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and mentors can access mentor list
    if (user.role !== 'admin' && user.role !== 'mentor') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all mentors from the database
    const mentors = await db.getAll(`
      SELECT id, name, email, role
      FROM users
      WHERE role = 'mentor'
      ORDER BY name ASC
    `);

    return NextResponse.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { error: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
} 