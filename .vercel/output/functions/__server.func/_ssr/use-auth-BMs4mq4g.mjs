import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DUz3sU8b.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/react+tanstack__react-query.mjs";
// node_modules/.nitro/vite/services/ssr/assets/use-auth-BMs4mq4g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(void 0);
async function fetchRoles(user) {
	if (!user?.id) return [];
	try {
		const { data, error } = await supabase.rpc("get_my_roles");
		if (!error && Array.isArray(data) && data.length > 0) return data.filter(Boolean);
	} catch {}
	let rows = null;
	try {
		rows = (await supabase.from("user_roles").select("role").eq("user_id", user.id)).data ?? null;
	} catch {
		rows = null;
	}
	if (rows && rows.length > 0) return rows.map((r) => r.role);
	try {
		await supabase.from("user_roles").insert({
			user_id: user.id,
			role: "customer"
		});
	} catch {}
	return ["customer"];
}
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [roles, setRoles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const lastRoleUserId = (0, import_react.useRef)(null);
	const loadRolesFor = (0, import_react.useCallback)((u) => {
		if (!u) {
			lastRoleUserId.current = null;
			setRoles([]);
			return;
		}
		if (lastRoleUserId.current === u.id) return;
		lastRoleUserId.current = u.id;
		fetchRoles(u).then((r) => {
			setRoles(r);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		supabase.auth.getSession().then(({ data }) => {
			if (!mounted) return;
			const u = data.session?.user ?? null;
			setUser(u);
			loadRolesFor(u);
		}).catch(() => {}).finally(() => {
			if (mounted) setLoading(false);
		});
		const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
			const u = session?.user ?? null;
			setUser(u);
			loadRolesFor(u);
		});
		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, [loadRolesFor]);
	const refreshRoles = (0, import_react.useCallback)(async () => {
		lastRoleUserId.current = null;
		const r = await fetchRoles(user);
		setRoles(r);
	}, [user]);
	const value = (0, import_react.useMemo)(() => {
		const isSuperAdmin = roles.includes("super_admin");
		const isAdmin = isSuperAdmin || roles.includes("admin");
		return {
			user,
			loading,
			roles,
			isAdmin,
			isSuperAdmin,
			isCustomer: roles.includes("customer"),
			refreshRoles
		};
	}, [
		user,
		loading,
		roles,
		refreshRoles
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) return {
		user: null,
		loading: true,
		roles: [],
		isAdmin: false,
		isSuperAdmin: false,
		isCustomer: false,
		refreshRoles: async () => {}
	};
	return ctx;
}
export { useAuth as n, AuthProvider as t };
