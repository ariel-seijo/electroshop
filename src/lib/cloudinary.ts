import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  throw new Error(
    "Cloudinary environment variables are not set. " +
    "Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are defined in .env"
  );
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export { cloudinary };

interface GenerateSignatureResult {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
}

export function generateSignature(params: Record<string, string | number> = {}): GenerateSignatureResult {
  const paramsToSign = { ...params };

  if (!paramsToSign.timestamp) {
    paramsToSign.timestamp = Math.round(Date.now() / 1000);
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    API_SECRET as string
  );

  return {
    timestamp: paramsToSign.timestamp as number,
    signature,
    cloudName: CLOUD_NAME as string,
    apiKey: API_KEY as string,
  };
}

export async function generateBlurDataURL(url: string): Promise<string> {
  const tinyUrl = url.replace(
    /\/image\/upload(\/[^/]*)*\/v/,
    "/image/upload/w_10,q_10,f_webp/v"
  );

  const response = await fetch(tinyUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch blur placeholder for ${tinyUrl}: HTTP ${response.status}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType =
    response.headers.get("content-type") || "image/webp";

  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

export async function deleteAsset(publicId: string): Promise<UploadApiResponse> {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}
