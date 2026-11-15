import { t as createSsrRpc } from "./createSsrRpc-DztbFD3V.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BMBGPb10.mjs";
// node_modules/.nitro/vite/services/ssr/assets/lifestyle-image.functions-oXZg0i7l.js
/**
* Standalone Independent Lifestyle Image Generation Module (BUILD G)
* 
* Generates an installed/lifestyle product image from the original manufacturer product image
* and the Universal Lifestyle Prompt template configured in the AI Control Center.
* 
* Strictly isolated: Does NOT invoke Product Understanding, SEO, Search, Recommendation, or Quality Validation.
* Updates ONLY products.generated_installed_image and inserts a record into product_assets.
*/
var generateStandaloneLifestyleImage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => {
	if (!data?.productId) throw new Error("productId required");
	return data;
}).handler(createSsrRpc("8af549a2ded5098074f4959031ddb6299002be7ec955a7111dc583121be4dc35"));
export { generateStandaloneLifestyleImage };
