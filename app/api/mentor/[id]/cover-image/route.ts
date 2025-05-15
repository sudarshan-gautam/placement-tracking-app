import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getPool, runQuery } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Processing mentor cover image upload for id:', params.id);
    
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    // Extract token safely
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      console.log('No valid token found in Authorization header');
      return NextResponse.json({ error: 'Unauthorized - No valid token provided' }, { status: 401 });
    }

    // Verify authentication
    console.log('Verifying authentication token');
    const decoded = await verifyAuth(token);
    console.log('Token verification result:', decoded ? { id: decoded.id, role: decoded.role } : 'Failed');
    
    if (!decoded || decoded.id !== params.id) {
      console.log('Authorization failed, decoded ID does not match params ID');
      return NextResponse.json({ error: 'Unauthorized - Invalid credentials' }, { status: 401 });
    }

    console.log('Processing file upload');
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      console.log('No file found in request');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File received:', file.name, 'type:', file.type, 'size:', file.size);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      console.log('Creating uploads directory:', uploadsDir);
      await mkdir(uploadsDir, { recursive: true });
    }

    // Create a unique filename to avoid collisions
    const fileExt = path.extname(file.name) || '.jpg';
    const baseName = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueId = Date.now();
    const userId = params.id;
    
    // Save the file with a structured name: userId_cover_baseName_timestamp.ext
    const filename = `${userId}_cover_${baseName}_${uniqueId}${fileExt}`;
    const filePath = join(uploadsDir, filename);
    
    console.log('Saving file to:', filePath);
    await writeFile(filePath, buffer);

    // Update the user's cover image in the database
    const imageUrl = `/uploads/${filename}`;
    console.log('Updating database with cover image URL:', imageUrl);
    
    // Check if user profile exists
    const pool = await getPool();
    const [profileResult] = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [params.id]
    );
    
    // If profile exists, update it; otherwise, create a new profile record
    if (profileResult && (profileResult as any[]).length > 0) {
      console.log('Updating existing profile with new cover image URL');
      await runQuery(
        'UPDATE user_profiles SET coverImage = ? WHERE user_id = ?',
        [imageUrl, params.id]
      );
    } else {
      console.log('Creating new profile record with cover image URL');
      await runQuery(
        'INSERT INTO user_profiles (user_id, coverImage) VALUES (?, ?)',
        [params.id, imageUrl]
      );
    }

    console.log('Cover image updated successfully');
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading cover image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 