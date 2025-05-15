import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getPool, runQuery } from '@/lib/db';

// Get all cover letter templates
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token
    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all templates
    const pool = await getPool();
    const [templates] = await pool.query(`
      SELECT id, name, description, category, creator_id, is_active, created_at, updated_at 
      FROM cover_letter_templates 
      ORDER BY id DESC
    `);

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching cover letter templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create a new cover letter template (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token and ensure the user is an admin
    const decoded = await verifyAuth(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access only' }, { status: 401 });
    }

    // Parse the request body
    const { name, description, category, content } = await request.json();
    
    // Validate required fields
    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    // Create new template
    const result = await runQuery(
      'INSERT INTO cover_letter_templates (name, description, category, content, creator_id) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, category || null, content, decoded.id]
    );

    return NextResponse.json({ 
      message: 'Cover letter template created successfully',
      id: result.lastID
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating cover letter template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 