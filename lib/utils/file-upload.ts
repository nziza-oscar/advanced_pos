import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
export const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

/**
 * Ensures upload directories exist
 */
export async function ensureUploadDirectories() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
}

/**
 * Validates the uploaded file object
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is 5MB`,
    };
  }

  return { valid: true };
}

/**
 * Handles the full upload process: Main image + Thumbnail
 */
export async function uploadProductImage(file: File) {
  await ensureUploadDirectories();

  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueId = uuidv4().split('-')[0];
  const filename = `${Date.now()}_${uniqueId}.jpg`; 

  // 1. Process and Save Main Image
  const mainImage = await sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  await fs.writeFile(path.join(UPLOAD_DIR, filename), mainImage);

  // 2. Process and Save Thumbnail
  await sharp(buffer)
    .resize(200, 200, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 75 })
    .toFile(path.join(THUMBNAIL_DIR, `thumb_${filename}`));

  return {
    url: `/uploads/${filename}`,
    thumbnailUrl: `/uploads/thumbnails/thumb_${filename}`,
    filename,
  };
}

/**
 * Deletes main image and thumbnail
 */
export async function deleteProductImage(fileUrl: string) {
  try {
    if (fileUrl && fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(fileUrl);
      await fs.unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});
      await fs.unlink(path.join(THUMBNAIL_DIR, `thumb_${filename}`)).catch(() => {});
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}