import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = import.meta.env.VITE_SUPERBASE_S3_BUCKET as string;
const ENDPOINT = import.meta.env.VITE_SUPERBASE_S3_BUCKET_ENDPOINT as string;

const client = new S3Client({
  region: import.meta.env.VITE_SUPERBASE_S3_REGION as string,
  endpoint: import.meta.env.VITE_SUPERBASE_S3_BUCKET_ENDPOINT as string,
  credentials: {
    accessKeyId: import.meta.env.VITE_SUPERBASE_S3_ACCESS_ID as string,
    secretAccessKey: import.meta.env.VITE_SUPERBASE_S3_SECRET_ACCESS_KEY as string,
  },
  forcePathStyle: true,
});

function buildPublicUrl(key: string): string {
  const baseUrl = ENDPOINT.replace('/storage/v1/s3', '');
  return `${baseUrl}/storage/v1/object/public/${BUCKET}/${key}`;
}

async function uploadImage(pathPrefix: string, entityId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const key = `${pathPrefix}/${entityId}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const body = new Uint8Array(arrayBuffer);

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: file.type,
    })
  );

  return buildPublicUrl(key);
}

/**
 * Upload a plant image to S3 and return its public URL.
 * Key format: plants/{plantId}/{uuid}.{ext}
 */
export async function uploadPlantImage(
  plantId: string,
  file: File
): Promise<string> {
  return uploadImage('plants', plantId, file);
}

/**
 * Upload a library plant image to S3 and return its public URL.
 * Key format: library-plants/{libraryPlantId}/{uuid}.{ext}
 */
export async function uploadLibraryPlantImage(
  libraryPlantId: string,
  file: File
): Promise<string> {
  return uploadImage('library-plants', libraryPlantId, file);
}

/**
 * Delete an image from S3 given the full public URL.
 */
export async function deleteS3Image(imageUrl: string): Promise<void> {
  // Extract the key from the URL
  const marker = `/public/${BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return;
  const key = imageUrl.slice(idx + marker.length);

  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

// Backward-compatible aliases.
export const uploadLivestockImage = uploadPlantImage;
export const deleteLivestockImage = deleteS3Image;
