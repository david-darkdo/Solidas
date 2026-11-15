import { t as createServerRpc } from "./createServerRpc-CPwWKXmf.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
// node_modules/.nitro/vite/services/ssr/assets/upload-server-Bp85QPy8.js
var CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || "dg5hey6bl";
var CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || "318968845579427";
var CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET || "jb5ekn2xWqnKE9Jeqyil_AagHGY";
function formatCloudinaryUrl(url) {
	if (!url || typeof url !== "string") return url;
	if (url.includes("res.cloudinary.com") && url.includes("/image/upload/") && !url.includes("/f_auto")) return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
	return url;
}
async function sha1Hex(input) {
	const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
	return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var uploadProductImageServer_createServerFn_handler = createServerRpc({
	id: "fbfff271fcd17db305f3c28d4d1deba0a94d6381dce6e3ca1be3470745c99f20",
	name: "uploadProductImageServer",
	filename: "src/lib/upload-server.ts"
}, (opts) => uploadProductImageServer.__executeServer(opts));
var uploadProductImageServer = createServerFn({ method: "POST" }).validator((data) => data).handler(uploadProductImageServer_createServerFn_handler, async ({ data }) => {
	const file = data.get("file");
	const productId = data.get("productId");
	if (!(file instanceof File) || file.size === 0) throw new Error("No file provided");
	if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) try {
		const timestamp = Math.floor(Date.now() / 1e3).toString();
		const folder = productId ? `products/${productId}` : "products";
		const signature = await sha1Hex(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`);
		const fd = new FormData();
		fd.append("file", file);
		fd.append("api_key", CLOUDINARY_API_KEY);
		fd.append("timestamp", timestamp);
		fd.append("folder", folder);
		fd.append("signature", signature);
		const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
			method: "POST",
			body: fd
		});
		const json = await res.json();
		if (res.ok && json?.secure_url) return { url: formatCloudinaryUrl(json.secure_url) };
		console.warn("Signed Cloudinary upload warning:", json);
	} catch (cErr) {
		console.warn("Cloudinary signed upload exception:", cErr);
	}
	const arrayBuffer = await file.arrayBuffer();
	const buffer = new Uint8Array(arrayBuffer);
	const ext = (file.name.split(".").pop() || "png").toLowerCase();
	const filename = `${productId ? `products/${productId}/` : ""}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
	const { error: upErr } = await supabase.storage.from("product-images").upload(filename, buffer, {
		contentType: file.type || "image/png",
		upsert: true
	});
	if (upErr) throw new Error(upErr.message);
	const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filename);
	return { url: urlData.publicUrl };
});
var uploadHeroVideoServer_createServerFn_handler = createServerRpc({
	id: "ac53eb6f8605ea9b134753379f7ee5ba69d700199f336962711581bad9eee2f7",
	name: "uploadHeroVideoServer",
	filename: "src/lib/upload-server.ts"
}, (opts) => uploadHeroVideoServer.__executeServer(opts));
var uploadHeroVideoServer = createServerFn({ method: "POST" }).validator((data) => data).handler(uploadHeroVideoServer_createServerFn_handler, async ({ data }) => {
	const file = data.get("file");
	if (!(file instanceof File) || file.size === 0) throw new Error("No video file provided");
	if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) try {
		const timestamp = Math.floor(Date.now() / 1e3).toString();
		const folder = "hero-videos";
		const signature = await sha1Hex(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`);
		const fd = new FormData();
		fd.append("file", file);
		fd.append("api_key", CLOUDINARY_API_KEY);
		fd.append("timestamp", timestamp);
		fd.append("folder", folder);
		fd.append("signature", signature);
		const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`, {
			method: "POST",
			body: fd
		});
		const json = await res.json();
		if (res.ok && json?.secure_url) return { url: json.secure_url };
		console.warn("Signed Cloudinary video upload warning:", json);
	} catch (cErr) {
		console.warn("Cloudinary signed video upload exception:", cErr);
	}
	const arrayBuffer = await file.arrayBuffer();
	const buffer = new Uint8Array(arrayBuffer);
	const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
	const filename = `hero-videos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
	const { error: upErr } = await supabase.storage.from("product-images").upload(filename, buffer, {
		contentType: file.type || "video/mp4",
		upsert: true
	});
	if (upErr) throw new Error(`Video upload failed: ${upErr.message}`);
	const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filename);
	return { url: urlData.publicUrl };
});
var getCloudinarySignatureServer_createServerFn_handler = createServerRpc({
	id: "f96f798d744f7b89e9cf14feb6bc74cda25fafaa994f1dbda9a700c2781e0913",
	name: "getCloudinarySignatureServer",
	filename: "src/lib/upload-server.ts"
}, (opts) => getCloudinarySignatureServer.__executeServer(opts));
var getCloudinarySignatureServer = createServerFn({ method: "POST" }).validator((data) => data).handler(getCloudinarySignatureServer_createServerFn_handler, async ({ data }) => {
	const timestamp = Math.floor(Date.now() / 1e3).toString();
	const folder = data?.folder || "products";
	return {
		cloudName: CLOUDINARY_CLOUD_NAME,
		apiKey: CLOUDINARY_API_KEY,
		timestamp,
		folder,
		signature: await sha1Hex(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
	};
});
export { getCloudinarySignatureServer_createServerFn_handler, uploadHeroVideoServer_createServerFn_handler, uploadProductImageServer_createServerFn_handler };
