# Sengoku no Wa — sync backend

A tiny service that remembers, per player "sync code", which endings they've
discovered — so the in-game **Endings** gallery can follow you across devices.
The game works perfectly without it (endings just save per-browser); this only
adds cross-device sync.

It stores nothing personal: just a random code you choose and a list of ending
ids (like `satori`, `death_wild`). No accounts, no email, no tracking.

---

## API

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET  | `/api/endings/:code` | — | `{ endings: [...] }` |
| POST | `/api/endings/:code` | `{ id }` | `{ endings: [...] }` |
| POST | `/api/endings/:code/merge` | `{ ids: [...] }` | `{ endings: [...] }` (union) |
| GET  | `/health` | — | `{ ok: true }` |

`code` is 6–40 lowercase letters/digits; ids are validated and capped.

---

## Option A — Node/Express (server.js)

Run locally:

```bash
cd server
npm install
npm start          # listens on http://localhost:8787
```

Then in the game's `js/config.js`:

```js
window.SENGOKU_CONFIG = { syncUrl: "http://localhost:8787" };
```

**Deploy free (always-on, https):** push this `server/` folder to a host like
**Render**, **Railway**, or **Fly.io**:

- Render: New → Web Service → point at the repo, root dir `server`,
  build `npm install`, start `npm start`. It gives you an `https://…onrender.com`
  URL — put that in `js/config.js`.
- Data persists in `data.json`. On hosts with ephemeral disks, attach a small
  persistent volume (or use the Cloudflare Worker version below, which uses KV).

## Option B — Cloudflare Worker (worker.js) — free, serverless, https

```bash
cd server
npx wrangler kv:namespace create ENDINGS      # copy the printed id
# put that id in wrangler.toml (see the header comment in worker.js)
npx wrangler deploy
```

Set `js/config.js` `syncUrl` to the `https://…workers.dev` URL it prints.

---

## Important: https + GitHub Pages

If you host the **game** on GitHub Pages (https), the backend URL must also be
**https**, or browsers block it as mixed content. Render/Railway/Fly/Cloudflare
all give you https automatically. For purely local play (`file://` or
`localhost`), plain `http://localhost` is fine.

## How linking works in-game

Open **Endings → Cross-device sync**. Each browser has a random code; copy it,
and on another device paste it into **Link** — both devices then share (and
merge) the same discovered-endings set. "Sync now" re-pulls the latest.
