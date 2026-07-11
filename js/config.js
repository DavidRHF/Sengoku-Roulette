/* ============================================================================
 *  config.js — optional cross-device sync
 *  --------------------------------------------------------------------------
 *  Leave syncUrl as "" and the game is 100% offline: discovered endings save
 *  in this browser's localStorage only (works on file:// and GitHub Pages).
 *
 *  To sync your discovered endings across devices, deploy the tiny backend in
 *  the  server/  folder (see server/README.md — one click on Render/Railway/
 *  Cloudflare) and paste its base URL here, e.g.
 *
 *      window.SENGOKU_CONFIG = { syncUrl: "https://my-sengoku.onrender.com" };
 *
 *  Note: if you host the game on GitHub Pages (https), the backend URL must
 *  also be https, or the browser will block it as mixed content.
 * ========================================================================== */
window.SENGOKU_CONFIG = { syncUrl: "" };
