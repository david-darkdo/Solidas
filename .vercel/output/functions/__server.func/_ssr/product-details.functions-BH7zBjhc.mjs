import { t as createSsrRpc } from "./createSsrRpc-DztbFD3V.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BMBGPb10.mjs";
// node_modules/.nitro/vite/services/ssr/assets/product-details.functions-BH7zBjhc.js
/**
* ENGINE 1: PRODUCT DETAILS ENGINE (REBUILT PRODUCTION PIPELINE)
* 
* Generates structured product intelligence matching 100% of existing database columns.
* Zero unmapped schema references. Zero runtime column errors.
*/
var runProductDetailsEngine = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => {
	if (!data?.productId) throw new Error("productId required");
	return data;
}).handler(createSsrRpc("6b15e25ce512c1d1a591fc613bdae7f9288d09e9ac07eb820ac3c45327de1136"));
export { runProductDetailsEngine };
