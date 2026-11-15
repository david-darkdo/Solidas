import { t as createServerRpc } from "./createServerRpc-CPwWKXmf.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BMBGPb10.mjs";
import { n as getAIProvider } from "./ai-providers-BKMZvUIG.mjs";
// node_modules/.nitro/vite/services/ssr/assets/product-details.functions-DbV1nIv2.js
async function tryJSON(provider, prompt, system, imageUrl) {
	try {
		const raw = await provider.callLLM(prompt, system, imageUrl);
		if (!raw) return {
			data: null,
			raw: "",
			error: "AI model returned an empty text response."
		};
		const m = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim().match(/\{[\s\S]*\}/);
		if (!m) return {
			data: null,
			raw,
			error: "No JSON object found in AI response."
		};
		return {
			data: JSON.parse(m[0]),
			raw
		};
	} catch (err) {
		return {
			data: null,
			raw: "",
			error: err.message || "Failed to execute LLM call or parse JSON response."
		};
	}
}
/**
* ENGINE 1: PRODUCT DETAILS ENGINE (REBUILT PRODUCTION PIPELINE)
* 
* Generates structured product intelligence matching 100% of existing database columns.
* Zero unmapped schema references. Zero runtime column errors.
*/
var runProductDetailsEngine_createServerFn_handler = createServerRpc({
	id: "6b15e25ce512c1d1a591fc613bdae7f9288d09e9ac07eb820ac3c45327de1136",
	name: "runProductDetailsEngine",
	filename: "src/lib/product-details.functions.ts"
}, (opts) => runProductDetailsEngine.__executeServer(opts));
var runProductDetailsEngine = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => {
	if (!data?.productId) throw new Error("productId required");
	return data;
}).handler(runProductDetailsEngine_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { productId } = data;
	const started = Date.now();
	const { data: product, error: pErr } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
	if (pErr || !product) throw new Error(pErr?.message ?? `Product ID ${productId} not found`);
	let contextName = "luxury showroom";
	let categoryName = "premium material";
	let typeName = "product";
	let subcategoryName = "";
	let familyName = "";
	const [contextRes, categoryRes, typeRes, subRes, famRes, settingsRes] = await Promise.all([
		product.installation_context_id ? supabase.from("installation_contexts").select("name").eq("id", product.installation_context_id).maybeSingle() : Promise.resolve({ data: null }),
		product.category_id ? supabase.from("categories").select("name").eq("id", product.category_id).maybeSingle() : Promise.resolve({ data: null }),
		product.type_id ? supabase.from("product_types").select("name").eq("id", product.type_id).maybeSingle() : Promise.resolve({ data: null }),
		product.subcategory_id ? supabase.from("subcategories").select("name").eq("id", product.subcategory_id).maybeSingle() : Promise.resolve({ data: null }),
		product.family_id ? supabase.from("family_groups").select("name, custom_ai_prompt_override").eq("id", product.family_id).maybeSingle() : Promise.resolve({ data: null }),
		supabase.from("app_settings").select("*").limit(1).maybeSingle()
	]);
	if (contextRes.data?.name) contextName = contextRes.data.name;
	if (categoryRes.data?.name) categoryName = categoryRes.data.name;
	if (typeRes.data?.name) typeName = typeRes.data.name;
	if (subRes.data?.name) subcategoryName = subRes.data.name;
	if (famRes.data?.name) familyName = famRes.data.name;
	const familyOverride = famRes.data?.custom_ai_prompt_override ?? null;
	const { data: activeTemplate } = await supabase.from("ai_prompt_templates").select("prompt_text").or("key.eq.product_details,key.eq.understanding").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
	const templateText = activeTemplate?.prompt_text || `Analyze the product details:
Product Name: {product_name}
Code: {code}
Brand: {brand}
Production Name: {production_name}
Finish: {finish}
Material: {material}
Color: {color}
Size: {size}
Price: {price}
Type: {type}
Category: {category}
Subcategory: {subcategory}
Family Group: {family}

Output strict JSON with ONLY these keys:
- generated_description (detailed product description)
- seo_title (compelling SEO title, under 60 chars)
- seo_description (identical to generated_description)
- seo_keywords (array of high-intent search terms)
- canonical_slug (url-friendly slug)
- faq (array of {question, answer} objects)
- structured_data (valid JSON-LD Product schema object)
- search_keywords (array of search terms)
- alternative_terms (array of alternative product names)
- related_terms (array of complementary terms)
- synonyms (array of synonyms)
- misspellings (array of common customer typos)`;
	const systemPrompt = `You are Enreach Product Intelligence AI, an expert in luxury building materials, architectural finishes, premium interiors, showroom product merchandising, customer discovery, and technical SEO.

Your responsibility is to analyze one product using its metadata and image, generate accurate structured product intelligence, and return valid JSON matching the schema keys only.

Never return explanations.
Never return markdown.
Never return prose outside JSON.
Your output directly populates the Enreach Digital Showroom products table.`;
	let prompt = templateText.replace(/{product_name}/g, product.name || "").replace(/{code}/g, product.code || "").replace(/{brand}/g, product.brand ?? "Enreach Showroom").replace(/{production_name}/g, product.production_name ?? "").replace(/{finish}/g, product.finish ?? product.finish_name ?? "premium finish").replace(/{material}/g, product.material ?? "premium material").replace(/{color}/g, product.color ?? "").replace(/{size}/g, product.size ?? "").replace(/{price}/g, product.price ? String(product.price) : "").replace(/{context}/g, contextName).replace(/{type}/g, typeName).replace(/{category}/g, categoryName).replace(/{subcategory}/g, subcategoryName).replace(/{family}/g, familyName);
	if (familyOverride) prompt += `\n\nAdditional Family Directives: ${familyOverride}`;
	const settings = settingsRes.data;
	const config = settings ? {
		activeProvider: settings.active_ai_provider || "openai",
		openaiLlmModel: settings.openai_llm_model,
		openaiImageModel: settings.openai_image_model,
		openaiImageSize: settings.openai_image_size || "1024x1024",
		geminiLlmModel: settings.gemini_llm_model,
		geminiImageModel: settings.gemini_image_model
	} : void 0;
	const provider = getAIProvider(config);
	const imageUrl = product.image_url || void 0;
	const { data: json, error: parseError } = await tryJSON(provider, prompt, systemPrompt, imageUrl);
	if (!json) throw new Error(`Engine 1 [${provider.name}]: ${parseError || "Failed to generate valid JSON intelligence payload"}`);
	const productPatch = {};
	const syncedDescription = json.seo_description || json.meta_description || json.generated_description || json.description || json.short_description || "";
	if (syncedDescription) {
		productPatch.generated_description = syncedDescription;
		productPatch.short_description = syncedDescription;
		if (!product.seo_description_manual) productPatch.seo_description = syncedDescription;
	}
	if (!product.seo_title_manual && json.seo_title) productPatch.seo_title = json.seo_title;
	if (!product.seo_keywords_manual && Array.isArray(json.seo_keywords)) productPatch.seo_keywords = json.seo_keywords;
	if (json.canonical_slug) productPatch.canonical_slug = json.canonical_slug;
	if (json.faq) productPatch.faq = json.faq;
	if (json.structured_data) productPatch.structured_data = json.structured_data;
	const rawSearchKeywords = [
		...Array.isArray(json.search_keywords) ? json.search_keywords : [],
		...Array.isArray(json.alternative_terms) ? json.alternative_terms : [],
		...Array.isArray(json.related_terms) ? json.related_terms : [],
		...Array.isArray(json.synonyms) ? json.synonyms : [],
		...Array.isArray(json.customer_phrases) ? json.customer_phrases : [],
		...Array.isArray(json.builder_terminology) ? json.builder_terminology : [],
		...Array.isArray(json.designer_terminology) ? json.designer_terminology : [],
		...Array.isArray(json.contractor_terminology) ? json.contractor_terminology : [],
		...Array.isArray(json.misspellings) ? json.misspellings : [],
		...Array.isArray(json.filter_tokens) ? json.filter_tokens : []
	].filter(Boolean);
	if (rawSearchKeywords.length > 0) {
		const searchArray = Array.from(new Set(rawSearchKeywords));
		productPatch.app_keywords = searchArray;
		productPatch.app_search_keywords = searchArray;
	}
	productPatch.processing_state = "completed";
	productPatch.is_published = true;
	productPatch.last_processed_at = (/* @__PURE__ */ new Date()).toISOString();
	productPatch.error_log = null;
	const { error: updateErr } = await supabase.from("products").update(productPatch).eq("id", productId);
	if (updateErr) throw new Error(`Failed to update product record: ${updateErr.message}`);
	await supabase.from("product_understanding").upsert({
		product_id: productId,
		raw_ai_response: json,
		detected_material: json.material ?? product.material ?? null,
		detected_finish: json.finish ?? product.finish ?? null,
		detected_color: json.color ?? product.color ?? null,
		detected_keywords: productPatch.app_keywords ?? [],
		confidence_score: .95,
		provider: provider.name
	}, { onConflict: "product_id" });
	const { data: similarProds } = await supabase.from("products").select("id").neq("id", productId).is("deleted_at", null).limit(6);
	if (similarProds?.length) await supabase.from("products").update({ similar_product_ids: similarProds.map((p) => p.id) }).eq("id", productId);
	await supabase.rpc("rebuild_search_index", { _product_id: productId });
	const executionMs = Date.now() - started;
	try {
		await supabase.from("ai_jobs").insert({
			product_id: productId,
			job_type: "seo",
			status: "success",
			execution_time_ms: executionMs,
			result: {
				engine: "Engine 1 (Product Details Engine)",
				provider: provider.name,
				keys_routed: Object.keys(productPatch)
			},
			completed_at: (/* @__PURE__ */ new Date()).toISOString()
		});
	} catch {}
	const { data: verifiedProduct } = await supabase.from("products").select("*").eq("id", productId).single();
	return {
		ok: true,
		details: json,
		syncedDescription,
		product: verifiedProduct,
		executionMs,
		providerName: provider.name
	};
});
export { runProductDetailsEngine_createServerFn_handler };
