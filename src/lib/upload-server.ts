import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { formatCloudinaryUrl } from "./upload-client";

const PUBLIC_CLOUDINARY_CLOUD_NAME = "dg5hey6bl";

async function uploadMediaWithCloudinaryFallback({
  file,
  cloudinaryFolder,
  resourceType,
  fallbackPrefix,
  defaultExtension,
  defaultContentType,
  failurePrefix,
  applyImageFormatting,
}: {
  file: File;
  cloudinaryFolder: string;
  resourceType: "image" | "video";
  fallbackPrefix: string;
  defaultExtension: string;
  defaultContentType: string;
  failurePrefix?: string;
  applyImageFormatting?: boolean;
}): Promise<{ url: string }> {
  const { getServerCloudinaryConfig, createCloudinarySignature } =
    await import("./cloudinary.server");
  const { cloudName, apiKey, apiSecret } = getServerCloudinaryConfig(PUBLIC_CLOUDINARY_CLOUD_NAME);

  // 1. Try Signed Cloudinary Upload
  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = await createCloudinarySignature(
        { folder: cloudinaryFolder, timestamp },
        apiSecret,
      );

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", apiKey);
      fd.append("timestamp", timestamp);
      fd.append("folder", cloudinaryFolder);
      fd.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body: fd },
      );

      const json = (await res.json()) as { secure_url?: string };
      if (res.ok && json?.secure_url) {
        const url = applyImageFormatting ? formatCloudinaryUrl(json.secure_url) : json.secure_url;
        return { url };
      }
      console.warn(`Signed Cloudinary ${resourceType} upload warning:`, json);
    } catch (cErr) {
      console.warn(`Cloudinary signed ${resourceType} upload exception:`, cErr);
    }
  }

  // 2. Fallback to Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const ext = (file.name.split(".").pop() || defaultExtension).toLowerCase();
  const filename = `${fallbackPrefix}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage.from("product-images").upload(filename, buffer, {
    contentType: file.type || defaultContentType,
    upsert: true,
  });

  if (upErr) {
    throw new Error(failurePrefix ? `${failurePrefix}: ${upErr.message}` : upErr.message);
  }

  const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filename);
  return { url: urlData.publicUrl };
}

export const uploadProductImageServer = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const file = data.get("file");
    const productId = data.get("productId") as string | null;

    if (!(file instanceof File) || file.size === 0) {
      throw new Error("No file provided");
    }

    return uploadMediaWithCloudinaryFallback({
      file,
      cloudinaryFolder: productId ? `products/${productId}` : "products",
      resourceType: "image",
      fallbackPrefix: productId ? `products/${productId}/` : "",
      defaultExtension: "png",
      defaultContentType: "image/png",
      applyImageFormatting: true,
    });
  });

export const uploadHeroVideoServer = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const file = data.get("file");

    if (!(file instanceof File) || file.size === 0) {
      throw new Error("No video file provided");
    }

    return uploadMediaWithCloudinaryFallback({
      file,
      cloudinaryFolder: "hero-videos",
      resourceType: "video",
      fallbackPrefix: "hero-videos/",
      defaultExtension: "mp4",
      defaultContentType: "video/mp4",
      failurePrefix: "Video upload failed",
    });
  });

export const getCloudinarySignatureServer = createServerFn({ method: "POST" })
  .validator((data: { folder?: string }) => data)
  .handler(async ({ data }) => {
    const { getServerCloudinaryConfig, createCloudinarySignature } =
      await import("./cloudinary.server");
    const { cloudName, apiKey, apiSecret } = getServerCloudinaryConfig(
      PUBLIC_CLOUDINARY_CLOUD_NAME,
    );

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Missing server Cloudinary environment configuration for signed upload");
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = data?.folder || "products";
    const signature = await createCloudinarySignature({ folder, timestamp }, apiSecret);

    return {
      cloudName,
      apiKey,
      timestamp,
      folder,
      signature,
    };
  });
