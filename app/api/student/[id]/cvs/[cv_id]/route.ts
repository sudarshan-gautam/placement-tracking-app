import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getPool, runQuery } from '@/lib/db';

// Get a specific CV
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; cv_id: string } }
) {
  try {
    // Get token from the Authorization header
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyAuth(token);
    if (!decoded || (decoded.role === 'student' && decoded.id !== params.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the CV
    const pool = await getPool();
    const [cv] = await pool.query(
      `SELECT 
        sc.*, 
        ct.name as template_name,
        ct.structure as template_structure
      FROM student_cvs sc
      LEFT JOIN cv_templates ct ON sc.template_id = ct.id
      WHERE sc.id = ? AND sc.student_id = ?`,
      [params.cv_id, params.id]
    );

    if (!cv || (cv as any[]).length === 0) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Parse the content and template structure if they're stored as JSON strings
    try {
      const cvData = (cv as any[])[0];
      if (typeof cvData.content === 'string') {
        cvData.content = JSON.parse(cvData.content);
      }
      if (typeof cvData.template_structure === 'string') {
        cvData.template_structure = JSON.parse(cvData.template_structure);
      }
      return NextResponse.json(cvData);
    } catch (error) {
      console.error('Error parsing CV data:', error);
      return NextResponse.json((cv as any[])[0]);
    }
  } catch (error) {
    console.error('Error fetching CV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update a specific CV
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; cv_id: string } }
) {
  try {
    // Get token from the Authorization header
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyAuth(token);
    if (!decoded || (decoded.role === 'student' && decoded.id !== params.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { name, template_id, content, html_content, is_draft, regenerate_ats_score } = await request.json();

    // Check if CV exists and belongs to the student
    const pool = await getPool();
    const [existingCV] = await pool.query(
      'SELECT * FROM student_cvs WHERE id = ? AND student_id = ?',
      [params.cv_id, params.id]
    );

    if (!existingCV || (existingCV as any[]).length === 0) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Calculate new ATS score if requested or if content has changed
    let atsScore = (existingCV as any[])[0].ats_score;
    let isAtsOptimized = (existingCV as any[])[0].is_ats_optimized;
    
    if (regenerate_ats_score || (content && content !== (existingCV as any[])[0].content)) {
      // In a real implementation, you'd use a proper ATS scoring algorithm
      // This is a simplified example
      const contentStr = typeof content === 'object' ? JSON.stringify(content) : content;
      const contentObj = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Count the number of fields that have content
      const filledFields = Object.values(contentObj || {}).filter(val => !!val).length;
      const totalFields = Object.keys(contentObj || {}).length;
      
      // Calculate score based on field coverage
      if (totalFields > 0) {
        const baseScore = Math.floor((filledFields / totalFields) * 70);
        // Add random "bonus" points for quality (simulated)
        atsScore = Math.min(baseScore + Math.floor(Math.random() * 30), 100);
      } else {
        atsScore = Math.floor(Math.random() * 31) + 70; // Fallback to random 70-100
      }
      
      // Set is_ats_optimized to 1 if score is 90 or above
      isAtsOptimized = atsScore >= 90 ? 1 : 0;
    }

    // Convert content to JSON string if it's an object
    const contentString = typeof content === 'object' ? JSON.stringify(content) : content;

    // Update the CV
    await runQuery(
      `UPDATE student_cvs 
      SET 
        name = ?, 
        template_id = ?, 
        content = ?, 
        html_content = ?, 
        is_ats_optimized = ?,
        ats_score = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND student_id = ?`,
      [
        name || (existingCV as any[])[0].name,
        template_id !== undefined ? template_id : (existingCV as any[])[0].template_id,
        contentString || (existingCV as any[])[0].content,
        html_content || (existingCV as any[])[0].html_content,
        isAtsOptimized,
        atsScore,
        params.cv_id,
        params.id
      ]
    );

    return NextResponse.json({ 
      message: 'CV updated successfully',
      id: params.cv_id,
      ats_score: atsScore
    });
  } catch (error) {
    console.error('Error updating CV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete a specific CV
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; cv_id: string } }
) {
  try {
    // Get token from the Authorization header
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyAuth(token);
    if (!decoded || (decoded.role === 'student' && decoded.id !== params.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if CV exists and belongs to the student
    const pool = await getPool();
    const [existingCV] = await pool.query(
      'SELECT * FROM student_cvs WHERE id = ? AND student_id = ?',
      [params.cv_id, params.id]
    );

    if (!existingCV || (existingCV as any[]).length === 0) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Delete the CV
    await runQuery(
      'DELETE FROM student_cvs WHERE id = ? AND student_id = ?',
      [params.cv_id, params.id]
    );

    return NextResponse.json({ message: 'CV deleted successfully' });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 