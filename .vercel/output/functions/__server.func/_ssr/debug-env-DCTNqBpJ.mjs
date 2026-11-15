import { t as createServerRpc } from "./createServerRpc-CPwWKXmf.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
// node_modules/.nitro/vite/services/ssr/assets/debug-env-DCTNqBpJ.js
var getDatabaseConfig_createServerFn_handler = createServerRpc({
	id: "509ed2d44f18935fb75ec709c1d01f15dfda1246f3904615303814ab4f4d48d5",
	name: "getDatabaseConfig",
	filename: "src/routes/debug-env.tsx"
}, (opts) => getDatabaseConfig.__executeServer(opts));
var getDatabaseConfig = createServerFn({ method: "GET" }).handler(getDatabaseConfig_createServerFn_handler, async () => {
	const rawUrl = process.env.SUPABASE_URL || "not set";
	const rawKey = process.env.SUPABASE_PUBLISHABLE_KEY || "not set";
	const projectRef = process.env.SUPABASE_PROJECT_ID || "not set";
	let dbStatus = "Checking...";
	let dbError = null;
	let tablesList = [];
	try {
		const sanitizedUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
		const supabase = createClient(sanitizedUrl, rawKey);
		const { data, error } = await supabase.from("product_types").select("id, name").limit(1);
		if (error) {
			dbStatus = "Failed to query product_types";
			dbError = error;
		} else dbStatus = "Success! Found product_types table.";
		const { error: productsErr } = await supabase.from("products").select("id").limit(1);
		tablesList.push("product_types: " + (error ? "Error: " + error.message : "Exists"));
		tablesList.push("products: " + (productsErr ? "Error: " + productsErr.message : "Exists"));
	} catch (e) {
		dbStatus = "Exception occurred";
		dbError = {
			message: e.message,
			stack: e.stack
		};
	}
	return {
		SUPABASE_URL: rawUrl,
		SUPABASE_PROJECT_ID: projectRef,
		SUPABASE_PUBLISHABLE_KEY_PREVIEW: rawKey !== "not set" ? rawKey.substring(0, 12) + "..." + rawKey.slice(-8) : "not set",
		dbStatus,
		dbError,
		tablesList
	};
});
export { getDatabaseConfig_createServerFn_handler };
