import { supabase } from "@/integrations/supabase/client";

export function formatCloudinaryUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  if (
    url.includes("res.cloudinary.com") &&
    url.includes("/image/upload/") &&
    !url.includes("/f_auto")
  ) {
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
  }
  return url;
}

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
  // 1. Direct Browser-to-Cloudinary Upload (bypasses Vercel 4.5MB payload limit)
  try {
    const sig = await getSignatureFn({ data: { folder } });
    if (sig.cloudName && sig.apiKey && sig.signature) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", sig.timestamp);
      fd.append("folder", sig.folder);
      fd.append("signature", sig.signature);

      const isVideo =
        resourceType === "video" ||
        file.type.startsWith("video/") ||
        /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
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
            } catch {
              // Ignore non-JSON responses and proceed to status rejection
            }
          }
          reject(new Error(xhr.responseText || `Cloudinary HTTP ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error("Network error during direct Cloudinary upload"));
        xhr.send(fd);
      });

      return await uploadPromise;
    }
  } catch (err) {
    console.warn(
      "Direct Cloudinary upload failed, falling back to direct Supabase Storage...",
      err,
    );
  }

  // 2. Fallback: Direct Browser-to-Supabase Storage Upload (Bypasses Vercel Serverless Function Limit)
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage.from("product-images").upload(filename, file, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });

  if (upErr) {
    throw new Error(`Direct storage upload failed: ${upErr.message}`);
  }

  const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filename);

  return urlData.publicUrl;
}
