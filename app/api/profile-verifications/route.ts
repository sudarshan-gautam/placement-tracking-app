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

// GET /api/profile-verifications
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    // Open database connection
    const db = await openDb();

    let sql = `
      SELECT 
        pv.id, 
        pv.user_id,
        pv.document_url,
        pv.verification_status,
        pv.feedback,
        pv.created_at,
        pv.updated_at,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        vm.name as verified_by_name
      FROM profile_verifications pv
      JOIN users u ON pv.user_id = u.id
      LEFT JOIN users vm ON pv.verified_by = vm.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Apply appropriate filters based on user role
    if (user.role === 'student') {
      // Students can only see their own profile verifications
      sql += " AND pv.user_id = ?";
      params.push(user.id);
    } else if (user.role === 'mentor') {
      // For mentors, only show profile verifications from their assigned students
      if (userId) {
        // If a specific userId is requested, check if this student is mentored by this mentor
        sql += ` AND pv.user_id = ? AND pv.user_id IN (
          SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?
        )`;
        params.push(userId, user.id);
      } else {
        // Otherwise, show all profile verifications for mentored students
        sql += ` AND pv.user_id IN (
          SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?
        )`;
        params.push(user.id);
      }
    } else if (user.role === 'admin') {
      // Admins can see all profile verifications or filter by userId
      if (userId) {
        sql += " AND pv.user_id = ?";
        params.push(userId);
      }
    }

    // Apply status filter if provided
    if (status) {
      sql += " AND pv.verification_status = ?";
      params.push(status);
    }

    // Add order by clause
    sql += " ORDER BY pv.created_at DESC";

    // Execute query
    const profileVerifications = await db.all(sql, ...params);

    // Close database connection
    await db.close();

    return NextResponse.json(profileVerifications);
  } catch (error) {
    console.error("Error fetching profile verifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile verifications" },
      { status: 500 }
    );
  }
} 