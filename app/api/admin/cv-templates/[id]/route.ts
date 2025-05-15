import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getPool, runQuery } from '@/lib/db';

// Get a specific CV template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the CV template
    const pool = await getPool();
    const [template] = await pool.query(
      `SELECT * FROM cv_templates WHERE id = ?`,
      [params.id]
    );

    if (!template || (template as any[]).length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const templateData = (template as any[])[0];
    
    // Parse structure if it's stored as a JSON string
    if (typeof templateData.structure === 'string') {
      try {
        templateData.structure = JSON.parse(templateData.structure);
      } catch (error) {
        console.error('Error parsing template structure:', error);
      }
    }

    return NextResponse.json(templateData);
  } catch (error) {
    console.error('Error fetching CV template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update a CV template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and ensure admin access
    const decoded = await verifyAuth(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access only' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description, category, structure, is_active } = body;

    // Validate required fields
    if (name === '' || name === undefined) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    // Check if template exists
    const pool = await getPool();
    const [existingTemplate] = await pool.query(
      'SELECT * FROM cv_templates WHERE id = ?',
      [params.id]
    );

    if (!existingTemplate || (existingTemplate as any[]).length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create the SET clause parts and params for the SQL query
    const updates: string[] = [];
    const queryParams: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      queryParams.push(name);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      queryParams.push(description);
    }

    if (category !== undefined) {
      updates.push('category = ?');
      queryParams.push(category);
    }

    if (structure !== undefined) {
      updates.push('structure = ?');
      queryParams.push(typeof structure === 'object' ? JSON.stringify(structure) : structure);
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      queryParams.push(is_active ? 1 : 0);
    }

    // Add updated_at timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP');

    // Add the template ID to the query params
    queryParams.push(params.id);

    // Update the template
    if (updates.length > 0) {
      await runQuery(
        `UPDATE cv_templates SET ${updates.join(', ')} WHERE id = ?`,
        queryParams
      );
    }

    return NextResponse.json({ 
      message: 'CV template updated successfully',
      id: params.id
    });
  } catch (error) {
    console.error('Error updating CV template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete a CV template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and ensure admin access
    const decoded = await verifyAuth(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access only' }, { status: 401 });
    }

    // Check if template exists
    const pool = await getPool();
    const [existingTemplate] = await pool.query(
      'SELECT * FROM cv_templates WHERE id = ?',
      [params.id]
    );

    if (!existingTemplate || (existingTemplate as any[]).length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if template is used by any CVs
    const [cvCount] = await pool.query(
      'SELECT COUNT(*) as count FROM student_cvs WHERE template_id = ?',
      [params.id]
    );

    if ((cvCount as any[])[0].count > 0) {
      // Instead of deleting, mark as inactive
      await runQuery(
        'UPDATE cv_templates SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [params.id]
      );
      
      return NextResponse.json({ 
        message: 'CV template marked as inactive (it is being used by student CVs)',
        id: params.id
      });
    }

    // Delete the template if not in use
    await runQuery(
      'DELETE FROM cv_templates WHERE id = ?',
      [params.id]
    );

    return NextResponse.json({ message: 'CV template deleted successfully' });
  } catch (error) {
    console.error('Error deleting CV template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 