/* ============================================================================
 *  Sengoku no Wa — tiny sync backend
 *  --------------------------------------------------------------------------
 *  Stores, per player "sync code", the set of ending-ids they've discovered,
 *  so the endings gallery can follow them across devices. That's the whole job.
 *
 *  Storage is a single JSON file (data.json) — no database needed. Fine for a
 *  personal/small deploy. For bigger scale, swap readStore/writeStore for a KV
 *  store or use the Cloudflare Worker version (worker.js).
 *
 *  Run locally:   npm install && npm start      (listens on PORT or 8787)
 *  Then in the game's js/config.js set:
 *      window.SENGOKU_CONFIG = { syncUrl: "http://localhost:8787" };
 * ========================================================================== */
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8787;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");
const CODE_RE = /^[a-z0-9]{6,40}$/;
const ID_RE = /^[a-z0-9_]{1,40}$/;
const MAX_IDS = 200; // no player can discover more endings than exist

app.use(cors());                 // allow the static game (any origin) to call us
app.use(express.json({ limit: "16kb" }));

/* ---- store helpers ---- */
function readStore() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch (e) { return {}; }
}
let writeQueued = false, storeCache = readStore();
function writeStore() {
  if (writeQueued) return;
  writeQueued = true;
  setTimeout(() => {
    writeQueued = false;
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(storeCache)); }
    catch (e) { console.error("write failed:", e.message); }
  }, 150);
}
function getSet(code) { return Array.isArray(storeCache[code]) ? storeCache[code] : []; }
function setSet(code, arr) {
  storeCache[code] = Array.from(new Set(arr)).filter(x => ID_RE.test(x)).slice(0, MAX_IDS);
  writeStore();
  return storeCache[code];
}

/* ---- routes ---- */
app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/endings/:code", (req, res) => {
  const code = String(req.params.code || "").toLowerCase();
  if (!CODE_RE.test(code)) return res.status(400).json({ error: "bad code" });
  res.json({ endings: getSet(code) });
});

app.post("/api/endings/:code", (req, res) => {
  const code = String(req.params.code || "").toLowerCase();
  const id = String((req.body && req.body.id) || "");
  if (!CODE_RE.test(code)) return res.status(400).json({ error: "bad code" });
  if (!ID_RE.test(id)) return res.status(400).json({ error: "bad id" });
  const cur = getSet(code);
  if (!cur.includes(id)) res.json({ endings: setSet(code, cur.concat(id)) });
  else res.json({ endings: cur });
});

app.post("/api/endings/:code/merge", (req, res) => {
  const code = String(req.params.code || "").toLowerCase();
  const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids.map(String) : [];
  if (!CODE_RE.test(code)) return res.status(400).json({ error: "bad code" });
  res.json({ endings: setSet(code, getSet(code).concat(ids)) });
});

app.listen(PORT, () => console.log(`Sengoku sync backend on :${PORT}  (data → ${DATA_FILE})`));
