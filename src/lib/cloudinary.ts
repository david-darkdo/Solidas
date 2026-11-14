import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Utility to extract Cloudinary public ID from its secure URL
export function getPublicIdFromUrl(url: string): string | null {
  // Cloudinary URL format:
  // https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[ext]
  const regex = /\/image\/upload\/(?:v\d+\/)?([^.]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Server action to delete an image from Cloudinary
export const deleteCloudinaryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { url: string }) => {
    if (!data?.url) throw new Error("Cloudinary image URL is required");
    return data;
  })
  .handler(async ({ data }) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("[Cloudinary] Missing environment variables for deletion");
      throw new Error("Missing Cloudinary environment configuration on server");
    }

    const publicId = getPublicIdFromUrl(data.url);
    if (!publicId) {
      throw new Error("Could not extract Cloudinary public ID from URL");
    }

    console.log(`[Cloudinary] Deleting asset ${publicId} from cloud ${cloudName}...`);

    // Dynamically require crypto to avoid shipping client-side
    const crypto = await import("crypto");
    const timestamp = Math.round(Date.now() / 1000);
    const paramString = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramString + apiSecret)
      .digest("hex");

    const formData = new URLSearchParams();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Cloudinary] Delete request failed: ${errText}`);
      throw new Error(`Cloudinary delete failed: ${errText}`);
    }

    const resData = await res.json();
    if (resData.result !== "ok" && resData.result !== "not found") {
      console.error(`[Cloudinary] Delete returned error status:`, resData);
      throw new Error(`Cloudinary destroy returned result: ${resData.result}`);
    }

    console.log(`[Cloudinary] Successfully deleted asset ${publicId}`);
    return { ok: true };
  });
