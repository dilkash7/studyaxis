const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = 'studyaxis'
): Promise<any> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
      },
      (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    if (typeof file === 'string') {
      upload.end(file);
    } else {
      upload.end(file);
    }
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error: any, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

export function getCloudinaryUrl(publicId: string, options?: any): string {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
}

export function generateCloudinarySignature(timestamp: number): {
  signature: string;
  timestamp: number;
} {
  const crypto = require('crypto');
  const string_to_sign = `timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto
    .createHash('sha1')
    .update(string_to_sign)
    .digest('hex');

  return { signature, timestamp };
}
