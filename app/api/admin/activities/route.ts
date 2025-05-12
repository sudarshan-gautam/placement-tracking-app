import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// GET all activities (with filtering options)
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the user as admin
    const user = await roleMiddleware(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const mentorId = searchParams.get("mentorId");
    const status = searchParams.get("status");
    const activityType = searchParams.get("type");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    let sql = `
      SELECT 
        a.id, 
        a.title, 
        a.description, 
        a.activity_type,
        a.date_completed,
        a.duration_minutes,
        a.evidence_url,
        a.status,
        a.created_at,
        a.updated_at,
        a.student_id,
        a.assigned_by,
        u.name as student_name,
        creator.name as assigned_by_name
      FROM activities a
      JOIN users u ON a.student_id = u.id
      LEFT JOIN users creator ON a.assigned_by = creator.id
      LEFT JOIN mentor_student_assignments um ON u.id = um.student_id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Apply filters
    if (studentId && studentId !== 'all') {
      sql += ` AND a.student_id = ?`;
      params.push(studentId);
    }

    if (mentorId && mentorId !== 'all') {
      sql += ` AND um.mentor_id = ?`;
      params.push(mentorId);
    }

    if (status && status !== 'all') {
      sql += ` AND a.status = ?`;
      params.push(status);
    }

    if (activityType && activityType !== 'all') {
      sql += ` AND a.activity_type = ?`;
      params.push(activityType);
    }

    if (fromDate) {
      sql += ` AND a.date_completed >= ?`;
      params.push(fromDate);
    }

    if (toDate) {
      sql += ` AND a.date_completed <= ?`;
      params.push(toDate);
    }

    // Order by most recent
    sql += ` ORDER BY a.created_at DESC`;

    // Execute query and return results
    const activities = await db.getAll(sql, params);

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

// POST to create a new activity for any student
export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the user as an admin
    const user = await roleMiddleware(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { 
      student_id, 
      title, 
      description, 
      activity_type, 
      date_completed,
      duration_minutes,
      evidence_url,
      learning_outcomes,
      feedback_comments
    } = body;

    // Validate required fields
    if (!student_id || !title || !activity_type || !date_completed || !duration_minutes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate student exists and is a student
    const studentSql = `SELECT * FROM users WHERE id = ? AND role = 'student'`;
    const student = await db.getOne(studentSql, [student_id]);

    if (!student) {
      return NextResponse.json(
        { error: "Invalid student ID" },
        { status: 400 }
      );
    }

    // Generate a unique ID for the activity
    const activityId = uuidv4();

    // Insert the new activity
    const insertSql = `
      INSERT INTO activities (
        id, 
        student_id, 
        title, 
        description, 
        activity_type, 
        date_completed, 
        duration_minutes, 
        evidence_url, 
        status, 
        assigned_by,
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    await db.runQuery(insertSql, [
      activityId,
      student_id,
      title,
      description || null,
      activity_type,
      date_completed,
      duration_minutes,
      evidence_url || null,
      'completed', // Activities created by admins are automatically completed
      user.id // Track who assigned this activity
    ]);

    // If learning outcomes or feedback were provided, update the activity with additional fields
    if (learning_outcomes || feedback_comments) {
      const updateSql = `
        UPDATE activities 
        SET 
          learning_outcomes = ?,
          feedback_comments = ?
        WHERE id = ?
      `;
      await db.runQuery(updateSql, [
        learning_outcomes || null,
        feedback_comments || null,
        activityId
      ]);
    }

    // Return the created activity
    const createdActivity = await db.getOne(`
      SELECT 
        a.*, 
        u.name as student_name,
        creator.name as assigned_by_name
      FROM activities a 
      JOIN users u ON a.student_id = u.id
      LEFT JOIN users creator ON a.assigned_by = creator.id
      WHERE a.id = ?
    `, [activityId]);

    if (!createdActivity) {
      throw new Error("Failed to retrieve created activity");
    }

    return NextResponse.json(createdActivity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
} 