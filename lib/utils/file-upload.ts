import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Allowed image types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Upload directories
export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
export const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// Ensure upload directories exist
export async function ensureUploadDirectories() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
}

// Validate uploaded file
export function validateFile(file: {
  mimetype: string;
  size: number;
  originalname: string;
}): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return { valid: true };
}

// Generate unique filename
export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const uniqueId = uuidv4().split('-')[0];
  return `${name}_${uniqueId}${ext}`;
}

// Save uploaded file
export async function saveUploadedFile(
  fileBuffer: Buffer,
  filename: string
): Promise<{
  path: string;
  url: string;
  size: number;
  mimetype: string;
  filename: string;
}> {
  const filePath = path.join(UPLOAD_DIR, filename);
  
  await fs.writeFile(filePath, fileBuffer);
  
  const stats = await fs.stat(filePath);
  
  return {
    path: filePath,
    url: `/uploads/${filename}`,
    size: stats.size,
    mimetype: 'image/jpeg', // After processing, all images become JPEG
    filename
  };
}

// Create thumbnail
export async function createThumbnail(
  fileBuffer: Buffer,
  filename: string,
  width: number = 200,
  height: number = 200
): Promise<{
  path: string;
  url: string;
  filename: string;
}> {
  const thumbnailFilename = `thumb_${filename}`;
  const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);
  
  // Resize and compress image for thumbnail
  await sharp(fileBuffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);
  
  return {
    path: thumbnailPath,
    url: `/uploads/thumbnails/${thumbnailFilename}`,
    filename: thumbnailFilename
  };
}

// Process image (resize, compress, convert to JPEG)
export async function processImage(
  fileBuffer: Buffer,
  filename: string,
  maxWidth: number = 800,
  maxHeight: number = 800
): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
}> {
  const image = sharp(fileBuffer);
  const metadata = await image.metadata();
  
  let newWidth = metadata.width || maxWidth;
  let newHeight = metadata.height || maxHeight;
  
  // Resize if image is larger than max dimensions
  if (metadata.width && metadata.width > maxWidth) {
    newWidth = maxWidth;
    newHeight = Math.round((maxWidth / (metadata.width || 1)) * (metadata.height || 1));
  }
  
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = Math.round((maxHeight / (metadata.height || 1)) * (metadata.width || 1));
  }
  
  // Process image
  const processedBuffer = await image
    .resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ 
      quality: 85,
      progressive: true,
      force: true // Convert all images to JPEG for consistency
    })
    .toBuffer();
  
  return {
    buffer: processedBuffer,
    width: newWidth,
    height: newHeight
  };
}

// Delete file
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    if (fileUrl && fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(fileUrl);
      const filePath = path.join(UPLOAD_DIR, filename);
      const thumbnailPath = path.join(THUMBNAIL_DIR, `thumb_${filename}`);
      
      // Delete main image
      await fs.unlink(filePath).catch(() => {});
      
      // Delete thumbnail
      await fs.unlink(thumbnailPath).catch(() => {});
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

// Get file info
export async function getFileInfo(filePath: string) {
  try {
    const stats = await fs.stat(filePath);
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime
    };
  } catch {
    return { exists: false };
  }
}