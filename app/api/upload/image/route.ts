import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const originalName = file.name;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext)
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    const uniqueId = uuidv4().split('-')[0];
    const filename = `${baseName}_${uniqueId}${ext}`;
    const thumbnailFilename = `thumb_${filename}`;

    // Define upload paths
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const thumbnailDir = path.join(uploadDir, 'thumbnails');
    
    // Ensure directories exist
    await writeFile(path.join(uploadDir, '.keep'), '').catch(() => {});
    await writeFile(path.join(thumbnailDir, '.keep'), '').catch(() => {});

    // Create thumbnail (200x200)
    const thumbnailBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Save original image (resized to max 800px for optimization)
    const processedBuffer = await sharp(buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // Save files
    const filePath = path.join(uploadDir, filename);
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

    await writeFile(filePath, processedBuffer);
    await writeFile(thumbnailPath, thumbnailBuffer);

    // Return file info
    const imageUrl = `/uploads/${filename}`;
    const thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename,
        originalName,
        size: file.size,
        mimetype: file.type,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        dimensions: {
          width: 800,
          height: 800
        }
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}