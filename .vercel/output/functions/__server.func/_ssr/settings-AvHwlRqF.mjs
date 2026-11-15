import { t as supabase } from "./client-DUz3sU8b.mjs";
import { a as useQuery } from "../_libs/react+tanstack__react-query.mjs";
// node_modules/.nitro/vite/services/ssr/assets/settings-AvHwlRqF.js
var DEFAULT_SETTINGS = {
	id: null,
	support_whatsapp: null,
	sales_whatsapp: null,
	company_email: null,
	company_address: null,
	map_url: null,
	facebook_url: null,
	instagram_url: null,
	tiktok_url: null,
	youtube_url: null,
	google_site_verification: null,
	bing_site_verification: null
};
async function fetchAppSettings() {
	try {
		const { data, error } = await supabase.from("app_settings").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle();
		if (error) return DEFAULT_SETTINGS;
		if (data) return data;
		try {
			const { data: inserted } = await supabase.from("app_settings").insert({}).select("*").maybeSingle();
			if (inserted) return inserted;
		} catch {}
		return DEFAULT_SETTINGS;
	} catch {
		return DEFAULT_SETTINGS;
	}
}
var APP_SETTINGS_QUERY_KEY = ["app_settings"];
function useAppSettings() {
	return useQuery({
		queryKey: APP_SETTINGS_QUERY_KEY,
		queryFn: fetchAppSettings,
		staleTime: 0,
		refetchOnWindowFocus: true,
		placeholderData: DEFAULT_SETTINGS
	});
}
function waLink(rawPhone, message) {
	if (!rawPhone) return "#";
	const base = `https://wa.me/${rawPhone.replace(/[^\d]/g, "")}`;
	return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
export { waLink as i, fetchAppSettings as n, useAppSettings as r, APP_SETTINGS_QUERY_KEY as t };
