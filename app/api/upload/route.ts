import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file' },
        { status: 400 }
      );
    }
    
    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create filename
    const timestamp = Date.now();
    const filename = `product_${timestamp}.jpg`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    // Save file
    await writeFile(filepath, buffer);
    
    // Return URL
    const imageUrl = `/uploads/${filename}`;
    
    return NextResponse.json({
      success: true,
      data: { image_url: imageUrl }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}