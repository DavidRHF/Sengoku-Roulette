/* ============================================================================
 *  art.js — original, offline, license-free (CC0) SVG artwork
 *  --------------------------------------------------------------------------
 *  Every item and companion gets a little illustrated tile. These are hand-cut
 *  vector "pictures" bundled straight into the repo — no external images, no
 *  network, no attribution needed, and they render identically on file:// and
 *  GitHub Pages. ART.item(name) resolves a name to its category art; the
 *  category itself comes from DATA.itemCat() in items.js.
 * ========================================================================== */
window.ART = (function () {
  const P = {
    gold:"#d9a441", gold2:"#e7c065", crim:"#b83227", jade:"#3f7d4e", teal:"#2b6e78",
    paper:"#f2ead8", paper2:"#d9cca8", plum:"#6c4f7a", steel:"#9aa3b2", ink:"#14151f",
    wood:"#8a5a2b", wood2:"#6b451f", bone:"#e8e0c8", blade:"#c8ccd6", skin:"#e6c9a8",
  };
  function tile(bg, body) {
    return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="tile-svg" `+
      `preserveAspectRatio="xMidYMid meet"><rect x="1" y="1" width="46" height="46" rx="9" `+
      `fill="${bg}"/><g stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
  }

  /* ---------------------------- ITEM ART -------------------------------- */
  const ITEM = {
    coin: () => tile("#241c0f",
      `<circle cx="18" cy="28" r="9" fill="${P.gold}" stroke="#7a5216" stroke-width="1.5"/>`+
      `<rect x="15" y="25" width="6" height="6" fill="#241c0f"/>`+
      `<circle cx="30" cy="20" r="9" fill="${P.gold2}" stroke="#7a5216" stroke-width="1.5"/>`+
      `<rect x="27" y="17" width="6" height="6" fill="#241c0f"/>`),
    cargo: () => tile("#1d2420",
      `<rect x="9" y="24" width="14" height="14" fill="${P.wood}" stroke="${P.wood2}" stroke-width="1.5"/>`+
      `<rect x="25" y="24" width="14" height="14" fill="${P.wood}" stroke="${P.wood2}" stroke-width="1.5"/>`+
      `<rect x="17" y="10" width="14" height="14" fill="${P.wood2}" stroke="#4a2f14" stroke-width="1.5"/>`+
      `<path d="M17 17h14M24 10v14" stroke="#4a2f14" stroke-width="1.3"/>`),
    gifts: () => tile("#2a1420",
      `<rect x="10" y="20" width="18" height="16" rx="2" fill="${P.crim}"/>`+
      `<rect x="24" y="16" width="15" height="14" rx="2" fill="${P.jade}"/>`+
      `<path d="M19 20v16M10 27h18" stroke="${P.gold}" stroke-width="2"/>`+
      `<path d="M31 16v14M24 22h15" stroke="${P.paper}" stroke-width="1.6"/>`),
    scroll: () => tile("#1b2f34",
      `<rect x="12" y="9" width="24" height="5" rx="2.5" fill="${P.wood}"/>`+
      `<rect x="12" y="33" width="24" height="5" rx="2.5" fill="${P.wood}"/>`+
      `<rect x="14" y="13" width="20" height="21" fill="${P.paper}"/>`+
      `<path d="M18 19h12M18 23h12M18 27h9" stroke="#8a7a55" stroke-width="1.5"/>`),
    papers: () => tile("#20232e",
      `<rect x="14" y="9" width="19" height="28" rx="2" fill="${P.paper}"/>`+
      `<path d="M18 15h11M18 19h11M18 23h11M18 27h7" stroke="#9a8a63" stroke-width="1.4"/>`+
      `<circle cx="29" cy="31" r="4.5" fill="${P.crim}"/>`+
      `<path d="M27 31l1.5 1.5L31 29.5" stroke="${P.paper}" stroke-width="1.2" fill="none"/>`),
    ledger: () => tile("#221a2a",
      `<rect x="12" y="11" width="24" height="26" rx="2" fill="${P.plum}" stroke="#4a3556" stroke-width="1.5"/>`+
      `<rect x="12" y="11" width="6" height="26" fill="#4a3556"/>`+
      `<path d="M22 17h10M22 22h10M22 27h10M22 32h7" stroke="${P.paper}" stroke-width="1.3"/>`),
    card: () => tile("#1b2f34",
      `<rect x="13" y="14" width="22" height="20" rx="2" fill="${P.paper}"/>`+
      `<path d="M18 20q4 6 8 0t8 0" stroke="${P.crim}" stroke-width="1.6" fill="none"/>`+
      `<circle cx="19" cy="28" r="1.6" fill="${P.gold}"/>`),
    seal: () => tile("#2a1414",
      `<rect x="19" y="9" width="10" height="9" rx="2" fill="${P.wood}"/>`+
      `<rect x="15" y="18" width="18" height="18" rx="3" fill="${P.crim}"/>`+
      `<path d="M20 23h8M20 27h8M20 31h8" stroke="${P.paper}" stroke-width="1.6"/>`),
    crest: () => tile("#241c0f",
      `<circle cx="24" cy="24" r="13" fill="none" stroke="${P.gold}" stroke-width="2.4"/>`+
      `<path d="M24 15c4 3 4 7 0 9c-4-2-4-6 0-9z" fill="${P.gold}"/>`+
      `<path d="M17 27c3-1 6 1 7 4c-3 1-6-1-7-4zM31 27c-3-1-6 1-7 4c3 1 6-1 7-4z" fill="${P.gold}"/>`),
    blade: () => tile("#1a1c24",
      `<path d="M12 34L33 13l3 3L15 37z" fill="${P.blade}" stroke="#6a7280" stroke-width="1"/>`+
      `<rect x="30" y="12" width="8" height="4" rx="1" transform="rotate(45 34 14)" fill="${P.gold}"/>`+
      `<rect x="33" y="9" width="3" height="7" rx="1.5" transform="rotate(45 34 12)" fill="${P.wood}"/>`),
    spear: () => tile("#1a1c24",
      `<rect x="22" y="12" width="4" height="26" rx="2" transform="rotate(-20 24 24)" fill="${P.wood}"/>`+
      `<path d="M31 9l4 8-4 2-3-6z" fill="${P.blade}" stroke="#6a7280" stroke-width="1"/>`),
    knife: () => tile("#1a1c24",
      `<path d="M16 32L30 18l3 3L19 35z" fill="${P.blade}" stroke="#6a7280" stroke-width="1"/>`+
      `<rect x="28" y="16" width="7" height="3.4" rx="1" transform="rotate(45 31 18)" fill="${P.wood}"/>`),
    gun: () => tile("#1c1a16",
      `<rect x="10" y="21" width="24" height="4" rx="1.5" fill="#3a3a42"/>`+
      `<path d="M30 25l8 6-2 3-9-6z" fill="${P.wood}"/>`+
      `<rect x="14" y="25" width="4" height="7" rx="1" fill="${P.wood2}"/>`),
    food: () => tile("#20240f",
      `<path d="M15 20q9-8 18 0l2 16q-11 4-22 0z" fill="${P.paper2}" stroke="#b3a473" stroke-width="1.4"/>`+
      `<path d="M18 20q6-4 12 0" stroke="${P.wood}" stroke-width="2" fill="none"/>`+
      `<path d="M20 15l4 4 4-4" stroke="${P.paper2}" stroke-width="2" fill="none"/>`),
    bowl: () => tile("#1b2a2e",
      `<path d="M12 24h24l-3 10q-9 4-18 0z" fill="${P.paper2}" stroke="#b3a473" stroke-width="1.4"/>`+
      `<path d="M18 20c0-3 12-3 12 0" stroke="${P.paper}" stroke-width="1.6" fill="none" opacity=".8"/>`+
      `<path d="M22 15c-1 2 1 3 0 5M27 15c-1 2 1 3 0 5" stroke="${P.bone}" stroke-width="1.4" fill="none"/>`),
    herbs: () => tile("#16261a",
      `<path d="M24 37V17" stroke="${P.jade}" stroke-width="2"/>`+
      `<path d="M24 22c-6-2-9-6-9-6c5-1 8 2 9 6zM24 27c6-2 9-6 9-6c-5-1-8 2-9 6zM24 32c-5-1-8-4-8-4c4-1 7 1 8 4z" fill="${P.jade}"/>`),
    provisions: () => tile("#241c0f",
      `<rect x="12" y="18" width="24" height="18" rx="3" fill="${P.paper2}" stroke="#b3a473" stroke-width="1.4"/>`+
      `<path d="M18 18l6-8 6 8M20 12l4 6 4-6" stroke="${P.wood}" stroke-width="2" fill="none"/>`+
      `<path d="M12 26h24" stroke="#b3a473" stroke-width="1.3"/>`),
    gourd: () => tile("#20240f",
      `<path d="M24 9c2 0 3 1 3 3s-1 2-1 4 4 3 4 9a6 6 0 0 1-12 0c0-6 4-7 4-9s-1-2-1-4 1-3 3-3z" fill="${P.wood}" stroke="${P.wood2}" stroke-width="1.4"/>`+
      `<rect x="21" y="8" width="6" height="3" rx="1.5" fill="#4a2f14"/>`+
      `<path d="M18 26h12" stroke="${P.wood2}" stroke-width="1.4"/>`),
    charm: () => tile("#2a1414",
      `<rect x="15" y="14" width="18" height="24" rx="4" fill="${P.crim}" stroke="${P.gold}" stroke-width="1.6"/>`+
      `<path d="M20 14v-2a4 4 0 0 1 8 0v2" fill="none" stroke="${P.gold}" stroke-width="1.6"/>`+
      `<path d="M24 20v10M20 25h8" stroke="${P.gold}" stroke-width="1.8"/>`),
    wand: () => tile("#1b2f34",
      `<rect x="22" y="20" width="4" height="18" rx="2" fill="${P.wood}"/>`+
      `<path d="M24 8l5 4-5 3-5-3z" fill="${P.paper}"/>`+
      `<path d="M16 14h16l-3 6H19z" fill="${P.paper}" stroke="#c9b98a" stroke-width="1"/>`+
      `<path d="M20 14v6M24 14v6M28 14v6" stroke="#c9b98a" stroke-width="1"/>`),
    stone: () => tile("#20232e",
      `<rect x="12" y="19" width="24" height="11" rx="3" fill="${P.steel}" stroke="#5a6472" stroke-width="1.4"/>`+
      `<path d="M15 24h18" stroke="#c3ccd8" stroke-width="1.4"/>`+
      `<path d="M20 30l-2 5M28 30l2 5" stroke="#5a6472" stroke-width="1.4"/>`),
    hook: () => tile("#1c1a16",
      `<path d="M24 10v16" stroke="${P.steel}" stroke-width="2.4"/>`+
      `<path d="M24 26c-6 0-6-8-6-8M24 26c6 0 6-8 6-8M24 26c0 4 0 4 0 4" fill="none" stroke="${P.steel}" stroke-width="2.4"/>`+
      `<path d="M24 30v6" stroke="${P.wood}" stroke-width="2.2" stroke-dasharray="2 2"/>`),
    smoke: () => tile("#20232e",
      `<circle cx="21" cy="30" r="7" fill="#2b2b33" stroke="#12121a" stroke-width="1.4"/>`+
      `<path d="M27 25l4-4" stroke="${P.gold}" stroke-width="1.6"/>`+
      `<path d="M31 20q2-3 4 0t4 0" fill="none" stroke="${P.steel}" stroke-width="1.8" opacity=".7"/>`+
      `<circle cx="34" cy="16" r="2.4" fill="${P.steel}" opacity=".5"/>`),
    vial: () => tile("#161f2a",
      `<rect x="21" y="9" width="6" height="4" rx="1" fill="${P.wood}"/>`+
      `<path d="M20 13h8v6l3 14a5 5 0 0 1-14 0l3-14z" fill="#2f6e4a" stroke="#1c4a2f" stroke-width="1.4"/>`+
      `<path d="M18 26h12" stroke="#7fc99a" stroke-width="1.4" opacity=".7"/>`),
    fan: () => tile("#221a2a",
      `<path d="M24 34L12 16a16 16 0 0 1 24 0z" fill="${P.paper}" stroke="${P.plum}" stroke-width="1.4"/>`+
      `<path d="M24 34l0-20M24 34l-7-14M24 34l7-14" stroke="${P.plum}" stroke-width="1.2"/>`+
      `<circle cx="24" cy="34" r="2.2" fill="${P.gold}"/>`),
    warfan: () => tile("#241c0f",
      `<rect x="21" y="24" width="4" height="14" rx="2" transform="rotate(8 23 31)" fill="${P.wood}"/>`+
      `<rect x="13" y="9" width="20" height="16" rx="3" fill="${P.ink}" stroke="${P.gold}" stroke-width="2"/>`+
      `<circle cx="23" cy="17" r="4.5" fill="${P.gold}"/>`),
    mask: () => tile("#1a1c24",
      `<path d="M13 20q11-6 22 0v6q-11 5-22 0z" fill="#2b2b33" stroke="#12121a" stroke-width="1.4"/>`+
      `<rect x="17" y="21" width="5" height="3" rx="1.5" fill="${P.gold}"/>`+
      `<rect x="26" y="21" width="5" height="3" rx="1.5" fill="${P.gold}"/>`),
    bundle: () => tile("#241c0f",
      `<path d="M16 20q8-5 16 0l3 17q-11 4-22 0z" fill="${P.wood}" stroke="${P.wood2}" stroke-width="1.4"/>`+
      `<path d="M18 18l6-9 6 9" stroke="${P.crim}" stroke-width="2" fill="none"/>`+
      `<path d="M14 27h20" stroke="${P.wood2}" stroke-width="1.4"/>`),
    conch: () => tile("#1b2f34",
      `<path d="M30 14q8 2 8 12t-12 12q-12 0-14-10q-1-8 8-9q-6 5 0 9q5 3 9-2q3-5-1-9q-3-3-6-3z" fill="${P.bone}" stroke="#b3a473" stroke-width="1.2"/>`+
      `<path d="M14 30l-4 6" stroke="${P.gold}" stroke-width="1.6"/>`),
    apron: () => tile("#2a1420",
      `<path d="M14 12h20l-2 20a10 10 0 0 1-16 0z" fill="${P.crim}" stroke="${P.gold}" stroke-width="1.4"/>`+
      `<path d="M18 20h12M17 26h14" stroke="${P.gold}" stroke-width="1.4"/>`+
      `<path d="M14 12l-4 8M34 12l4 8" stroke="${P.wood2}" stroke-width="1.6"/>`),
    medicine: () => tile("#16261a",
      `<rect x="12" y="16" width="24" height="20" rx="2" fill="${P.wood}" stroke="${P.wood2}" stroke-width="1.4"/>`+
      `<rect x="12" y="22" width="24" height="1.6" fill="${P.wood2}"/><rect x="12" y="28" width="24" height="1.6" fill="${P.wood2}"/>`+
      `<path d="M24 12v6M21 15h6" stroke="${P.jade}" stroke-width="2.4"/>`),
    whisk: () => tile("#20240f",
      `<path d="M18 34h12l-2-10h-8z" fill="${P.bone}"/>`+
      `<g stroke="${P.paper2}" stroke-width="1">`+
      `<line x1="20" y1="24" x2="19" y2="12"/><line x1="22" y1="24" x2="22" y2="11"/><line x1="24" y1="24" x2="24" y2="10"/><line x1="26" y1="24" x2="26" y2="11"/><line x1="28" y1="24" x2="29" y2="12"/></g>`),
    lute: () => tile("#241c0f",
      `<path d="M18 34a7 8 0 0 0 12-6c0-5-3-7-3-11l1-6-3 2-1 5c-4 1-6 4-6 8z" fill="${P.wood}" stroke="${P.wood2}" stroke-width="1.2"/>`+
      `<g stroke="${P.paper}" stroke-width="0.7">`+
      `<line x1="24" y1="14" x2="22" y2="30"/><line x1="26" y1="15" x2="25" y2="30"/></g>`),
    crop: () => tile("#1c1a16",
      `<line x1="14" y1="34" x2="30" y2="12" stroke="${P.wood}" stroke-width="2.4" stroke-linecap="round"/>`+
      `<path d="M30 12l5 -2-2 5z" fill="${P.wood2}"/>`+
      `<circle cx="14" cy="34" r="2.4" fill="${P.wood2}"/>`),
    garb: () => tile("#161820",
      `<path d="M16 14l8 3 8-3 2 6-4 3 1 13H17l1-13-4-3z" fill="#2b2b33" stroke="#12121a" stroke-width="1.2"/>`+
      `<rect x="20" y="18" width="8" height="2.6" rx="1.3" fill="${P.gold}"/>`),
    finery: () => tile("#221a2a",
      `<path d="M16 12l8 4 8-4 3 5-5 4 2 15H18l2-15-5-4z" fill="${P.plum}" stroke="${P.gold}" stroke-width="1.2"/>`+
      `<path d="M24 16v20" stroke="${P.gold}" stroke-width="1"/>`+
      `<circle cx="24" cy="30" r="1.6" fill="${P.gold}"/>`),
  };
  function itemSVG(cat) { return (ITEM[cat] || ITEM.bundle)(); }
  function item(name) {
    const cat = (window.DATA && DATA.itemCat) ? DATA.itemCat(name) : "bundle";
    return itemSVG(cat);
  }

  /* -------------------------- COMPANION ART ----------------------------- */
  function head(bg, faceExtra) {
    return `<circle cx="24" cy="21" r="8" fill="${P.skin}"/>${faceExtra||""}`;
  }
  const COMP = {
    ashigaru: () => tile("#1d2420",
      `<path d="M14 17q10-8 20 0z" fill="${P.wood}" stroke="${P.wood2}" stroke-width="1.4"/>`+
      head("")+
      `<path d="M16 40q8-10 16 0z" fill="${P.jade}"/>`+
      `<rect x="34" y="8" width="2.6" height="30" rx="1" fill="${P.wood}"/>`+
      `<path d="M35 6l3 6-3 2-2-5z" fill="${P.blade}"/>`),
    retainer: () => tile("#221a2a",
      `<path d="M15 21q9-13 18 0q-9 3-18 0z" fill="#2b2f3a" stroke="#12121a" stroke-width="1.4"/>`+
      `<path d="M20 10q4-5 8 0" fill="none" stroke="${P.gold}" stroke-width="2.4"/>`+
      head("")+
      `<path d="M16 40q8-9 16 0z" fill="${P.crim}"/>`),
    ronin_frnd: () => tile("#1a1c24",
      head("")+
      `<path d="M16 40q8-9 16 0z" fill="#5a5f6b"/>`+
      `<path d="M33 11L20 24" stroke="${P.blade}" stroke-width="2.6"/>`+
      `<rect x="30" y="10" width="6" height="2.6" rx="1" transform="rotate(45 33 11)" fill="${P.gold}"/>`),
    monk_frnd: () => tile("#241c0f",
      `<circle cx="24" cy="21" r="8" fill="${P.skin}"/>`+
      `<path d="M16 40q8-9 16 0z" fill="${P.wood}"/>`+
      `<circle cx="16" cy="30" r="1.6" fill="${P.gold}"/><circle cx="20" cy="33" r="1.6" fill="${P.gold}"/>`+
      `<circle cx="24" cy="34" r="1.6" fill="${P.gold}"/><circle cx="28" cy="33" r="1.6" fill="${P.gold}"/>`+
      `<circle cx="32" cy="30" r="1.6" fill="${P.gold}"/>`),
    miko_frnd: () => tile("#2a1414",
      `<path d="M16 16q8-6 16 0l-2 4H18z" fill="${P.ink}"/>`+
      head("")+
      `<path d="M14 40q10-11 20 0z" fill="${P.crim}"/>`+
      `<path d="M15 27h6l-3 6z" fill="${P.paper}"/>`),
    scholar: () => tile("#1b2f34",
      head("")+
      `<path d="M16 40q8-9 16 0z" fill="${P.teal}"/>`+
      `<rect x="12" y="30" width="16" height="10" rx="1.5" fill="${P.paper}" stroke="#8a7a55" stroke-width="1"/>`+
      `<path d="M20 30v10" stroke="#8a7a55" stroke-width="1"/>`+
      `<path d="M30 26l6 6" stroke="${P.wood}" stroke-width="2"/>`),
    merchant_c: () => tile("#241c0f",
      head("")+
      `<path d="M16 40q8-9 16 0z" fill="${P.plum}"/>`+
      `<circle cx="17" cy="33" r="4" fill="${P.gold}" stroke="#7a5216" stroke-width="1"/>`+
      `<rect x="15.5" y="31.5" width="3" height="3" fill="#241c0f"/>`),
    courtesan: () => tile("#2a1420",
      `<path d="M15 18q9-9 18 0q-3 4-9 4t-9-4z" fill="${P.ink}"/>`+
      `<rect x="30" y="12" width="2" height="8" rx="1" fill="${P.gold}"/><circle cx="31" cy="11" r="2" fill="${P.crim}"/>`+
      head("")+
      `<path d="M15 40q9-11 18 0z" fill="${P.crim}"/>`+
      `<path d="M30 34l6-8v8z" fill="${P.paper}" opacity=".9"/>`),
    shinobi_c: () => tile("#161820",
      `<circle cx="24" cy="21" r="8" fill="#2b2b33"/>`+
      `<rect x="17" y="19" width="14" height="3.4" rx="1.5" fill="${P.skin}"/>`+
      `<circle cx="21" cy="20.7" r="1" fill="${P.ink}"/><circle cx="27" cy="20.7" r="1" fill="${P.ink}"/>`+
      `<path d="M16 40q8-9 16 0z" fill="#2b2b33"/>`),
    child: () => tile("#20240f",
      `<circle cx="24" cy="20" r="7" fill="${P.skin}"/>`+
      `<path d="M22 12q2-3 4 0" stroke="${P.ink}" stroke-width="2" fill="none"/>`+
      `<circle cx="21.5" cy="20" r="1" fill="${P.ink}"/><circle cx="26.5" cy="20" r="1" fill="${P.ink}"/>`+
      `<path d="M18 40q6-8 12 0z" fill="${P.jade}"/>`),
    drunkard_c: () => tile("#241c0f",
      head(`<circle cx="20" cy="23" r="1.6" fill="${P.crim}" opacity=".55"/><circle cx="28" cy="23" r="1.6" fill="${P.crim}" opacity=".55"/>`)+
      `<path d="M16 40q8-9 16 0z" fill="${P.wood}"/>`+
      `<path d="M30 28c1.5 0 2 1 2 2s-1 1.4-1 2.6 2.4 1.6 2.4 4.4a3.4 3.4 0 0 1-6.8 0c0-2.8 2.4-3.2 2.4-4.4s-1-.8-1-2.6 .5-2 2-2z" fill="${P.wood2}"/>`),
    wardog: () => tile("#20232e",
      `<path d="M12 34q2-12 12-12t12 12q-6 4-12 4t-12-4z" fill="${P.wood}"/>`+
      `<path d="M13 22l3-6 3 5zM35 22l-3-6-3 5z" fill="${P.wood}"/>`+
      `<circle cx="19" cy="28" r="1.4" fill="${P.ink}"/><circle cx="29" cy="28" r="1.4" fill="${P.ink}"/>`+
      `<path d="M22 32h4l-2 2z" fill="${P.ink}"/>`),
    packhorse: () => tile("#241c0f",
      `<path d="M12 36q0-10 8-12l2-8 4 3-1 5q8 1 10 12z" fill="${P.wood}" stroke="${P.wood2}" stroke-width="1.2"/>`+
      `<path d="M22 16l3-5 2 2-2 4z" fill="${P.wood2}"/>`+
      `<circle cx="24" cy="15" r="1.1" fill="${P.ink}"/>`+
      `<rect x="26" y="26" width="9" height="7" rx="1.5" fill="${P.crim}" opacity=".85"/>`),
  };
  function comp(id) { return (COMP[id] || COMP.ashigaru)(); }

  return { item, itemSVG, comp };
})();
