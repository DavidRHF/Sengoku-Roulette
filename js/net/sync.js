/* ============================================================================
 *  sync.js — discovered-endings persistence, with optional cloud sync
 *  --------------------------------------------------------------------------
 *  Source of truth is always localStorage (so the game works with no network).
 *  If SENGOKU_CONFIG.syncUrl is set, we also mirror to the backend keyed by a
 *  per-player "sync code", so the same set follows you across devices. Every
 *  network call is best-effort, time-boxed, and falls back to local silently.
 * ========================================================================== */
window.SYNC = (function () {
  const CFG = window.SENGOKU_CONFIG || {};
  const SEEN_KEY = "sengoku_endings_v1";   // shared with state.js
  const CODE_KEY = "sengoku_synccode";

  function base() { return (CFG.syncUrl || "").replace(/\/+$/, ""); }
  function configured() { return !!base(); }

  function localSeen() {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); } catch (e) { return []; }
  }
  function saveLocal(arr) {
    const u = Array.from(new Set(arr || []));
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(u)); } catch (e) {}
    return u;
  }
  function gen() {
    let s = ""; const h = "0123456789abcdef";
    for (let i = 0; i < 16; i++) s += h[Math.floor(Math.random() * 16)];
    return s;
  }
  function code() {
    let c = null;
    try { c = localStorage.getItem(CODE_KEY); } catch (e) {}
    if (!c) { c = gen(); try { localStorage.setItem(CODE_KEY, c); } catch (e) {} }
    return c;
  }
  function setCode(c) {
    c = (c || "").trim().toLowerCase();
    if (!/^[a-z0-9]{6,40}$/.test(c)) return null;
    try { localStorage.setItem(CODE_KEY, c); } catch (e) {}
    return c;
  }

  function withTimeout(pr, ms) {
    return Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
  }
  async function req(method, path, body) {
    const opt = { method, headers: {} };
    if (body) { opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
    // generous timeout so a Render free-tier cold start (it sleeps when idle) still lands
    const r = await withTimeout(fetch(base() + path, opt), 15000);
    if (!r.ok) throw new Error("http " + r.status);
    return r.json();
  }

  // record one ending: local immediately, backend best-effort
  function markSeen(id) {
    const arr = localSeen();
    if (!arr.includes(id)) saveLocal(arr.concat(id));
    if (configured()) req("POST", "/api/endings/" + code(), { id: id }).catch(() => {});
    return localSeen();
  }
  // push local set up + pull the union back down (merge across devices)
  async function pull() {
    const local = localSeen();
    if (!configured()) return local;
    try {
      const j = await req("POST", "/api/endings/" + code() + "/merge", { ids: local });
      return saveLocal((j && j.endings) || local);
    } catch (e) { return local; }
  }
  // adopt another device's code, then merge both sets together
  async function link(newCode) {
    const c = setCode(newCode);
    if (!c) return { ok: false };
    const merged = await pull();
    return { ok: true, code: c, endings: merged };
  }

  return { configured, code, setCode, gen, localSeen, saveLocal, markSeen, pull, link };
})();
