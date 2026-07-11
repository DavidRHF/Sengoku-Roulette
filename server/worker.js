/* ============================================================================
 *  Cloudflare Worker version of the sync backend (free, always-on, https).
 *  --------------------------------------------------------------------------
 *  Needs a KV namespace bound as ENDINGS. Same API as server.js.
 *
 *  wrangler.toml:
 *      name = "sengoku-sync"
 *      main = "worker.js"
 *      compatibility_date = "2024-01-01"
 *      kv_namespaces = [{ binding = "ENDINGS", id = "<your-kv-id>" }]
 *
 *  Deploy:  npx wrangler kv:namespace create ENDINGS   (copy the id above)
 *           npx wrangler deploy
 *  Then set js/config.js syncUrl to the worker URL it prints.
 * ========================================================================== */
const CODE_RE = /^[a-z0-9]{6,40}$/;
const ID_RE = /^[a-z0-9_]{1,40}$/;
const MAX_IDS = 200;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...CORS } });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean); // ["api","endings",code, ("merge")?]

    if (url.pathname === "/" )
      return json({ ok: true, service: "sengoku-sync",
        endpoints: ["/health", "/api/endings/:code", "/api/endings/:code/merge"] });
    if (url.pathname === "/health") return json({ ok: true });
    if (parts[0] !== "api" || parts[1] !== "endings") return json({ error: "not found" }, 404);

    const code = String(parts[2] || "").toLowerCase();
    if (!CODE_RE.test(code)) return json({ error: "bad code" }, 400);

    const key = "e:" + code;
    const get = async () => JSON.parse((await env.ENDINGS.get(key)) || "[]");
    const put = async (arr) => {
      const u = Array.from(new Set(arr)).filter((x) => ID_RE.test(x)).slice(0, MAX_IDS);
      await env.ENDINGS.put(key, JSON.stringify(u));
      return u;
    };

    if (request.method === "GET") return json({ endings: await get() });

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      if (parts[3] === "merge") {
        const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
        return json({ endings: await put((await get()).concat(ids)) });
      }
      const id = String(body.id || "");
      if (!ID_RE.test(id)) return json({ error: "bad id" }, 400);
      const cur = await get();
      return json({ endings: cur.includes(id) ? cur : await put(cur.concat(id)) });
    }
    return json({ error: "method" }, 405);
  },
};
