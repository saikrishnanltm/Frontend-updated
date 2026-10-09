module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[project]/lib/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// New: the backend now requires a Bearer token on every endpoint except
// /health, /auth/signup, and /auth/login. This context owns that token,
// persists it in localStorage so a refresh doesn't log the user out, and
// exposes login/signup/logout for any client component to use.
//
// Wrap the app with <AuthProvider> in app/layout.tsx, then in a client
// component: const { token, email, login, signup, logout } = useAuth();
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$codesage$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/codesage-client.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const STORAGE_KEY = "codesage_auth";
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider({ children }) {
    const [auth, setAuth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("loading");
    // Restore a previously-saved session on first mount. There's no
    // /auth/me endpoint to validate the token against, so a stale/expired
    // token is only discovered the next time a request 401s (see logout()
    // usage note below) — that's an acceptable tradeoff for a demo app.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                setAuth(parsed);
                setStatus("authed");
            } else {
                setStatus("anon");
            }
        } catch  {
            setStatus("anon");
        }
    }, []);
    const persist = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((result)=>{
        const stored = {
            accessToken: result.accessToken,
            userId: result.userId,
            email: result.email
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        setAuth(stored);
        setStatus("authed");
    }, []);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (email, password)=>{
        persist(await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$codesage$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["login"](email, password));
    }, [
        persist
    ]);
    const signup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (email, password)=>{
        persist(await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$codesage$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signup"](email, password));
    }, [
        persist
    ]);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        localStorage.removeItem(STORAGE_KEY);
        setAuth(null);
        setStatus("anon");
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            token: auth?.accessToken ?? null,
            userId: auth?.userId ?? null,
            email: auth?.email ?? null,
            status,
            login,
            signup,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth-context.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
}),
"[project]/lib/codesage-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "checkHealth",
    ()=>checkHealth,
    "deleteRepo",
    ()=>deleteRepo,
    "getHistory",
    ()=>getHistory,
    "getIngestStatus",
    ()=>getIngestStatus,
    "listRepos",
    ()=>listRepos,
    "login",
    ()=>login,
    "pollIngest",
    ()=>pollIngest,
    "queryRepo",
    ()=>queryRepo,
    "signup",
    ()=>signup,
    "startIngest",
    ()=>startIngest
]);
// Thin wrapper around the CodeSage backend (deployed separately on Railway).
// Set NEXT_PUBLIC_CODESAGE_API_URL in your Vercel project's environment
// variables to your Railway URL, e.g. https://codesage-production.up.railway.app
//
// Updated for the new backend: every endpoint except /health, /auth/signup,
// and /auth/login now requires a Bearer token, ingestion is a background
// job you poll instead of an inline response, and citations come back as
// plain "file:line-line (qualified_name)" strings rather than structured
// objects with a github url.
const BASE_URL = ("TURBOPACK compile-time value", "http://localhost:8000") ?? "http://localhost:8000";
// ---------------------------------------------------------------------------
// Shared fetch helper
// ---------------------------------------------------------------------------
class ApiError extends Error {
    status;
    constructor(message, status){
        super(message);
        this.status = status;
    }
}
async function apiFetch(path, token, init = {}) {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers
    });
    if (!res.ok) {
        // The backend returns {"detail": "..."} on HTTPException; surface that
        // message when present instead of a bare status code.
        let detail = `${res.status}`;
        try {
            const body = await res.json();
            if (body?.detail) detail = body.detail;
        } catch  {
        // response wasn't JSON (or was empty) — fall back to the status code
        }
        throw new ApiError(detail, res.status);
    }
    return res;
}
async function signup(email, password) {
    const res = await apiFetch("/auth/signup", null, {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });
    const data = await res.json();
    return {
        accessToken: data.access_token,
        userId: data.user_id,
        email: data.email
    };
}
async function login(email, password) {
    const res = await apiFetch("/auth/login", null, {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });
    const data = await res.json();
    return {
        accessToken: data.access_token,
        userId: data.user_id,
        email: data.email
    };
}
function mapIngestStatus(data) {
    return {
        jobId: data.job_id,
        status: data.status,
        source: data.source,
        repoName: data.repo_name,
        result: data.result,
        error: data.error,
        createdAt: data.created_at,
        startedAt: data.started_at,
        finishedAt: data.finished_at
    };
}
async function startIngest(token, source, repoName) {
    const res = await apiFetch("/ingest", token, {
        method: "POST",
        body: JSON.stringify({
            source,
            repo_name: repoName ?? null
        })
    });
    const data = await res.json();
    return {
        jobId: data.job_id,
        status: data.status
    };
}
async function getIngestStatus(token, jobId) {
    const res = await apiFetch(`/ingest/status/${jobId}`, token);
    return mapIngestStatus(await res.json());
}
async function pollIngest(token, jobId, opts = {}) {
    const intervalMs = opts.intervalMs ?? 2000;
    const timeoutMs = opts.timeoutMs ?? 5 * 60 * 1000; // ingestion can take minutes
    const startedAt = Date.now();
    while(true){
        const status = await getIngestStatus(token, jobId);
        opts.onUpdate?.(status);
        if (status.status === "done") return status;
        if (status.status === "error") {
            throw new Error(status.error ?? "Ingestion failed");
        }
        if (Date.now() - startedAt > timeoutMs) {
            throw new Error("Timed out waiting for ingestion to finish");
        }
        await new Promise((r)=>setTimeout(r, intervalMs));
    }
}
async function queryRepo(token, question, repoFilter) {
    const res = await apiFetch("/query", token, {
        method: "POST",
        body: JSON.stringify({
            question,
            repo_filter: repoFilter ?? null
        })
    });
    return res.json();
}
async function listRepos(token) {
    const res = await apiFetch("/repos", token);
    const data = await res.json();
    return data.repos.map((r)=>({
            repo: r.repo,
            chunksIndexed: r.chunks_indexed
        }));
}
async function deleteRepo(token, repoName) {
    const res = await apiFetch(`/repos/${encodeURIComponent(repoName)}`, token, {
        method: "DELETE"
    });
    const data = await res.json();
    return {
        repo: data.repo,
        chunksDeleted: data.chunks_deleted
    };
}
async function getHistory(token, limit = 50) {
    const res = await apiFetch(`/history?limit=${limit}`, token);
    const data = await res.json();
    return data.history.map((h)=>({
            id: h.id,
            question: h.question,
            answer: h.answer,
            repoFilter: h.repo_filter,
            citations: h.citations,
            createdAt: h.created_at
        }));
}
async function checkHealth() {
    try {
        const res = await fetch(`${BASE_URL}/health`);
        return res.ok;
    } catch  {
        return false;
    }
}
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ue8jpe._.js.map