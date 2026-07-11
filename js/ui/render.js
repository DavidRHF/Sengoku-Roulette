/* ============================================================================
 *  render.js — everything the player sees around the wheel
 * ========================================================================== */
window.UI = (function () {
  const $ = id => document.getElementById(id);

  /* sound has been removed entirely — these are silent no-ops so the rest of
   * the code can keep calling UI.sfx.* without change. */
  const sfx = { click(){}, spin(){}, good(){}, bad(){}, heal(){}, end(){} };

  /* ---- prompt + action button ----------------------------------------- */
  function setTitle(t) { $("prompt-title").textContent = t; }
  function setSub(t) { $("prompt-sub").textContent = t || ""; }
  function setAction(label, handler, enabled) {
    const b = $("action-btn");
    b.textContent = label;
    b.disabled = enabled === false;
    b.onclick = enabled === false ? null : () => { sfx.click(); handler(); };
  }
  function hideAction() { $("action-btn").style.visibility = "hidden"; }
  function showAction() { $("action-btn").style.visibility = "visible"; }

  /* ---- journal --------------------------------------------------------- */
  function log(text, kind) {
    const S = STATE.get();
    S.log.push({ text, kind: kind || "story" });
    const box = $("journal");
    const p = document.createElement("div");
    p.className = "entry entry-" + (kind || "story");
    p.textContent = text;
    box.appendChild(p);
    box.scrollTop = box.scrollHeight;
  }
  function logNotes(notes) {
    for (const n of notes) {
      if (n.t === "heal") { log(`✦ You recover ${n.v} health.`, "gain"); sfx.heal(); }
      else if (n.t === "hurt") { log(`✦ You take ${-n.v} damage.`, "loss"); sfx.bad(); }
      else if (n.t === "maxhp") { log(`✦ Your vigor deepens (+${n.v} max health).`, "gain"); }
      else if (n.t === "item") { log(`✦ Gained: ${n.v}.`, "gain"); }
      else if (n.t === "consume") { log(`✦ You give up: ${n.v}.`, "loss"); }
      else if (n.t === "comp") { log(`✦ ${n.v} joins your journey.`, "gain"); }
      else if (n.t === "rmcomp") { log(`✦ ${n.v} parts from you.`, "loss"); }
      else if (n.t === "quest") { log(`✦ Your destiny turns — you now walk the road of ${questLabel(n.v)}.`, "quest"); sfx.good(); }
      else if (n.t === "predicament") { const m = { jail:"You are seized and thrown in a cell.", ransom:"You are taken captive for ransom.", conscript:"You are pressed into a warlord's levy." }; log(`✦ ${m[n.v] || "Things take a turn for the worse."}`, "loss"); sfx.bad(); }
    }
  }
  function rebuildJournal() {
    const box = $("journal"); box.innerHTML = "";
    for (const e of STATE.get().log) {
      const p = document.createElement("div");
      p.className = "entry entry-" + (e.kind || "story");
      p.textContent = e.text; box.appendChild(p);
    }
    box.scrollTop = box.scrollHeight;
  }

  /* ---- sidebar / character sheet -------------------------------------- */
  function bar(id, val, max) {
    const pct = Math.max(0, Math.min(100, (val / max) * 100));
    $(id + "-fill").style.width = pct + "%";
    $(id + "-num").textContent = id === "hp" ? `${Math.max(0, val)} / ${max}` : `${val}`;
  }
  function renderSheet() {
    const S = STATE.get();
    $("ch-status").textContent = S.status ? S.status.name : "—";
    $("ch-tool").textContent = S.tool ? S.tool.name : "—";
    $("ch-quest").textContent = S.quest ? questLabel(S.quest) : "—";
    $("ch-loc").textContent = DATA.locations[S.loc] ? DATA.locations[S.loc].name : "—";
    bar("hp", S.hp, S.maxhp);
    bar("str", S.str, 20);
    bar("wis", S.wis, 20);
    bar("cha", S.cha, 20);

    // companions grid
    const cg = $("companions"); cg.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";
      const id = S.companions[i];
      if (id) {
        const c = DATA.companions[id];
        slot.classList.add("filled", "trait-" + c.trait, "art");
        slot.innerHTML = ART.comp(id);
        slot.setAttribute("aria-label", c.name);
        slot.title = c.name;
        slot.onclick = () => { sfx.click(); showCompanion(id); };
      }
      cg.appendChild(slot);
    }
    // inventory grid
    const ig = $("inventory"); ig.innerHTML = "";
    const items = S.inventory;
    const slots = Math.max(8, Math.ceil(items.length / 4) * 4);
    for (let i = 0; i < slots; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";
      const name = items[i];
      if (name) {
        slot.classList.add("filled", "item", "art");
        slot.innerHTML = ART.item(name);
        slot.title = name;
        slot.onclick = () => { sfx.click(); showItem(name); };
      }
      ig.appendChild(slot);
    }
    if (window.SCENE) SCENE.sync(S);
  }

  /* ---- detail popups for a tapped item / companion -------------------- */
  function showItem(name) {
    const info = DATA.itemInfo(name);
    const body =
      `<div class="detail-head"><div class="detail-art">${ART.item(name)}</div>` +
      `<div><h3 class="detail-name">${name}</h3>` +
      `<p class="detail-desc">${info.desc}</p></div></div>` +
      `<hr><p class="detail-benefit"><span class="detail-tag">Benefit</span> ${info.benefit}</p>`;
    modal(name, body);
  }
  function showCompanion(id) {
    const c = DATA.companions[id];
    const traitName = c.trait.charAt(0).toUpperCase() + c.trait.slice(1);
    const bonuses = [];
    for (const k of ["str", "wis", "cha"]) if (c.mods && c.mods[k])
      bonuses.push(`${{ str:"Strength", wis:"Wisdom", cha:"Charisma" }[k]} ${c.mods[k] > 0 ? "+" : ""}${c.mods[k]}`);
    if (c.luck) bonuses.push(`Fortune ${c.luck > 0 ? "+" : ""}${c.luck}`);
    const benefit = bonuses.length ? bonuses.join(" · ") : "Their company alone, and what it brings.";
    const body =
      `<div class="detail-head"><div class="detail-art">${ART.comp(id)}</div>` +
      `<div><h3 class="detail-name">${c.name}</h3>` +
      `<p class="detail-sub">${traitName}</p></div></div>` +
      `<p class="detail-desc">${c.blurb}</p>` +
      `<hr><p class="detail-benefit"><span class="detail-tag">Benefit</span> ${benefit}</p>`;
    modal(c.name, body);
  }
  function initials(name) {
    const clean = name.replace(/[()]/g, "");
    const w = clean.split(" ").filter(Boolean);
    return (w[0][0] + (w[1] ? w[1][0] : "")).toUpperCase();
  }
  function modText(c) {
    const parts = [];
    for (const k of ["str", "wis", "cha"]) if (c.mods[k]) parts.push(`${k.toUpperCase()} ${c.mods[k] > 0 ? "+" : ""}${c.mods[k]}`);
    if (c.luck) parts.push(`luck ${c.luck > 0 ? "+" : ""}${c.luck}`);
    return parts.join(", ") || "no bonus";
  }
  function questLabel(q) {
    const m = { survive: "Survive", escape: "Escape", revenge: "Vengeance",
      pilgrimage: "Pilgrimage", fortune: "Fortune", duty: "Duty", secret: "A Secret",
      contract: "A Contract", alliance: "Alliance", unify: "Unify the Realm",
      omen: "An Omen", enlighten: "Enlightenment", duel: "The Duel" };
    return m[q] || q;
  }

  /* ---- modal (How to Play / ending) ----------------------------------- */
  function modal(titleText, bodyHtml, btnLabel, onClose, cls) {
    $("modal-title").textContent = titleText;
    $("modal-body").innerHTML = bodyHtml;
    const card = document.querySelector("#modal .modal-card");
    if (card) card.className = "modal-card" + (cls ? " " + cls : "");
    const b = $("modal-btn");
    b.textContent = btnLabel || "Close";
    b.onclick = () => { sfx.click(); $("modal").classList.remove("show"); if (onClose) onClose(); };
    $("modal").classList.add("show");
  }

  // a shrouding of black cloud for undiscovered endings
  function cloudSVG() {
    return `<svg viewBox="0 0 120 80" class="ending-cloud" preserveAspectRatio="xMidYMid slice">` +
      `<rect width="120" height="80" fill="#0a0b12"/>` +
      `<g fill="#171826">` +
      `<path d="M-4 62 q10-16 26-10 q6-16 24-12 q14-8 26 6 q18-6 22 12 q10 2 10 18 H-4 Z"/>` +
      `<path d="M-4 34 q12-12 24-4 q10-14 26-6 q16-10 30 4 q14-2 20 12 H-4 Z" opacity="0.85"/>` +
      `</g>` +
      `<g fill="#20223400"><animateTransform attributeName="transform" type="translate" ` +
      `values="0 0;6 0;0 0" dur="7s" repeatCount="indefinite"/></g>` +
      `<text x="60" y="46" text-anchor="middle" font-size="20" fill="#3a3d52" ` +
      `font-family="'Yuji Syuku',serif">？</text></svg>`;
  }

  // build the endings-gallery body (all endings; unseen ones shrouded)
  function endingsGallery() {
    const seen = new Set(STATE.seenEndings());
    const all = DATA.endings.filter(e => e.id !== "epilogue");
    const found = all.filter(e => seen.has(e.id)).length;
    let cards = "";
    for (const e of all) {
      if (seen.has(e.id)) {
        const teaser = (e.text || "").split(/(?<=[.!?])\s/)[0].slice(0, 120);
        cards += `<div class="ending-card ending-tone-${e.tone}">` +
          `<div class="ending-card-title">${e.title}</div>` +
          `<div class="ending-card-tone">${toneWord(e.tone)}</div>` +
          `<div class="ending-card-teaser">${teaser}</div></div>`;
      } else {
        cards += `<div class="ending-card locked">${cloudSVG()}` +
          `<div class="ending-card-title locked-title">? ? ?</div></div>`;
      }
    }
    return `<p class="sm">Endings discovered: <b>${found}</b> of ${all.length}. ` +
      `Undiscovered fates lie shrouded — reach them to reveal them.</p>` +
      `<div class="endings-grid">${cards}</div>` + syncPanel();
  }
  function syncPanel() {
    if (!window.SYNC) return "";
    if (SYNC.configured()) {
      return `<div class="sync-box"><div class="sync-title">☁ Cross-device sync</div>` +
        `<div class="sync-row">Your code: <code id="sync-code">${SYNC.code()}</code>` +
        `<button class="sync-btn" id="sync-copy">Copy</button>` +
        `<button class="sync-btn" id="sync-now">Sync now</button></div>` +
        `<div class="sync-row"><input id="sync-input" class="sync-input" ` +
        `placeholder="paste another device's code to link" autocomplete="off">` +
        `<button class="sync-btn" id="sync-link">Link</button></div>` +
        `<div class="sync-status" id="sync-status"></div></div>`;
    }
    return `<div class="sync-box"><div class="sync-title">☁ Cross-device sync — off</div>` +
      `<div class="sync-note">Discoveries save in this browser only. To sync across devices, ` +
      `deploy the small backend in <code>server/</code> and set its URL in <code>js/config.js</code> ` +
      `(see <code>server/README.md</code>).</div></div>`;
  }
  function toneWord(t) {
    return t === "great" ? "A legendary end" : t === "good" ? "A good end"
      : t === "bad" ? "A grim end" : "An end";
  }

  return {
    setTitle, setSub, setAction, hideAction, showAction,
    log, logNotes, rebuildJournal, renderSheet, modal, sfx, questLabel,
    endingsGallery, cloudSVG,
  };
})();
