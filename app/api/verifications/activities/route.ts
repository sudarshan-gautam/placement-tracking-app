import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Define Activity type
interface Activity {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  activity_type: string;
  date_completed: string;
  duration_minutes?: number;
  evidence_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// POST to verify or reject an activity
export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(req);
    if (!user || (user.role !== "mentor" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { activity_id, verification_status, feedback } = body;

    // Validate required fields
    if (!activity_id || !verification_status) {
      return NextResponse.json(
        { error: "Activity ID and verification status are required" },
        { status: 400 }
      );
    }

    // Validate verification status
    if (verification_status !== "verified" && verification_status !== "rejected") {
      return NextResponse.json(
        { error: "Verification status must be 'verified' or 'rejected'" },
        { status: 400 }
      );
    }

    // For mentors, check if they are assigned to the student who owns the activity
    if (user.role === "mentor") {
      const checkAssignmentSql = `
        SELECT * FROM mentor_student_assignments msa
        JOIN activities a ON msa.student_id = a.student_id
        WHERE msa.mentor_id = ? AND a.id = ?
      `;
      const assignment = await db.getOne(checkAssignmentSql, [user.id, activity_id]);
      
      if (!assignment) {
        return NextResponse.json(
          { error: "You are not authorized to verify this activity" },
          { status: 403 }
        );
      }
    }

    // First, check if the activity exists
    const activitySql = `SELECT * FROM activities WHERE id = ?`;
    const activity = await db.getOne<Activity>(activitySql, [activity_id]);

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Get student_id from the activity
    const student_id = activity.student_id;
    if (!student_id) {
      return NextResponse.json(
        { error: "Invalid activity data: missing student_id" },
        { status: 400 }
      );
    }

    // Check if a verification record already exists
    const checkSql = `SELECT * FROM activity_verifications WHERE activity_id = ?`;
    const existingVerification = await db.getOne(checkSql, [activity_id]);

    // Generate verification ID
    const verificationId = existingVerification && typeof existingVerification === 'object' && existingVerification !== null && 'id' in existingVerification
      ? (existingVerification as { id: string }).id 
      : uuidv4();
    
    // Prepare verification data
    let sql = '';
    let params: any[] = [];
    
    if (existingVerification) {
      // Update existing verification
      sql = `
        UPDATE activity_verifications
        SET verification_status = ?, feedback = ?, verified_by = ?, updated_at = datetime('now')
        WHERE activity_id = ?
      `;
      params = [verification_status, feedback || null, user.id, activity_id];
    } else {
      // Create new verification
      sql = `
        INSERT INTO activity_verifications (id, activity_id, student_id, verification_status, feedback, verified_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      params = [verificationId, activity_id, student_id, verification_status, feedback || null, user.id];
    }

    // Execute verification update/insert
    await db.runQuery(sql, params);

    // Update the activity status if verified
    if (verification_status === "verified") {
      const updateActivitySql = `
        UPDATE activities
        SET status = 'completed', updated_at = datetime('now')
        WHERE id = ?
      `;
      await db.runQuery(updateActivitySql, [activity_id]);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Activity ${verification_status === "verified" ? "verified" : "rejected"} successfully`,
      verification_id: verificationId
    });
  } catch (error) {
    console.error("Error verifying activity:", error);
    return NextResponse.json(
      { error: "Failed to process verification" },
      { status: 500 }
    );
  }
} 