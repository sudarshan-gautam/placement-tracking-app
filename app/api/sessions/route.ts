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

// GET /api/sessions
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");

    // Open database connection
    const db = await openDb();

    let sql = `
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.date, 
        s.start_time, 
        s.end_time, 
        s.location,
        s.status,
        s.reflection,
        s.created_at,
        s.updated_at,
        s.student_id,
        u.name as student_name,
        sv.id as verification_id,
        sv.verification_status,
        sv.feedback,
        vm.name as verified_by_name
      FROM sessions s
      JOIN users u ON s.student_id = u.id
      LEFT JOIN session_verifications sv ON s.id = sv.session_id
      LEFT JOIN users vm ON sv.verified_by = vm.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Apply appropriate filters based on user role
    if (user.role === 'student') {
      // Students can only see their own sessions
      sql += " AND s.student_id = ?";
      params.push(user.id);
    } else if (user.role === 'mentor') {
      // For mentors, only show sessions for students they are mentoring
      sql += ` AND s.student_id IN (
        SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?
      )`;
      params.push(user.id);
      
      // Apply additional studentId filter if provided
      if (studentId) {
        sql += " AND s.student_id = ?";
        params.push(studentId);
      }
    } else if (user.role === 'admin') {
      // Admins can see all sessions or filter by studentId
      if (studentId) {
        sql += " AND s.student_id = ?";
        params.push(studentId);
      }
    }

    // Apply status filter if provided
    if (status) {
      sql += " AND s.status = ?";
      params.push(status);
    }

    // Add order by clause
    sql += " ORDER BY s.date DESC, s.start_time DESC";

    // Execute query
    const sessions = await db.all(sql, ...params);

    // Close database connection
    await db.close();

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
} 