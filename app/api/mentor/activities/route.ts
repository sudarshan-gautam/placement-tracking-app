import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// GET all activities related to a mentor's assigned students
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the user as a mentor
    const user = await roleMiddleware(req);
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const activityType = searchParams.get("type");

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
        a.assigned_by,
        a.created_at,
        a.updated_at,
        a.student_id,
        u.name as student_name,
        av.id as verification_id,
        av.verification_status,
        av.feedback,
        av.verified_by,
        vm.name as verified_by_name,
        creator.name as assigned_by_name
      FROM activities a
      JOIN users u ON a.student_id = u.id
      JOIN mentor_student_assignments msa ON a.student_id = msa.student_id
      LEFT JOIN activity_verifications av ON a.id = av.activity_id
      LEFT JOIN users vm ON av.verified_by = vm.id
      LEFT JOIN users creator ON a.assigned_by = creator.id
      WHERE msa.mentor_id = ?
    `;

    const params: any[] = [user.id];

    // Add additional filters if provided
    if (studentId) {
      sql += " AND a.student_id = ?";
      params.push(studentId);
    }

    if (status) {
      if (status === "verified" || status === "rejected" || status === "pending") {
        sql += " AND av.verification_status = ?";
        params.push(status);
      } else {
        sql += " AND a.status = ?";
        params.push(status);
      }
    }

    if (activityType) {
      sql += " AND a.activity_type = ?";
      params.push(activityType);
    }

    sql += " ORDER BY a.created_at DESC";

    // Execute the query
    const activities = await db.getAll(sql, params);

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching mentor activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

// POST to create a new activity for an assigned student
export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the user as a mentor
    const user = await roleMiddleware(req);
    if (!user || user.role !== "mentor") {
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

    // Check if the student is assigned to this mentor
    const assignmentSql = `SELECT * FROM mentor_student_assignments WHERE mentor_id = ? AND student_id = ?`;
    const assignment = await db.getOne(assignmentSql, [user.id, student_id]);

    if (!assignment) {
      return NextResponse.json(
        { error: "You can only create activities for your assigned students" },
        { status: 403 }
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
      'submitted', // Activities created by mentors are automatically submitted
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