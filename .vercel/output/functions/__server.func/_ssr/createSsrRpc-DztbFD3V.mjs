import { i as getServerFnById, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
// node_modules/.nitro/vite/services/ssr/assets/createSsrRpc-DztbFD3V.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
export { createSsrRpc as t };
