import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded || decoded.id !== params.id || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file to the public directory
    const filename = `${params.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const path = join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(path, buffer);

    // Update the user's profile image in the database
    const imageUrl = `/uploads/${filename}`;
    await db.user.update({
      where: { id: params.id },
      data: { profileImage: imageUrl }
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 