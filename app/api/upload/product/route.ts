import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const productId = formData.get('productId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename with product ID if available
    const originalName = file.name;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext)
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    
    const uniqueId = uuidv4().split('-')[0];
    const filename = productId 
      ? `product_${productId}_${uniqueId}${ext}`
      : `${baseName}_${uniqueId}${ext}`;
    
    const thumbnailFilename = `thumb_${filename}`;

    // Define upload paths
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    const thumbnailDir = path.join(uploadDir, 'thumbnails');
    
    // Ensure directories exist
    await writeFile(path.join(uploadDir, '.keep'), '').catch(() => {});
    await writeFile(path.join(thumbnailDir, '.keep'), '').catch(() => {});

    // Get original dimensions
    const metadata = await sharp(buffer).metadata();

    // Create thumbnail (300x300 for product cards)
    const thumbnailBuffer = await sharp(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Save original image (resized to max 1200px for product detail view)
    const processedBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 90, progressive: true })
      .toBuffer();

    // Save files
    const filePath = path.join(uploadDir, filename);
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

    await writeFile(filePath, processedBuffer);
    await writeFile(thumbnailPath, thumbnailBuffer);

    // Return file info
    const imageUrl = `/uploads/products/${filename}`;
    const thumbnailUrl = `/uploads/products/thumbnails/${thumbnailFilename}`;

    return NextResponse.json({
      success: true,
      message: 'Product image uploaded successfully',
      data: {
        filename,
        originalName,
        size: file.size,
        mimetype: file.type,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        dimensions: {
          original: {
            width: metadata.width,
            height: metadata.height
          },
          processed: {
            width: 1200,
            height: Math.round((1200 / (metadata.width || 1)) * (metadata.height || 1))
          }
        }
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Product image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload product image' },
      { status: 500 }
    );
  }
}