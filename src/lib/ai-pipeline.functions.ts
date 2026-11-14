import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAIProvider, AIProviderError } from "./ai-providers";

type JobType =
  | "understanding"
  | "seo"
  | "lifestyle"
  | "search"
  | "recommendation"
  | "quality";

async function callLLM(provider: any, prompt: string, system: string): Promise<string> {
  return provider.callLLM(prompt, system);
}

async function tryJSON<T = any>(provider: any, prompt: string, system: string): Promise<T | null> {
  const raw = await callLLM(provider, prompt + "\n\nReturn ONLY compact JSON.", system);
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as T; } catch { return null; }
}

/**
 * Normalizes flat or structured AI understanding output into canonical
 * Product Intelligence Object with 6 sub-contexts: master, seo_context,
 * lifestyle_context, search_context, recommendation_context, validation_context.
 */
function normalizeIntelligenceObject(parsed: any) {
  if (!parsed || typeof parsed !== "object") return {};
  if (parsed.master && parsed.seo_context && parsed.lifestyle_context) {
    return parsed;
  }
  const master = {
    product_type: parsed.product_type ?? parsed.detected_product_type ?? null,
    installation_area: parsed.installation_area ?? parsed.detected_installation_area ?? null,
    indoor_outdoor: parsed.indoor_outdoor ?? parsed.detected_indoor_outdoor ?? null,
    surface_types: parsed.surface_types ?? parsed.detected_surface_types ?? [],
    material: parsed.material ?? parsed.detected_material ?? null,
    finish: parsed.finish ?? parsed.detected_finish ?? null,
    texture: parsed.texture ?? parsed.detected_texture ?? null,
    color: parsed.color ?? parsed.detected_color ?? null,
    pattern: parsed.pattern ?? parsed.detected_pattern ?? null,
    shape: parsed.shape ?? parsed.detected_shape ?? null,
    style: parsed.style ?? parsed.detected_style ?? null,
    luxury_level: parsed.luxury_level ?? parsed.detected_luxury_level ?? null,
    installation_context: parsed.installation_context ?? parsed.detected_installation_context ?? null,
    customer_intent: parsed.customer_intent ?? parsed.detected_customer_intent ?? null,
    architectural_use: parsed.architectural_use ?? parsed.detected_architectural_use ?? null,
    visual_characteristics: parsed.visual_characteristics ?? parsed.detected_visual_characteristics ?? [],
    design_language: parsed.design_language ?? parsed.detected_design_language ?? null,
  };
  return {
    master,
    seo_context: parsed.seo_context ?? {
      copywriting_angle: master.design_language ?? "luxury architectural material",
      target_audience: master.customer_intent ?? "architects, interior designers, contractors",
      core_benefits: master.visual_characteristics ?? [],
      luxury_highlights: [master.luxury_level, master.material, master.finish].filter(Boolean),
    },
    lifestyle_context: parsed.lifestyle_context ?? {
      scene_setting: master.installation_context ?? "luxury showroom interior",
      spatial_context: master.installation_area ?? "wall / floor",
      architectural_environment: master.style ?? "modern luxury villa",
      decor_style: master.design_language ?? "contemporary minimal",
      material: master.material,
      finish: master.finish,
      color: master.color,
      product_type: master.product_type,
    },
    search_context: parsed.search_context ?? {
      search_aliases: parsed.search_keywords ?? master.visual_characteristics ?? [],
      builder_terminology: master.surface_types ?? [],
      designer_terminology: [master.style, master.design_language].filter(Boolean),
      contractor_terminology: [master.installation_area, master.product_type].filter(Boolean),
      common_misspellings: [],
      name_variations: [],
    },
    recommendation_context: parsed.recommendation_context ?? {
      related_product_types: parsed.related_categories ?? [],
      matching_collection_styles: [master.style].filter(Boolean),
      cross_sell_categories: parsed.related_categories ?? [],
      complementary_materials: [master.material].filter(Boolean),
      upsell_triggers: [master.luxury_level].filter(Boolean),
    },
    validation_context: parsed.validation_context ?? {
      expected_material: master.material,
      expected_finish: master.finish,
      expected_color: master.color,
      expected_texture: master.texture,
      expected_geometry: master.shape,
    }
  };
}

/**
 * Dynamically resolves universal prompt templates from database table ai_prompt_templates.
 */
async function resolvePromptTemplate(supabase: any, product: any) {
  const { data: activeTemplates } = await supabase
    .from("ai_prompt_templates")
    .select("key, prompt_text")
    .eq("is_active", true);

  const templatesMap = (activeTemplates || []).reduce((acc: Record<string, string>, t: any) => {
    if (t.key) acc[t.key] = t.prompt_text || "";
    return acc;
  }, {});

  return {
    understanding_prompt: templatesMap.understanding || 'You are a luxury product understanding engine. Analyze the uploaded product image and details.\nProduct Details:\nName: {product_name}\nBrand: {brand}\nFinish: {finish}\nMaterial: {material}\nColor: {color}\nSize: {size}\nAdditional Directives: {family_override}\n\nOutput a strict JSON object containing:\n- master: { product_type, installation_area, indoor_outdoor, surface_types, material, finish, texture, color, pattern, shape, style, luxury_level, installation_context, customer_intent, architectural_use, visual_characteristics, design_language }\n- seo_context: { copywriting_angle, target_audience, core_benefits, luxury_highlights, technical_specifications }\n- lifestyle_context: { scene_setting, lighting_mood, spatial_context, complementary_decor, camera_angle, architectural_environment }\n- search_context: { search_aliases, builder_terminology, designer_terminology, contractor_terminology, common_misspellings, name_variations, material_terminology, regional_variations }\n- recommendation_context: { related_product_types, matching_collection_styles, cross_sell_categories, complementary_materials, upsell_triggers }\n- validation_context: { expected_material, expected_finish, expected_color, expected_texture, expected_geometry, expected_proportions, key_features_to_verify }',
    seo_prompt: templatesMap.seo || 'Consuming the following SEO Context:\n{seo_context}\n\nProduct Details:\nName: {product_name}\nBrand: {brand}\n\nGenerate a strict JSON object containing:\n- generated_description\n- seo_title\n- meta_description\n- seo_keywords (array)\n- canonical_slug\n- og_title\n- og_description\n- twitter_card\n- faq (array of 5 objects containing: { q, a })\n- structured_data (JSON-LD FAQPage metadata schema)',
    lifestyle_prompt: templatesMap.lifestyle || 'You are a prompt engineer for an image generation pipeline. Create a prompt to place the product naturally inside a beautiful, realistic installation scene matching context: {lifestyle_context}. Maintain the original design, material, texture, finish, color, and geometric proportions of the product exactly.',
    search_prompt: templatesMap.search || 'Analyze the Search Context:\n{search_context}\n\nGenerate search terms and variations as JSON: search_aliases (array), builder_terminology (array), designer_terminology (array), contractor_terminology (array), common_misspellings (array), name_variations (array), material_terminology (array), regional_variations (array)',
    recommendation_prompt: templatesMap.recommendation || 'Analyze the Recommendation Context:\n{recommendation_context}\n\nGenerate recommendation parameters as JSON: related_product_types (array), matching_collection_styles (array), cross_sell_categories (array), complementary_materials (array), upsell_triggers (array)',
    quality_prompt: templatesMap.quality || 'Verify if the generated lifestyle image matches the original product image. Validation Context: {validation_context}\nOriginal Product Image: {original_image_url}\nGenerated Lifestyle Image: {generated_image_url}\n\nDetermine if the AI redesigned, replaced, or changed the product. Output JSON: passes_validation (boolean), confidence_score (0-100), product_preserved (boolean), failure_reasons (array)'
  };
}

async function interpolatePrompt(supabase: any, templateText: string, product: any) {
  let contextName = "luxury showroom";
  let categoryName = "premium material";
  let typeName = "product";

  const [contextRes, categoryRes, typeRes, settingsRes] = await Promise.all([
    product.installation_context_id ? supabase.from("installation_contexts").select("name").eq("id", product.installation_context_id).maybeSingle() : Promise.resolve({ data: null }),
    product.category_id ? supabase.from("categories").select("name").eq("id", product.category_id).maybeSingle() : Promise.resolve({ data: null }),
    product.type_id ? supabase.from("product_types").select("name").eq("id", product.type_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("app_settings").select("*").limit(1).maybeSingle()
  ]);

  if (contextRes.data?.name) contextName = contextRes.data.name;
  if (categoryRes.data?.name) categoryName = categoryRes.data.name;
  if (typeRes.data?.name) typeName = typeRes.data.name;

  const settings = settingsRes.data;

  let material = product.material;
  let finish = product.finish ?? product.finish_name;
  let color = product.color;
  let size = product.size;

  if (!material || !finish || !color) {
    const { data: pu } = await supabase.from("product_understanding").select("*").eq("product_id", product.id).maybeSingle();
    if (pu) {
      material = material || pu.detected_material || "";
      finish = finish || pu.detected_finish || "";
      color = color || pu.detected_color || "";
    }
  }

  return templateText
    .replace(/{product_name}/g, product.name || "")
    .replace(/{brand}/g, product.brand ?? "premium")
    .replace(/{finish}/g, finish ?? "premium finish")
    .replace(/{material}/g, material ?? "")
    .replace(/{color}/g, color ?? "")
    .replace(/{size}/g, size ?? "")
    .replace(/{context}/g, contextName)
    .replace(/{category}/g, categoryName)
    .replace(/{type}/g, typeName)
    .replace(/{product_type}/g, typeName)
    .replace(/{company_name}/g, "Enreach Concepts")
    .replace(/{company_email}/g, settings?.company_email ?? "")
    .replace(/{company_address}/g, settings?.company_address ?? "")
    .replace(/{company_phone}/g, settings?.sales_whatsapp ?? settings?.support_whatsapp ?? "");
}

export const runProductPipeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { productId: string }) => {
    if (!data?.productId) throw new Error("productId required");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const productId = data.productId;

    const { data: product, error: pErr } = await supabase
      .from("products").select("*").eq("id", productId).maybeSingle();
    if (pErr || !product) throw new Error(pErr?.message ?? "Product not found");

    const { data: settings } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
    const config = settings ? {
      activeProvider: settings.active_ai_provider || "openai",
      openaiLlmModel: settings.openai_llm_model,
      openaiImageModel: settings.openai_image_model,
      openaiImageSize: settings.openai_image_size || "1024x1024",
      geminiLlmModel: settings.gemini_llm_model,
      geminiImageModel: settings.gemini_image_model
    } : undefined;

    const provider = getAIProvider(config);
    const activeProviderName = provider.name.toLowerCase();

    // Validate active provider environment config
    if (activeProviderName === "openai") {
      if (!process.env.OPENAI_API_KEY) {
        const errMsg = "Configuration Error: OpenAI is the active provider, but OPENAI_API_KEY environment variable is missing.";
        await supabase.from("products").update({
          processing_state: "error",
          error_log: { message: errMsg }
        } as any).eq("id", productId);
        return { ok: false, error: errMsg };
      }
    } else if (activeProviderName === "gemini") {
      if (!(process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY)) {
        const errMsg = "Configuration Error: Gemini is the active provider, but GEMINI_API_KEY environment variable is missing.";
        await supabase.from("products").update({
          processing_state: "error",
          error_log: { message: errMsg }
        } as any).eq("id", productId);
        return { ok: false, error: errMsg };
      }
    }

    await supabase.from("products")
      .update({ processing_state: "processing", error_log: null, last_processed_at: new Date().toISOString() } as any)
      .eq("id", productId);

    const { data: jobs } = await supabase
      .from("ai_jobs" as any).select("*").eq("product_id", productId)
      .order("created_at", { ascending: true });
    const jobList = (jobs ?? []) as any[];

    // BUILD V3: Simplified 2-Engine Execution Runner
    let anyCriticalFail = false;
    try {
      // 1. Run Engine 1: Product Details Engine
      const { runProductDetailsEngine } = await import("./product-details.functions");
      const detailsRes = await runProductDetailsEngine({ data: { productId } });
      if (!detailsRes.ok) {
        anyCriticalFail = true;
      }

      // 2. Run Engine 2: Lifestyle Image Engine (if product has an original image)
      if (!anyCriticalFail && product.image_url) {
        const { generateStandaloneLifestyleImage } = await import("./lifestyle-image.functions");
        await generateStandaloneLifestyleImage({ data: { productId } }).catch((err: any) => {
          console.warn("Lifestyle image generation step non-critical warning:", err);
        });
      }
    } catch (e) {
      anyCriticalFail = true;
    }

    if (anyCriticalFail) {
      const { data: currentP } = await supabase.from("products").select("processing_state").eq("id", productId).single();
      if ((currentP?.processing_state as string) !== "needs_review") {
        await supabase.from("products").update({
          processing_state: "error",
          error_log: { message: "One or more critical AI jobs failed. See ai_jobs.error_log." },
          last_processed_at: new Date().toISOString(),
        } as any).eq("id", productId);
      }
      return { ok: false as const };
    }

    // Check if the product was routed to needs_review
    const { data: fresh } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
    if ((fresh?.processing_state as string) !== "needs_review") {
      await supabase.rpc("rebuild_search_index" as any, { _product_id: productId } as any);
      const { data: freshAfterSearch } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();

      await supabase.from("products").update({
        processing_state: "completed",
        is_published: true, // Auto publish on success
        generation_version: (freshAfterSearch?.generation_version ?? 0) + 1,
        last_processed_at: new Date().toISOString(),
        error_log: null,
      } as any).eq("id", productId);
    }

    return { ok: true as const };
  });

export const testLLMConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { prompt: string; systemPrompt: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let settingsRow: any = null;
    try {
      const { data: settings } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
      settingsRow = settings;
      const config = settings ? {
        activeProvider: settings.active_ai_provider || "openai",
        openaiLlmModel: settings.openai_llm_model,
        openaiImageModel: settings.openai_image_model,
        openaiImageSize: settings.openai_image_size || "1024x1024",
        geminiLlmModel: settings.gemini_llm_model,
        geminiImageModel: settings.gemini_image_model,
        geminiUseVertex: settings.gemini_use_vertex ?? false
      } : undefined;
      const provider = getAIProvider(config);
      const result = await provider.callLLM(data.prompt, data.systemPrompt);

      if (settingsRow?.id) {
        await supabase.from("app_settings").update({
          last_provider_call_success: true,
          last_provider_error: null
        } as any).eq("id", settingsRow.id);
      }

      return { ok: true, text: result };
    } catch (e: any) {
      if (settingsRow?.id) {
        await supabase.from("app_settings").update({
          last_provider_call_success: false,
          last_provider_error: `LLM test failed: ${e.message || String(e)}`
        } as any).eq("id", settingsRow.id);
      }
      return {
        ok: false,
        error: e.message || String(e),
        details: e instanceof AIProviderError || e?.name === "AIProviderError" ? {
          url: e.url,
          requestHeaders: e.requestHeaders,
          requestBody: e.requestBody,
          responseBody: e.responseBody,
          status: e.status
        } : null
      };
    }
  });

export const testImageConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { prompt: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let settingsRow: any = null;
    try {
      const { data: settings } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
      settingsRow = settings;
      const config = settings ? {
        activeProvider: settings.active_ai_provider || "openai",
        openaiLlmModel: settings.openai_llm_model,
        openaiImageModel: settings.openai_image_model,
        openaiImageSize: settings.openai_image_size || "1024x1024",
        geminiLlmModel: settings.gemini_llm_model,
        geminiImageModel: settings.gemini_image_model,
        geminiUseVertex: settings.gemini_use_vertex ?? false
      } : undefined;
      const provider = getAIProvider(config);
      const buf = await provider.generateImage(data.prompt);
      const b64 = buf.toString("base64");

      if (settingsRow?.id) {
        await supabase.from("app_settings").update({
          last_provider_call_success: true,
          last_provider_error: null
        } as any).eq("id", settingsRow.id);
      }

      return { ok: true, b64 };
    } catch (e: any) {
      if (settingsRow?.id) {
        await supabase.from("app_settings").update({
          last_provider_call_success: false,
          last_provider_error: `Image test failed: ${e.message || String(e)}`
        } as any).eq("id", settingsRow.id);
      }
      return {
        ok: false,
        error: e.message || String(e),
        details: e instanceof AIProviderError || e?.name === "AIProviderError" ? {
          url: e.url,
          requestHeaders: e.requestHeaders,
          requestBody: e.requestBody,
          responseBody: e.responseBody,
          status: e.status
        } : null
      };
    }
  });

export const getAIConfigDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: settings } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();

    const activeProvider = settings?.active_ai_provider || "openai";
    const geminiKey = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY || "";
    const openAiKey = process.env.OPENAI_API_KEY || "";
    const anthropicKey = process.env.ANTHROPIC_API_KEY || "";

    const maskKey = (key: string) => {
      if (!key) return "MISSING";
      return `${key.slice(0, 6)}...${key.slice(-4)} (Length: ${key.length})`;
    };

    return {
      activeProvider,
      lastProviderCallSuccess: settings?.last_provider_call_success ?? null,
      lastProviderError: settings?.last_provider_error ?? null,
      openai: {
        apiKeyStatus: maskKey(openAiKey),
        llmModel: settings?.openai_llm_model || "gpt-4o-mini",
        imageModel: settings?.openai_image_model || "dall-e-3",
        imageSize: settings?.openai_image_size || "1024x1024",
      },
      gemini: {
        apiKeyStatus: maskKey(geminiKey),
        llmModel: settings?.gemini_llm_model || "gemini-1.5-flash",
        imageModel: settings?.gemini_image_model || "imagen-3.0-generate-002",
        geminiUseVertex: settings?.gemini_use_vertex ?? false,
        isVertex: settings?.gemini_use_vertex ?? geminiKey.startsWith("AQ"),
        projectId: process.env.GCP_PROJECT_ID || "de-enreach-gemini-api-key",
        region: process.env.GCP_REGION || "us-central1",
      },
      claude: {
        apiKeyStatus: maskKey(anthropicKey),
        llmModel: (settings as any)?.anthropic_llm_model || "claude-3-opus",
      }
    };
  });

export const updateAISettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: current } = await supabase.from("app_settings").select("id").limit(1).maybeSingle();
    if (!current?.id) {
      throw new Error("No settings record found to update");
    }
    const { error } = await supabase.from("app_settings").update({
      active_ai_provider: data.activeProvider,
      openai_llm_model: data.openaiLlmModel,
      openai_image_model: data.openaiImageModel,
      openai_image_size: data.openaiImageSize,
      gemini_llm_model: data.geminiLlmModel,
      gemini_image_model: data.geminiImageModel,
      gemini_use_vertex: data.geminiUseVertex
    } as any).eq("id", current.id);
    if (error) throw error;
    return { ok: true };
  });

export const getDiscoveryHealthDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const { data: allSlugs } = await supabase
      .from("products")
      .select("slug")
      .is("deleted_at", null);
    const slugCounts = new Map<string, number>();
    allSlugs?.forEach((p: any) => {
      if (p.slug) slugCounts.set(p.slug, (slugCounts.get(p.slug) ?? 0) + 1);
    });
    let duplicateSlugsCount = 0;
    slugCounts.forEach((c) => {
      if (c > 1) duplicateSlugsCount++;
    });

    const { count: missingMetaCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .or("seo_title.is.null,seo_description.is.null");

    const { count: missingImagesCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .is("image_url", null);

    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    const { count: totalSearchIndex } = await supabase
      .from("search_index")
      .select("*", { count: "exact", head: true });

    const { count: countTypes } = await supabase.from("product_types").select("*", { count: "exact", head: true });
    const { count: countCats } = await supabase.from("categories").select("*", { count: "exact", head: true });
    const { count: countSubs } = await supabase.from("subcategories").select("*", { count: "exact", head: true });
    const { count: countFams } = await supabase.from("family_groups").select("*", { count: "exact", head: true });

    const { count: totalRedirects } = await supabase.from("redirects").select("*", { count: "exact", head: true });

    return {
      duplicateSlugsCount: duplicateSlugsCount || 0,
      missingMetaCount: missingMetaCount || 0,
      missingImagesCount: missingImagesCount || 0,
      totalProducts: totalProducts || 0,
      totalSearchIndex: totalSearchIndex || 0,
      totalRedirects: totalRedirects || 0,
      taxonomy: {
        types: countTypes || 0,
        categories: countCats || 0,
        subcategories: countSubs || 0,
        families: countFams || 0,
      },
      lastGeneratedTimestamp: new Date().toISOString(),
    };
  });

export const rebuildAllSearchIndexes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: products } = await supabase
      .from("products")
      .select("id")
      .is("deleted_at", null);

    if (products) {
      for (const p of products) {
        await supabase.rpc("rebuild_search_index" as any, { _product_id: p.id } as any);
      }
    }
    return { ok: true, count: products?.length || 0 };
  });

export const runSandboxStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { productId: string; stageKey: string }) => {
    if (!data?.productId) throw new Error("productId required");
    if (!data?.stageKey) throw new Error("stageKey required");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { productId, stageKey } = data;
    const started = Date.now();

    const { data: product, error: pErr } = await supabase
      .from("products").select("*").eq("id", productId).maybeSingle();
    if (pErr || !product) throw new Error(pErr?.message ?? "Product not found");

    const { data: settings } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
    const config = settings ? {
      activeProvider: settings.active_ai_provider || "openai",
      openaiLlmModel: settings.openai_llm_model,
      openaiImageModel: settings.openai_image_model,
      openaiImageSize: settings.openai_image_size || "1024x1024",
      geminiLlmModel: settings.gemini_llm_model,
      geminiImageModel: settings.gemini_image_model,
      geminiUseVertex: settings.gemini_use_vertex ?? false
    } : undefined;

    const provider = getAIProvider(config as any);
    const resolvedTemplates = await resolvePromptTemplate(supabase, product);

    const { data: puData } = await supabase
      .from("product_understanding").select("*").eq("product_id", productId).maybeSingle();

    const templateMap: Record<string, string> = {
      understanding: resolvedTemplates.understanding_prompt,
      seo: resolvedTemplates.seo_prompt,
      lifestyle: resolvedTemplates.lifestyle_prompt,
      search: resolvedTemplates.search_prompt,
      recommendation: resolvedTemplates.recommendation_prompt,
      quality: resolvedTemplates.quality_prompt,
    };

    const rawPrompt = templateMap[stageKey];
    if (!rawPrompt) throw new Error(`Unknown stage key: ${stageKey}`);

    let prompt = await interpolatePrompt(supabase, rawPrompt, product);
    const rawIntel = (product as any).ai_understanding || puData?.raw_ai_response || {};
    const intelObj = normalizeIntelligenceObject(rawIntel);

    if (stageKey === "seo") {
      const seoCtx = intelObj.seo_context || intelObj;
      prompt = prompt
        .replace(/\{seo_context\}/g, JSON.stringify(seoCtx, null, 2))
        .replace(/\{product_intelligence\}/g, JSON.stringify(intelObj, null, 2));
    } else if (stageKey === "search") {
      const searchCtx = intelObj.search_context || intelObj;
      prompt = prompt
        .replace(/\{search_context\}/g, JSON.stringify(searchCtx, null, 2))
        .replace(/\{product_intelligence\}/g, JSON.stringify(intelObj, null, 2));
    } else if (stageKey === "recommendation") {
      const recCtx = intelObj.recommendation_context || intelObj;
      prompt = prompt
        .replace(/\{recommendation_context\}/g, JSON.stringify(recCtx, null, 2))
        .replace(/\{product_intelligence\}/g, JSON.stringify(intelObj, null, 2));
    } else if (stageKey === "lifestyle") {
      const lifeCtx = intelObj.lifestyle_context || intelObj;
      prompt = prompt
        .replace(/\{lifestyle_context\}/g, JSON.stringify(lifeCtx, null, 2))
        .replace(/\{product_intelligence\}/g, JSON.stringify(intelObj, null, 2));
    } else if (stageKey === "quality") {
      const valCtx = intelObj.validation_context || intelObj;
      prompt = prompt
        .replace(/\{validation_context\}/g, JSON.stringify(valCtx, null, 2))
        .replace(/\{product_intelligence\}/g, JSON.stringify(intelObj, null, 2))
        .replace(/\{original_image_url\}/g, product.image_url || "")
        .replace(/\{generated_image_url\}/g, (product as any).generated_installed_image || "");
    }

    const isImageStage = stageKey === "lifestyle";
    let response = "";
    if (!isImageStage) {
      response = await callLLM(
        provider,
        prompt + "\n\nReturn ONLY compact JSON.",
        "You are an AI Operating System engine. Output strict JSON."
      );
    }

    const executionMs = Date.now() - started;

    return {
      ok: true,
      compiledPrompt: prompt,
      aiResponse: response,
      executionMs,
      stageKey,
      providerName: provider.name,
      isImageStage,
      productName: product.name,
      imageUrl: product.image_url ?? null,
    };
  });