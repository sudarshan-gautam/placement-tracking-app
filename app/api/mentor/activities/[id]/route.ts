import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";

// GET a specific activity by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the user as a mentor
    const user = await roleMiddleware(req);
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activityId = params.id;

    // Query to get activity details with student info and assigned by info
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
        a.assigned_by,
        a.created_at,
        a.updated_at,
        a.student_id,
        u.name as student_name,
        creator.name as assigned_by_name
      FROM activities a
      JOIN users u ON a.student_id = u.id
      JOIN mentor_student_assignments msa ON a.student_id = msa.student_id
      LEFT JOIN users creator ON a.assigned_by = creator.id
      WHERE a.id = ? AND msa.mentor_id = ?
    `;

    // Execute the query
    const activity = await db.getOne(sql, [activityId, user.id]);

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found or you don't have permission to view it" },
        { status: 404 }
      );
    }

    // Return the activity details
    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity details" },
      { status: 500 }
    );
  }
}

// PATCH to update an activity
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the user as a mentor
    const user = await roleMiddleware(req);
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activityId = params.id;
    const body = await req.json();
    
    // Check if the mentor is assigned to the student who owns this activity
    const checkSql = `
      SELECT a.* FROM activities a
      JOIN mentor_student_assignments msa ON a.student_id = msa.student_id
      WHERE a.id = ? AND msa.mentor_id = ?
    `;
    
    const activity = await db.getOne(checkSql, [activityId, user.id]);
    
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    // Extract fields from the request body
    const {
      title,
      description,
      activity_type,
      date_completed,
      duration_minutes,
      evidence_url,
      status
    } = body;

    // Build the update query
    let updateFields = [];
    let updateParams = [];

    if (title !== undefined) {
      updateFields.push("title = ?");
      updateParams.push(title);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      updateParams.push(description);
    }

    if (activity_type !== undefined) {
      updateFields.push("activity_type = ?");
      updateParams.push(activity_type);
    }

    if (date_completed !== undefined) {
      updateFields.push("date_completed = ?");
      updateParams.push(date_completed);
    }

    if (duration_minutes !== undefined) {
      updateFields.push("duration_minutes = ?");
      updateParams.push(duration_minutes);
    }

    if (evidence_url !== undefined) {
      updateFields.push("evidence_url = ?");
      updateParams.push(evidence_url);
    }

    if (status !== undefined) {
      updateFields.push("status = ?");
      updateParams.push(status);
    }

    // Add updated_at timestamp
    updateFields.push("updated_at = datetime('now')");

    // Only update if there are fields to update
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Build and execute the update query
    const updateSql = `
      UPDATE activities
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    updateParams.push(activityId);
    await db.runQuery(updateSql, updateParams);

    // Fetch the updated activity
    const updatedActivity = await db.getOne(`
      SELECT 
        a.*, 
        u.name as student_name,
        creator.name as assigned_by_name
      FROM activities a 
      JOIN users u ON a.student_id = u.id
      LEFT JOIN users creator ON a.assigned_by = creator.id
      WHERE a.id = ?
    `, [activityId]);

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}

// DELETE an activity
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the user as a mentor
    const user = await roleMiddleware(req);
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activityId = params.id;

    // Check if the mentor is assigned to the student who owns this activity
    const checkSql = `
      SELECT a.* FROM activities a
      JOIN mentor_student_assignments msa ON a.student_id = msa.student_id
      WHERE a.id = ? AND msa.mentor_id = ?
    `;
    
    const activity = await db.getOne(checkSql, [activityId, user.id]);
    
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Delete the activity
    await db.runQuery("DELETE FROM activities WHERE id = ?", [activityId]);

    return NextResponse.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
} 