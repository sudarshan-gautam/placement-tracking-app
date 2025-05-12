import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";

// GET a single activity by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the user as admin
    const user = await roleMiddleware(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract ID from params
    const activityId = params.id;

    if (!activityId) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    // Query to get activity details
    const sql = `
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
        u.name as student_name,
        av.id as verification_id,
        av.verification_status,
        av.feedback,
        av.verified_by,
        vm.name as verified_by_name
      FROM activities a
      JOIN users u ON a.student_id = u.id
      LEFT JOIN activity_verifications av ON a.id = av.activity_id
      LEFT JOIN users vm ON av.verified_by = vm.id
      WHERE a.id = ?
    `;

    // Execute query
    const activity = await db.getOne(sql, [activityId]);

    // If no activity found, return 404
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
} 