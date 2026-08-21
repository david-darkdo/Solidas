import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || "dg5hey6bl";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || "318968845579427";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET || "jb5ekn2xWqnKE9Jeqyil_AagHGY";

export function formatCloudinaryUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/") && !url.includes("/f_auto")) {
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
  }
  return url;
}

async function sha1Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const uploadProductImageServer = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const file = data.get("file");
    const productId = data.get("productId") as string | null;

    if (!(file instanceof File) || file.size === 0) {
      throw new Error("No file provided");
    }

    // 1. Try Signed Cloudinary Upload
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const folder = productId ? `products/${productId}` : "products";
        const sigStr = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
        const signature = await sha1Hex(sigStr);

        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", CLOUDINARY_API_KEY);
        fd.append("timestamp", timestamp);
        fd.append("folder", folder);
        fd.append("signature", signature);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: fd }
        );

        const json: any = await res.json();
        if (res.ok && json?.secure_url) {
          const finalUrl = formatCloudinaryUrl(json.secure_url);
          return { url: finalUrl };
        }
        console.warn("Signed Cloudinary upload warning:", json);
      } catch (cErr) {
        console.warn("Cloudinary signed upload exception:", cErr);
      }
    }

    // 2. Fallback to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const filename = `${productId ? `products/${productId}/` : ""}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(filename, buffer, {
        contentType: file.type || "image/png",
        upsert: true,
      });

    if (upErr) {
      throw new Error(upErr.message);
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filename);

    return { url: urlData.publicUrl };
  });

export const uploadHeroVideoServer = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const file = data.get("file");

    if (!(file instanceof File) || file.size === 0) {
      throw new Error("No video file provided");
    }

    // 1. Try Signed Cloudinary Video Upload
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const folder = "hero-videos";
        const sigStr = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
        const signature = await sha1Hex(sigStr);

        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", CLOUDINARY_API_KEY);
        fd.append("timestamp", timestamp);
        fd.append("folder", folder);
        fd.append("signature", signature);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
          { method: "POST", body: fd }
        );

        const json: any = await res.json();
        if (res.ok && json?.secure_url) {
          return { url: json.secure_url };
        }
        console.warn("Signed Cloudinary video upload warning:", json);
      } catch (cErr) {
        console.warn("Cloudinary signed video upload exception:", cErr);
      }
    }

    // 2. Fallback to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    const filename = `hero-videos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(filename, buffer, {
        contentType: file.type || "video/mp4",
        upsert: true,
      });

    if (upErr) {
      throw new Error(`Video upload failed: ${upErr.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filename);

    return { url: urlData.publicUrl };
  });

export const getCloudinarySignatureServer = createServerFn({ method: "POST" })
  .validator((data: { folder?: string }) => data)
  .handler(async ({ data }) => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = data?.folder || "products";
    const sigStr = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = await sha1Hex(sigStr);

    return {
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
    };
  });

export async function uploadLargeMediaFileClient({
  file,
  folder = "hero-videos",
  resourceType = "auto",
  getSignatureFn,
  onProgress,
}: {
  file: File;
  folder?: string;
  resourceType?: "video" | "image" | "auto";
  getSignatureFn: (opts: { data: { folder?: string } }) => Promise<{
    cloudName: string;
    apiKey: string;
    timestamp: string;
    folder: string;
    signature: string;
  }>;
  onProgress?: (percent: number) => void;
}): Promise<string> {
  // 1. Direct Browser-to-Cloudinary Direct Upload (bypasses Vercel 4.5MB payload limit)
  try {
    const sig = await getSignatureFn({ data: { folder } });
    if (sig.cloudName && sig.apiKey && sig.signature) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", sig.timestamp);
      fd.append("folder", sig.folder);
      fd.append("signature", sig.signature);

      const isVideo = resourceType === "video" || file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
      const typePath = isVideo ? "video" : "image";
      const targetUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${typePath}/upload`;

      const xhr = new XMLHttpRequest();
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.open("POST", targetUrl);

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              onProgress(pct);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.secure_url) {
                resolve(formatCloudinaryUrl(res.secure_url));
                return;
              }
            } catch (e) {}
          }
          reject(new Error(xhr.responseText || `Cloudinary HTTP ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error("Network error during direct Cloudinary upload"));
        xhr.send(fd);
      });

      return await uploadPromise;
    }
  } catch (err) {
    console.warn("Direct Cloudinary upload failed, falling back to direct Supabase Storage...", err);
  }

  // 2. Fallback: Direct Browser-to-Supabase Storage Upload (Bypasses Vercel Serverless Function Limit)
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("product-images")
    .upload(filename, file, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (upErr) {
    throw new Error(`Direct storage upload failed: ${upErr.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(filename);

  return urlData.publicUrl;
}
