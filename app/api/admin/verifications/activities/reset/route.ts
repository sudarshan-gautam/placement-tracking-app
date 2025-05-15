import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";

// Define activity interface
interface Activity {
  id: string;
  status: string;
}

// POST to reset an activity verification status
export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the user as admin
    const user = await roleMiddleware(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { activity_id, reset } = body;

    // Validate required fields
    if (!activity_id || reset !== true) {
      return NextResponse.json(
        { error: "Activity ID and reset flag are required" },
        { status: 400 }
      );
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

    // Check if the activity is already in submitted status (pending verification)
    if (activity.status === 'submitted') {
      return NextResponse.json(
        { success: true, message: "Activity is already in pending verification status" }
      );
    }

    // Reset the activity status back to 'submitted' (pending verification)
    const updateSql = `
      UPDATE activities 
      SET 
        status = 'submitted',
        updated_at = datetime('now')
      WHERE id = ?
    `;
    
    await db.runQuery(updateSql, [activity_id]);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Activity verification has been reset"
    });
  } catch (error) {
    console.error("Error resetting activity verification:", error);
    return NextResponse.json(
      { error: "Failed to reset verification" },
      { status: 500 }
    );
  }
} 