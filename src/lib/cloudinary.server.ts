export interface ServerCloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Reads Cloudinary credentials on the server only.
 * Private credentials (apiKey/apiSecret) intentionally reject VITE_* env vars
 * so they can never accidentally leak into client bundles.
 */
export function getServerCloudinaryConfig(defaultCloudName = ""): ServerCloudinaryConfig {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || defaultCloudName;
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  return { cloudName, apiKey, apiSecret };
}

/**
 * Signs sorted Cloudinary upload/destroy parameters using SHA-1 + API secret.
 */
export async function createCloudinarySignature(
  params: Record<string, string | number>,
  apiSecret: string,
): Promise<string> {
  const crypto = await import("node:crypto");
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}
