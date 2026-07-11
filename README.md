# 戦国の輪 — Wheel of the Warring States

A **spin-by-spin survival game** set in the warring‑states (Sengoku) era of feudal Japan — samurai, ninja, monks, merchants and warlords. You don't *choose* who you are or what happens next; the **wheel decides**, and your fate is quietly bent by who you were born as, what you carry, who walks beside you, and how the kami feel about you today.

Design inspiration (dark theme, a fortune wheel, a character/party panel and an item grid) is taken from spin‑wheel browser games — rebuilt from scratch with an original ancient‑Japan identity: a sumi‑ink ground, a seigaiha wave pattern, a gold *ensō* ring, and a torii‑red pointer.

> Pure **HTML / CSS / vanilla JavaScript** — no build step, no dependencies. It runs by double‑clicking `index.html` **and** on GitHub Pages.

---

## Play it

- **Locally:** open `index.html` in any modern browser.
- **GitHub Pages:** push this repo, then *Settings → Pages → Deploy from branch → `main` / root*. Your game will be live at `https://<you>.github.io/<repo>/`.

Your journey **autosaves** to the browser (localStorage). Save/Load buttons are provided; saving is fully supported when hosted, and best‑effort on the `file://` scheme.

---

## How the game works

### 1. The wheel decides your birth
Before any story, you spin twice:

1. **Station** — your class: one of **20** (Hinin outcast, Rice Farmer, Ronin, Sōhei warrior‑monk, Shrine Maiden, Shinobi, Samurai, Court Noble, Daimyō …).
2. **Tool / Weapon** — one of **15** (bare hands, a rusted hoe, a bamboo staff, a Naginata, a Fine Katana, the legendary Masamune …).

Together these set your four gauges:

| Gauge | Range | What it does |
|------|------|------|
| **Health** | 15–50 | Hit points. Encounters that harm you subtract from this; reaching 0 ends your road. |
| **Strength** | 0–20 | Bends spins about force, combat and survival. |
| **Wisdom** | 0–20 | Bends spins about cunning, lore and perception. |
| **Charisma** | 0–20 | Bends spins about deception and persuasion. |

**Rarity is inverted on purpose:** the worst stations/tools are the *easiest* to roll and the best are painfully rare. Positive stations/tools also lend a "luck" bias that nudges every later spin in your favor; cursed ones drag it down.

### 2. The road unfolds
The loop is **two encounters, then a night's rest, then repeat** — exactly as a traveler's day. What you meet depends on **where you are**: two great cities (Edo, Kyoto), the Tōkaidō highway, farms, forests, mountain passes, rivers, the coast, and sacred shrine grounds. The game moves you across the land as you go.

Roads **intertwine.** Every station belongs to shared *circles* (`low`, `warrior`, `religious`, `criminal`, `noble`, `merchant`…). A peasant and a drunkard both walk the "low" circle, so they can hit the same beats — while a Daimyō will never stumble into a beggar's storyline. History is respected: no lord falls in love with a scullery maid.

### 3. Stats + companions sway the wheel
When a spin is a *check* (Strength / Wisdom / Charisma), the wheel **looks fair** but the winning wedge is chosen by weighted odds: a high matching stat makes good outcomes far likelier, a low one makes bad outcomes likelier. **Companions** stack on top — a Veteran Retainer lifts Strength spins, a Cheerful Drunkard drags Charisma (and luck) down. You gain and lose companions through the journey; some stations start with one.

### 4. Many endings
Deaths (silenced by an assassin, lost on the mountain, bled out on the road), quest victories (unify the realm, fulfil a vendetta, complete a pilgrimage, reach *satori*, make a fortune, discharge your duty, seal a peace, keep a contract, start a new life), a rare **Legend of the Age**, and survival epilogues. Some fire quickly and cruelly; some take the whole long road.

---

## Project structure

```
sengoku-wheel/
├── index.html            # page shell, SVG defs, script load order
├── css/
│   └── styles.css        # full aesthetic (ink ground, seigaiha, gold wheel)
└── js/
    ├── data/             # ← all content lives here (plain data, easy to expand)
    │   ├── core.js       #   30 statuses · 25 tools · companions · locations
    │   ├── story.js      #   beginning story paths (circle‑tagged)
    │   ├── encounters.js #   road events (some multi‑spin branches)
    │   ├── rests.js      #   night events per location type
    │   └── endings.js    #   ending conditions + priorities
    ├── engine/
    │   ├── rng.js        #   weighted picks + stat‑swayed spin resolution
    │   ├── state.js      #   stats, effects, filters, endings, save/load
    │   └── game.js       #   phase flow: creation → journey loop → ending
    └── ui/
        ├── wheel.js      #   SVG wheel render + spin animation
        └── render.js     #   sidebar, stat bars, journal, modal, audio
```

Everything is attached to plain globals (`DATA`, `RNG`, `STATE`, `WHEEL`, `UI`, `GAME`) and loaded via ordinary `<script>` tags, which is why it works from `file://` with **zero tooling**.

---

## Content, and how to expand it

The engine is **data‑driven**: because content is shared across *circles* and *locations* and filtered per playthrough, the variety you actually experience is large, and each station is guaranteed **≥10 eligible openings** in code. The starter content set ships with:

- **30** statuses, **25** tools, **13** companions, **10** locations
- **40+** beginning story paths, **30+** encounters (several branching), **20+** rest events, **18** endings

To add more, just append to the arrays — no engine changes needed.

**Add an encounter** (`js/data/encounters.js`):
```js
{ id:"river_spirit", title:"The River Spirit", loc:["river","coast"], circles:["any"], weight:6,
  scene:{ text:"A pale figure rises from the mist over the ford…",
    spin:{ prompt:"Face the spirit.", stat:"wis", options:[
      { label:"Bow and pray", weight:9, valence:"good", text:"It bows back and blesses your crossing.", hp:4, flag:"blessed_river" },
      { label:"Flee",         weight:7, valence:"bad",  text:"You slip in the shallows and are dragged downstream.", hp:-8 },
    ] } } }
```
- `loc` matches a **location id** (`edo`) or **type** (`city/road/rural/wild/coast/sacred`) or `"any"`.
- `circles` gates by station circle (or `"any"`).
- Effect keys on any option/scene: `hp` `maxhp` `item` `consume` `comp` `rmComp` `flag` `rmFlag` `quest` `loc` `goto` `ending`.
- A `goto` points at a key in the encounter's `sub:{}` map — that's how a cave‑in becomes several spins yet counts as **one** encounter.

**Item‑swayed odds.** An option can react to what you carry:
- `needItem:"Travel papers"` — the option only appears on the wheel if you hold that item (e.g. a monk's sealed papers open a safe path through the barrier‑gate).
- `boostItem:"Sutra scroll"` (+ optional `boostAmt`) — carrying the item **fattens that slice**, raising the odds of that outcome.
- `dampItem:"…"` (+ `dampAmt`) — shrinks a slice.
- `consume:"Smoke bombs"` — spends one of that item when the option resolves.
Statuses begin with signature gear via `startItems:[…]` in `core.js`, so *who you are* changes *what you can do*.

**The wheel shows the true odds.** Wedge sizes are drawn **proportional to each option's real weight** (stat + companions + luck + carried items), so a fat slice genuinely is more likely. The slices are **ordered smallest‑chance to largest** clockwise from the pointer, so you can read the odds at a glance, and labels always render upright whatever the wheel's resting angle.

**Illustrated gear, tap for detail.** Every item and companion has its own bundled SVG picture (original CC0 art in `js/data/art.js` — no external images, so it works offline and on Pages with zero network). Tap any item or companion tile in the sidebar to open a card with its description and its concrete **benefit** (what it does mechanically, or the stat/luck bonus a companion brings). Item text and effects live in `js/data/items.js` (`DATA.itemInfo`), keyed by name with sensible category fallbacks so anything picked up on the road still gets a proper card.

**The journey scene.** A composed woodblock-style print fills a large gold-lacquer panel at the left (`js/ui/scene.js`), and it paints a picture for **every spin**, not just camps:
- **A motif for each encounter.** Bandits are drawn mid-fight, a shrine gets its torii and stone lanterns, an onryō looms pale over the road, a market has its stalls, a river its ford-stones, a lord's court its curtains and banner, plus duels, beasts, gambling mats, barrier-gates, festivals, dark bargains, the fallen, omens — and the three predicaments (jail bars, a bound ransom captive, a press-gang of spears). Marquee encounters get **bespoke** scenes — the rain-dark courtyard of *The Reckoning*, a Portuguese carrack for the *Nanban* trade, a grand *war council* under banners, a tea-room truce, a sumo bout, a cavalry charge, a plague-gate, a grounded junk on the tide-flats, a blind minstrel before soldiers. The motif is `enc.art` if set, otherwise inferred from the text by a keyword classifier, so all 58 encounters show something fitting (35 distinct motifs in all).
- **Backdrops vary** by biome (city pagodas, paddy fields, forest pines, mountain Fuji, the sea coast, shrine torii, open road), by **time of day** (dawn · day · dusk · night with a moon and stars), and by **weather** (clear · rain · snow).
- **Camps** (rests and creation) show fire, tent, pines and a drying-rack hung with your items, companions gathered by the fire, and the traveller holding **their actual tool**. If you bear rank or a crest, a **clan banner** flies and a mon marks the tent.
- **Injury is cumulative.** The lowest health you've ever reached leaves scars that never fade — a bandage, then a wound, then a hunched limp — visible on the traveller in every scene.
- **It moves.** The campfire flickers and its glow pulses, and rain and snow actually fall — lightweight inline SVG animation, still fully offline.

It repaints from true game state (`SCENE.sync`), all vector and offline in one flat palette. (Sound has been removed entirely.)

**Destiny can turn.** Some encounters (and a few campfire dreams) carry a `quest:"revenge"`‑style key that **rewrites your purpose** mid‑journey — a glimpsed old enemy, a lord's war‑fan, a false arrest, a shrine's summons. Gates like `requiresQuest`, `requiresItem`, `requiresStatus`, `forbidFlag`, `once` and `minStep` let these land as turning‑points and chain into follow‑ons (e.g. *A Face from the Ash* → *The Reckoning*), each routing to its own ending. And an encounter never repeats **twice in a row** — a rest has to fall between.

**Failure has teeth — predicaments.** When a roll goes truly wrong, a bad option can set `predicament:"jail"` (also `"ransom"`, `"conscript"`). The engine drops you into a self‑contained sequence in `js/data/predicaments.js` — the magistrate's cage, a bandit ransom camp, a warlord's press‑gang — each with **its own wheel** and its own ways out: bribe the jailer (spends your `Coin purse`), flash a `Seal of office`, slip the lock, plead before the magistrate, or serve your time and be turned loose the poorer. Predicament options use the ordinary effect keys plus `escape:true` (back to the road, with an optional `freeText`) and `goto` (jump to another scene here); every predicament is guaranteed to resolve — unresolved days loop up to `maxDays`, then a `forced` release fires. Wiring a new trigger is one key on any bad option:
```js
{ label:"Force the door", weight:7, valence:"bad",
  text:"Wood splinters loud in the night. The watch drags you down.", hp:-6, predicament:"jail" }
```

**Add a status/tool** → `js/data/core.js` (remember: higher `rarity` = more common). **Add an ending** → `js/data/endings.js` with a `check(S)` and a `priority`.

---

## A note on history

The game leans on real Sengoku texture — the four‑caste order and its outcasts, *giri* (duty), sanctioned *katakiuchi* vendettas, warrior‑monk temple armies, Shinto purification and *omikuji* fortunes, the great highway barrier‑gates, Edo's dreaded fires ("the flowers of Edo"), and the first *nanban* foreign ships bringing matchlock guns. It's a game, not a textbook — but the encounters try to stay inside the world they invoke.

---

## License

MIT — see [LICENSE](LICENSE). Do what you like; a credit is appreciated but not required.
