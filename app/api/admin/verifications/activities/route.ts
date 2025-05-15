import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";

// Define activity interface
interface Activity {
  id: string;
  title: string;
  description: string | null;
  activity_type: string;
  date_completed: string;
  duration_minutes: number;
  evidence_url: string | null;
  status: string;
  student_id: string;
  created_at: string;
  updated_at: string;
  assigned_by: string | null;
  student_name: string;
  assigned_by_name: string | null;
}

// POST to verify an activity
export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the user as admin
    const user = await roleMiddleware(req);
    if (!user || user.role !== "admin") {
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

    // Validate verification status value
    if (verification_status !== 'verified' && verification_status !== 'rejected') {
      return NextResponse.json(
        { error: "Verification status must be 'verified' or 'rejected'" },
        { status: 400 }
      );
    }

    // First, check if the activity exists
    const activitySql = `SELECT * FROM activities WHERE id = ?`;
    const activity = await db.getOne(activitySql, [activity_id]);

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Map the verification status to activity status
    const newStatus = verification_status === 'verified' ? 'completed' : 'submitted';

    // Update the activity status
    const updateSql = `
      UPDATE activities 
      SET 
        status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `;

    await db.runQuery(updateSql, [newStatus, activity_id]);

    // Log the verification operation in a database log or activity history if needed
    // For now, we're simply updating the activity status

    // Return success response with updated activity
    const updatedActivitySql = `
      SELECT 
        a.*, 
        u.name as student_name,
        creator.name as assigned_by_name
      FROM activities a
      JOIN users u ON a.student_id = u.id
      LEFT JOIN users creator ON a.assigned_by = creator.id
      WHERE a.id = ?
    `;
    
    const updatedActivity = await db.getOne<Activity>(updatedActivitySql, [activity_id]);

    if (!updatedActivity) {
      return NextResponse.json(
        { error: "Failed to retrieve updated activity" },
        { status: 500 }
      );
    }

    // Format response with verification status for the frontend
    const responseData = {
      ...updatedActivity,
      verification_status: updatedActivity.status === 'completed' ? 'verified' : 'pending',
      verified_by: user.id,
      verified_by_name: user.name,
      feedback: feedback || null
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error verifying activity:", error);
    return NextResponse.json(
      { error: "Failed to verify activity" },
      { status: 500 }
    );
  }
} 