import { t as createSsrRpc } from "./createSsrRpc-DztbFD3V.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BMBGPb10.mjs";
// node_modules/.nitro/vite/services/ssr/assets/ai-pipeline.functions-AhnomFSa.js
/**
* Normalizes flat or structured AI understanding output into canonical
* Product Intelligence Object with 6 sub-contexts: master, seo_context,
* lifestyle_context, search_context, recommendation_context, validation_context.
*/
/**
* Dynamically resolves universal prompt templates from database table ai_prompt_templates.
*/
var runProductPipeline = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => {
	if (!data?.productId) throw new Error("productId required");
	return data;
}).handler(createSsrRpc("664fb641dd9bcce07d8a164c2c6853820cf9cccb64f03d184871c0566a1a58cb"));
var testLLMConnection = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => data).handler(createSsrRpc("7267c015e4be431205bc66996a4ee531e71bc128ecaef2d7eb8327c896af49e0"));
var testImageConnection = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => data).handler(createSsrRpc("276a0fb66f98cf316aa3073acc8f54fe48f7e416b1e3f3a94d405c8d503cca7b"));
var getAIConfigDetails = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("046d0975e9c9df4b75c7ef801e48623db3573545271add4e3bc0d219727ffabf"));
var updateAISettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => data).handler(createSsrRpc("5623b1fcb782401c6ab468bf1c67d0389bf3119652dc216623fb0b912c3cc7fd"));
var getDiscoveryHealthDetails = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("ae3f50e9877f9818797007f60cc79d11efe409cf83ae5bff1178086ee0e5c26e"));
var rebuildAllSearchIndexes = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("9770e432e4e1f0ad8978e96ec07754f4a81e1e2c077a1bfebc5d2eb8caa4563b"));
var runSandboxStage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => {
	if (!data?.productId) throw new Error("productId required");
	if (!data?.stageKey) throw new Error("stageKey required");
	return data;
}).handler(createSsrRpc("085c9c4530fed039fc3c6cfae64421c29295fdf7322f8b20269c28cc809dfed1"));
export { runSandboxStage as a, updateAISettings as c, runProductPipeline as i, getDiscoveryHealthDetails as n, testImageConnection as o, rebuildAllSearchIndexes as r, testLLMConnection as s, getAIConfigDetails as t };
