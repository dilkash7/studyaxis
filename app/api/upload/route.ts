import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Allowed MIME types
const ALLOWED_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
  ],
};

const ALL_ALLOWED = [
  ...ALLOWED_TYPES.image,
  ...ALLOWED_TYPES.video,
  ...ALLOWED_TYPES.document,
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function getResourceType(mimeType: string): string {
  if (ALLOWED_TYPES.image.includes(mimeType)) return 'image';
  if (ALLOWED_TYPES.video.includes(mimeType)) return 'video';
  return 'raw'; // PDFs, docs, zips
}

function getHumanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const user = requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in again.', code: 'AUTH_FAILED' },
        { status: 401 }
      );
    }

    // 2. Parse form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseErr: any) {
      console.error('FormData parse error:', parseErr);
      return NextResponse.json(
        {
          error: 'Failed to parse upload data. File may be too large or request malformed.',
          code: 'PARSE_ERROR',
          details: parseErr.message,
        },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'studyaxis';

    // 3. File presence check
    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'No file provided or file is empty.', code: 'NO_FILE' },
        { status: 400 }
      );
    }

    // 4. File size check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large: ${getHumanFileSize(file.size)}. Maximum allowed: ${getHumanFileSize(MAX_FILE_SIZE)}.`,
          code: 'FILE_TOO_LARGE',
          fileSize: file.size,
          maxSize: MAX_FILE_SIZE,
        },
        { status: 413 }
      );
    }

    // 5. MIME type validation
    const mimeType = file.type;
    if (!ALL_ALLOWED.includes(mimeType)) {
      return NextResponse.json(
        {
          error: `File type "${mimeType}" is not allowed. Accepted: images (JPG, PNG, GIF, WebP), videos (MP4, WebM), documents (PDF, DOC, DOCX, XLS, XLSX, ZIP).`,
          code: 'INVALID_FILE_TYPE',
          receivedType: mimeType,
        },
        { status: 415 }
      );
    }

    // 6. Convert to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${mimeType};base64,${base64}`;

    // 7. Cloudinary config check
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error('Missing Cloudinary config: CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET');
      return NextResponse.json(
        { error: 'Server upload configuration missing. Please contact admin.', code: 'CONFIG_ERROR' },
        { status: 500 }
      );
    }

    // 8. Upload to Cloudinary
    const resourceType = getResourceType(mimeType);

    const formPayload = new FormData();
    formPayload.append('file', dataURI);
    formPayload.append('upload_preset', uploadPreset);
    formPayload.append('folder', folder);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: 'POST', body: formPayload }
    );

    const data = await cloudinaryRes.json();

    if (data.error) {
      console.error('Cloudinary error:', data.error);
      return NextResponse.json(
        {
          error: `Upload service error: ${data.error.message}`,
          code: 'CLOUDINARY_ERROR',
          details: data.error.message,
        },
        { status: 400 }
      );
    }

    // 9. Success response
    return NextResponse.json({
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
      resource_type: data.resource_type,
      format: data.format,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
      original_filename: data.original_filename,
      created_at: data.created_at,
    });
  } catch (err: any) {
    console.error('Upload error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });

    // Check for common Next.js body size errors
    if (err.message?.includes('Body exceeded') || err.message?.includes('body size')) {
      return NextResponse.json(
        {
          error: 'File exceeds server upload limit. Try a smaller file or compress before uploading.',
          code: 'BODY_LIMIT_EXCEEDED',
        },
        { status: 413 }
      );
    }

    return NextResponse.json(
      {
        error: `Upload failed: ${err.message || 'Unknown server error'}`,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// Increase Next.js route segment body size limit
// Route segment config to increase body size limit
export const maxDuration = 60; // 1 minute timeout for large uploads