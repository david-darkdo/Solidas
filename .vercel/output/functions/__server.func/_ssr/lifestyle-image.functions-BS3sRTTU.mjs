import { t as createServerRpc } from "./createServerRpc-CPwWKXmf.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BMBGPb10.mjs";
import { n as getAIProvider } from "./ai-providers-BKMZvUIG.mjs";
// node_modules/.nitro/vite/services/ssr/assets/lifestyle-image.functions-BS3sRTTU.js
/**
* Standalone Independent Lifestyle Image Generation Module (BUILD G)
* 
* Generates an installed/lifestyle product image from the original manufacturer product image
* and the Universal Lifestyle Prompt template configured in the AI Control Center.
* 
* Strictly isolated: Does NOT invoke Product Understanding, SEO, Search, Recommendation, or Quality Validation.
* Updates ONLY products.generated_installed_image and inserts a record into product_assets.
*/
var generateStandaloneLifestyleImage_createServerFn_handler = createServerRpc({
	id: "8af549a2ded5098074f4959031ddb6299002be7ec955a7111dc583121be4dc35",
	name: "generateStandaloneLifestyleImage",
	filename: "src/lib/lifestyle-image.functions.ts"
}, (opts) => generateStandaloneLifestyleImage.__executeServer(opts));
var generateStandaloneLifestyleImage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => {
	if (!data?.productId) throw new Error("productId required");
	return data;
}).handler(generateStandaloneLifestyleImage_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { productId } = data;
	const started = Date.now();
	const { data: product, error: pErr } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
	if (pErr || !product) throw new Error(pErr?.message ?? "Product not found");
	if (!product.image_url || typeof product.image_url !== "string" || product.image_url.trim() === "") throw new Error("Original product image is required before generating an installed image.");
	const { data: template } = await supabase.from("ai_prompt_templates").select("prompt_text, is_active").eq("key", "lifestyle").eq("is_active", true).maybeSingle();
	const rawTemplateText = template?.prompt_text;
	if (!rawTemplateText || rawTemplateText.trim() === "") throw new Error("Lifestyle template is missing. Please configure it in the AI Control Center.");
	let familyOverride = null;
	if (product.family_id) {
		const { data: fg } = await supabase.from("family_groups").select("custom_ai_prompt_override").eq("id", product.family_id).maybeSingle();
		if (fg?.custom_ai_prompt_override) familyOverride = fg.custom_ai_prompt_override;
	}
	let typeName = "product";
	let categoryName = "material";
	let subcategoryName = "";
	let familyName = "";
	const [typeRes, catRes, subRes, famRes] = await Promise.all([
		product.type_id ? supabase.from("product_types").select("name").eq("id", product.type_id).maybeSingle() : Promise.resolve({ data: null }),
		product.category_id ? supabase.from("categories").select("name").eq("id", product.category_id).maybeSingle() : Promise.resolve({ data: null }),
		product.subcategory_id ? supabase.from("subcategories").select("name").eq("id", product.subcategory_id).maybeSingle() : Promise.resolve({ data: null }),
		product.family_id ? supabase.from("family_groups").select("name").eq("id", product.family_id).maybeSingle() : Promise.resolve({ data: null })
	]);
	if (typeRes.data?.name) typeName = typeRes.data.name;
	if (catRes.data?.name) categoryName = catRes.data.name;
	if (subRes.data?.name) subcategoryName = subRes.data.name;
	if (famRes.data?.name) familyName = famRes.data.name;
	let prompt = rawTemplateText.replace(/{product_name}/g, product.name || "").replace(/{brand}/g, product.brand ?? "premium").replace(/{code}/g, product.code ?? "").replace(/{production_name}/g, product.production_name ?? "").replace(/{finish}/g, product.finish ?? product.finish_name ?? "premium finish").replace(/{material}/g, product.material ?? "premium material").replace(/{color}/g, product.color ?? "").replace(/{size}/g, product.size ?? "").replace(/{type}/g, typeName).replace(/{product_type}/g, typeName).replace(/{category}/g, categoryName).replace(/{subcategory}/g, subcategoryName).replace(/{family}/g, familyName);
	if (familyOverride) prompt += `\n\nAdditional Directives: ${familyOverride}`;
	const { data: settings } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
	const config = settings ? {
		activeProvider: settings.active_ai_provider || "openai",
		openaiLlmModel: settings.openai_llm_model,
		openaiImageModel: settings.openai_image_model,
		openaiImageSize: settings.openai_image_size || "1024x1024",
		geminiLlmModel: settings.gemini_llm_model,
		geminiImageModel: settings.gemini_image_model,
		geminiUseVertex: settings.gemini_use_vertex ?? false
	} : void 0;
	const provider = getAIProvider(config);
	let origBuffer;
	try {
		const imgRes = await fetch(product.image_url);
		if (imgRes.ok) {
			const arrBuf = await imgRes.arrayBuffer();
			origBuffer = Buffer.from(arrBuf);
		}
	} catch (fetchErr) {
		console.warn("Could not fetch raw original image buffer, proceeding with prompt generation:", fetchErr);
	}
	let installedBuf;
	try {
		if (typeof provider.generateLifestyleImage === "function") installedBuf = await provider.generateLifestyleImage(prompt, origBuffer);
		else installedBuf = await provider.generateImage(prompt);
	} catch (genErr) {
		try {
			await supabase.from("ai_jobs").insert({
				product_id: productId,
				job_type: "lifestyle",
				status: "failed",
				execution_time_ms: Date.now() - started,
				error_log: {
					message: genErr.message || String(genErr),
					provider: provider.name,
					prompt
				}
			});
		} catch {}
		throw new Error(`Lifestyle image generation failed: ${genErr.message || String(genErr)}`);
	}
	const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
	const apiKey = process.env.CLOUDINARY_API_KEY;
	const apiSecret = process.env.CLOUDINARY_API_SECRET;
	if (!cloudName || !apiKey || !apiSecret) throw new Error("Missing Cloudinary environment configuration on server.");
	const crypto = await import("crypto");
	const timestamp = Math.round(Date.now() / 1e3);
	const folder = `products/${productId}`;
	const paramString = `folder=${folder}&timestamp=${timestamp}`;
	const signature = crypto.createHash("sha1").update(paramString + apiSecret).digest("hex");
	const formData = new URLSearchParams();
	formData.append("file", `data:image/png;base64,${installedBuf.toString("base64")}`);
	formData.append("api_key", apiKey);
	formData.append("timestamp", String(timestamp));
	formData.append("folder", folder);
	formData.append("signature", signature);
	const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
		method: "POST",
		body: formData
	});
	if (!uploadRes.ok) {
		const text = await uploadRes.text();
		throw new Error(`Cloudinary server-side upload failed: ${text}`);
	}
	const installedUrl = (await uploadRes.json()).secure_url;
	const { supabaseAdmin } = await import("./client.server-CHz7Xcta.mjs");
	const nextVersion = (product.generation_version ?? 0) + 1;
	await supabaseAdmin.from("product_assets").update({ is_primary: false }).eq("product_id", productId).eq("generated_by_ai", true);
	await supabaseAdmin.from("product_assets").insert([{
		product_id: productId,
		asset_type: "installed",
		asset_url: installedUrl,
		generated_by_ai: true,
		is_primary: false,
		generation_version: nextVersion,
		metadata: {
			provider: provider.name,
			prompt,
			standalone_module: true
		}
	}]);
	await supabase.from("products").update({
		generated_installed_image: installedUrl,
		generation_version: nextVersion,
		last_processed_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", productId);
	const executionMs = Date.now() - started;
	try {
		await supabase.from("ai_jobs").insert({
			product_id: productId,
			job_type: "lifestyle",
			status: "success",
			execution_time_ms: executionMs,
			result: {
				installed_image_url: installedUrl,
				provider: provider.name,
				standalone_module: true
			},
			completed_at: (/* @__PURE__ */ new Date()).toISOString()
		});
	} catch {}
	return {
		ok: true,
		imageUrl: installedUrl,
		executionMs,
		providerName: provider.name
	};
});
export { generateStandaloneLifestyleImage_createServerFn_handler };
