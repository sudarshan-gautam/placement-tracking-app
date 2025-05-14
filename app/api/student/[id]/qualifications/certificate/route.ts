import { NextRequest, NextResponse } from 'next/server';
import { roleMiddleware } from '@/lib/auth-middleware';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Helper function to compress images if needed in the future
const compressImage = async (buffer: Buffer, fileType: string): Promise<Buffer> => {
  // In a production app, you would use sharp or another library to compress images
  // For now, we'll just return the original buffer
  // This is a placeholder for future implementation
  return buffer;
};

// POST endpoint to upload a certificate file
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow students to upload their own certificates, or admins to upload for any student
    if (user.role === 'student' && user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('certificate') as File;
    const qualificationId = formData.get('qualificationId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No certificate file provided' },
        { status: 400 }
      );
    }

    if (!qualificationId) {
      return NextResponse.json(
        { error: 'Qualification ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${qualificationId}-${Date.now()}.${fileExtension}`;
    
    // Ensure the certificates directory exists
    const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
    await mkdir(certificatesDir, { recursive: true });
    
    // Create user-specific directory
    const userDir = path.join(certificatesDir, params.id);
    await mkdir(userDir, { recursive: true });
    
    // Process the file
    let fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // If it's an image file, potentially compress it (placeholder for future implementation)
    if (file.type.startsWith('image/')) {
      fileBuffer = await compressImage(fileBuffer, file.type);
    }
    
    // Save the file
    const filePath = path.join(userDir, fileName);
    await writeFile(filePath, fileBuffer);
    
    // Generate the public URL - include a cache buster
    const certificateUrl = `/certificates/${params.id}/${fileName}?v=${Date.now()}`;
    
    // Update the qualification record with the certificate URL
    const sqlite3 = require('sqlite3').verbose();
    const { open } = require('sqlite');
    
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    // Check if qualification exists and belongs to the student
    const qualification = await db.get(
      `SELECT * FROM qualifications WHERE id = ? AND student_id = ?`,
      qualificationId,
      params.id
    );
    
    if (!qualification) {
      await db.close();
      return NextResponse.json(
        { error: 'Qualification not found' },
        { status: 404 }
      );
    }
    
    // Update the certificate URL
    await db.run(
      `UPDATE qualifications SET 
        certificate_url = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      certificateUrl,
      qualificationId
    );
    
    // Get the updated qualification
    const updatedQualification = await db.get(
      `SELECT * FROM qualifications WHERE id = ?`,
      qualificationId
    );
    
    await db.close();
    
    // Add cache control header to response
    const response = NextResponse.json({
      success: true,
      certificate_url: certificateUrl,
      qualification: updatedQualification
    });
    
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
    
  } catch (error) {
    console.error('Error uploading certificate:', error);
    return NextResponse.json(
      { error: 'Failed to upload certificate' },
      { status: 500 }
    );
  }
} 