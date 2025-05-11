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

// GET /api/competencies
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const isTemplate = searchParams.get("isTemplate") === "true";

    // Open database connection
    const db = await openDb();

    // If isTemplate is true, return competency templates (not associated with a student)
    if (isTemplate) {
      let sql = `
        SELECT 
          id, 
          name, 
          category, 
          description,
          created_at,
          updated_at
        FROM competencies
        WHERE 1=1
      `;

      const params: any[] = [];

      if (category) {
        sql += " AND category = ?";
        params.push(category);
      }

      sql += " ORDER BY category, name";
      
      const competencies = await db.all(sql, ...params);
      await db.close();
      return NextResponse.json(competencies);
    }

    // Otherwise, fetch student competencies with verifications
    const studentId = searchParams.get("studentId");
    const level = searchParams.get("level");

    let sql = `
      SELECT 
        sc.id,
        sc.level,
        sc.evidence_url,
        sc.created_at,
        sc.updated_at,
        sc.student_id,
        u.name as student_name,
        c.id as competency_id,
        c.name as competency_name,
        c.category as competency_category,
        c.description as competency_description,
        cv.id as verification_id,
        cv.verification_status,
        cv.feedback,
        vm.name as verified_by_name
      FROM student_competencies sc
      JOIN competencies c ON sc.competency_id = c.id
      JOIN users u ON sc.student_id = u.id
      LEFT JOIN competency_verifications cv ON sc.id = cv.student_competency_id
      LEFT JOIN users vm ON cv.verified_by = vm.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Apply appropriate filters based on user role
    if (user.role === 'student') {
      // Students can only see their own competencies
      sql += " AND sc.student_id = ?";
      params.push(user.id);
    } else if (user.role === 'mentor') {
      // For mentors, filter to only their assigned students
      sql += ` AND sc.student_id IN (
        SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?
      )`;
      params.push(user.id);
      
      // Apply additional studentId filter if provided
      if (studentId) {
        sql += " AND sc.student_id = ?";
        params.push(studentId);
      }
    } else if (user.role === 'admin') {
      // Admins can see all student competencies or filter by studentId
      if (studentId) {
        sql += " AND sc.student_id = ?";
        params.push(studentId);
      }
    }

    // Apply level filter if provided
    if (level) {
      sql += " AND sc.level = ?";
      params.push(level);
    }

    // Apply category filter if provided
    if (category) {
      sql += " AND c.category = ?";
      params.push(category);
    }

    // Add order by clause
    sql += " ORDER BY c.category, c.name, sc.level DESC";

    // Execute query
    const competencies = await db.all(sql, ...params);

    // Close database connection
    await db.close();

    return NextResponse.json(competencies);
  } catch (error) {
    console.error("Error fetching competencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch competencies" },
      { status: 500 }
    );
  }
} 