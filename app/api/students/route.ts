import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Helper function to open the database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });
}

// GET /api/students
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow mentors and admins to access the student list
    if (user.role === 'student') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Open database connection
    const db = await openDb();

    // Get all students
    let sql = `
      SELECT id, name, email 
      FROM users 
      WHERE role = 'student'
    `;
    
    // For mentors, only return students they are mentoring
    if (user.role === 'mentor') {
      sql = `
        SELECT u.id, u.name, u.email
        FROM users u
        JOIN mentor_student_assignments ms ON u.id = ms.student_id
        WHERE u.role = 'student' AND ms.mentor_id = ?
        ORDER BY u.name
      `;
    }

    // Execute query
    const students = user.role === 'mentor' 
      ? await db.all(sql, user.id)
      : await db.all(sql);

    // Close database connection
    await db.close();

    // Log the students data 
    console.log('Students API response:', JSON.stringify(students, null, 2));

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
} 