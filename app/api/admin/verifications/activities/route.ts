import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// POST to verify or reject an activity
export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the user as admin
    const user = await roleMiddleware(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { activity_id, verification_status, feedback, admin_override } = body;

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

    // First, check if the activity exists
    const activitySql = `SELECT * FROM activities WHERE id = ?`;
    const activity = await db.getOne(activitySql, [activity_id]);

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Check if a verification record already exists
    const checkSql = `SELECT * FROM activity_verifications WHERE activity_id = ?`;
    const existingVerification = await db.getOne(checkSql, [activity_id]);

    // Generate verification ID
    const verificationId = existingVerification && 
      typeof existingVerification === 'object' && 
      existingVerification !== null && 
      'id' in existingVerification ? 
      (existingVerification as { id: string }).id : 
      uuidv4();
    
    // Prepare the update SQL for activity verifications
    let params: any[] = [];
    const sql = `
      UPDATE activity_verifications
      SET verification_status = ?, feedback = ?, verified_by = ?, updated_at = datetime('now')
      WHERE activity_id = ?
    `;
    params = [verification_status, feedback || null, user.id, activity_id];

    // Execute verification update
    await db.runQuery(sql, params);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Activity verification status updated to ${verification_status}`,
      id: verificationId
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    return NextResponse.json(
      { error: "Failed to update verification status" },
      { status: 500 }
    );
  }
} 