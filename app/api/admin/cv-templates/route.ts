import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getPool, runQuery } from '@/lib/db';

// Get all CV templates
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
      SELECT id, name, description, category, structure, creator_id, is_active, created_at, updated_at 
      FROM cv_templates 
      ORDER BY id DESC
    `);

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching CV templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create a new CV template (admin only)
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
    const { name, description, category, structure } = await request.json();
    
    // Validate required fields
    if (!name || !structure) {
      return NextResponse.json({ error: 'Name and structure are required' }, { status: 400 });
    }

    // Convert structure to JSON string if it's an object
    const structureString = typeof structure === 'object' ? JSON.stringify(structure) : structure;

    // Create new template
    const result = await runQuery(
      'INSERT INTO cv_templates (name, description, category, structure, creator_id) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, category || 'General', structureString, decoded.id]
    );

    return NextResponse.json({ 
      message: 'CV template created successfully',
      id: result.lastID
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating CV template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 