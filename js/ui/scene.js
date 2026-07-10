/* ============================================================================
 *  scene.js — the illustrated journey, in the old style
 *  --------------------------------------------------------------------------
 *  A single composed SVG "woodblock print" in the left-hand frame. It opens on
 *  the traveller setting out before Mt Fuji. Once anything is gained (a
 *  station, a tool, an item, a companion) the scene becomes a night camp —
 *  campfire, tent, pines, a drying-rack — and everything you own is hung on the
 *  rack or gathered by the fire (additively). As health falls the traveller
 *  grows visibly more hurt. All of it is drawn here in vector, offline, in one
 *  consistent flat ukiyo-e palette. SCENE.sync(state) re-paints from truth.
 * ========================================================================== */
window.SCENE = (function () {
  const C = {
    skyTop:"#243154", skyMid:"#3a4a6b", skyLow:"#8f6f5e", haze:"#c9a483",
    sun:"#c8402f", sunRing:"#e07a4f",
    fuji:"#b9c3da", fujiDark:"#8b97b4", snow:"#f2f5fb", snowShade:"#d9e0ee",
    hill:"#2b3350", hill2:"#343d5e",
    ground:"#b1895c", groundDk:"#936f45", groundLine:"#7d5c38",
    wood:"#7a5230", wood2:"#5c3c20", tent:"#9c6a38", tentDk:"#6f471f", tentDoor:"#241610",
    pine:"#2f5a3e", pineDk:"#234631", pineTrunk:"#6b4a2b",
    flame:"#e0792b", flame2:"#f4c145", ember:"#b8331f", glow:"#e08a3a",
    robe:"#37507a", robeHurt:"#5a5164", skin:"#e6c9a8", straw:"#c8a45c",
    gold:"#d4a24b", goldSoft:"#e6c684", paper:"#efe6d2", crimson:"#b83227", ink:"#12131f",
  };
  const VB = { w:220, h:176, horizon:118 };

  let st = { mode:"fuji", statusId:null, items:[], comps:[], injury:0 };

  /* ---------- small builders ------------------------------------------- */
  function grad() {
    return `<defs>
      <linearGradient id="scSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.skyTop}"/>
        <stop offset="0.55" stop-color="${C.skyMid}"/>
        <stop offset="1" stop-color="${C.skyLow}"/>
      </linearGradient>
      <radialGradient id="scGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="${C.glow}" stop-opacity="0.55"/>
        <stop offset="1" stop-color="${C.glow}" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
  }
  function sky() {
    return `<rect x="0" y="0" width="${VB.w}" height="${VB.h}" fill="url(#scSky)"/>` +
      // sun
      `<circle cx="170" cy="40" r="17" fill="${C.sunRing}" opacity="0.5"/>` +
      `<circle cx="170" cy="40" r="13" fill="${C.sun}"/>` +
      // stylised cloud bands
      `<g fill="${C.paper}" opacity="0.14">` +
      `<path d="M8 58q14-7 28 0t28 0 28 0q-14 7-28 0t-28 0-28 0z"/>` +
      `<path d="M120 30q12-6 24 0t24 0q-12 6-24 0t-24 0z"/>` +
      `</g>`;
  }
  function fuji() {
    return `<path d="M46 ${VB.horizon} Q86 60 110 38 Q134 60 174 ${VB.horizon} Z" fill="${C.fuji}" stroke="${C.fujiDark}" stroke-width="1"/>` +
      // shaded right slope
      `<path d="M110 38 Q134 60 174 ${VB.horizon} L120 ${VB.horizon} Z" fill="${C.fujiDark}" opacity="0.28"/>` +
      // snow cap with wavy hem
      `<path d="M88 72 Q96 79 104 72 Q110 78 116 72 Q124 79 132 72 L110 38 Z" fill="${C.snow}"/>` +
      `<path d="M110 38 L132 72 Q124 79 116 72 Q112 76 110 72 Z" fill="${C.snowShade}"/>`;
  }
  function farHills() {
    return `<path d="M0 ${VB.horizon} Q40 102 92 ${VB.horizon} Z" fill="${C.hill}"/>` +
      `<path d="M120 ${VB.horizon} Q168 100 220 ${VB.horizon} Z" fill="${C.hill2}"/>`;
  }
  function ground() {
    let s = `<rect x="0" y="${VB.horizon}" width="${VB.w}" height="${VB.h - VB.horizon}" fill="${C.ground}"/>`;
    s += `<rect x="0" y="${VB.horizon}" width="${VB.w}" height="3" fill="${C.groundDk}"/>`;
    // faint seigaiha-ish arcs for texture
    s += `<g fill="none" stroke="${C.groundLine}" stroke-width="0.8" opacity="0.5">`;
    for (let i = 0; i < 8; i++) s += `<path d="M${i*30-8} 150 q15 -8 30 0"/>`;
    s += `</g>`;
    return s;
  }

  // a pine tree with feet at (x,baseY)
  function pine(x, baseY, s) {
    s = s || 1;
    const h = 34 * s, w = 15 * s;
    return `<g transform="translate(${x},${baseY})">` +
      `<rect x="${-2*s}" y="${-9*s}" width="${4*s}" height="${9*s}" fill="${C.pineTrunk}"/>` +
      `<path d="M0 ${-h} L${w} ${-h*0.45} L${w*0.45} ${-h*0.45} L${w} ${-h*0.16} L${-w} ${-h*0.16} L${-w*0.45} ${-h*0.45} L${-w} ${-h*0.45} Z" fill="${C.pine}"/>` +
      `<path d="M0 ${-h} L${w*0.55} ${-h*0.5} L${-w*0.55} ${-h*0.5} Z" fill="${C.pineDk}" opacity="0.5"/>` +
      `</g>`;
  }

  function tent() {
    return `<g>` +
      `<path d="M150 150 L173 116 L196 150 Z" fill="${C.tent}" stroke="${C.tentDk}" stroke-width="1.4"/>` +
      `<path d="M173 116 L196 150 L182 150 Z" fill="${C.tentDk}" opacity="0.35"/>` +
      `<path d="M164 150 L173 128 L182 150 Z" fill="${C.tentDoor}"/>` +
      `<circle cx="173" cy="126" r="3" fill="none" stroke="${C.gold}" stroke-width="1.1"/>` +
      `<path d="M173 116 L173 110" stroke="${C.wood2}" stroke-width="1.2"/>` +
      `</g>`;
  }

  function campfire(x, y) {
    return `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="2" rx="16" ry="9" fill="url(#scGlow)"/>` +
      `<rect x="-9" y="0" width="18" height="3.2" rx="1.4" fill="${C.wood}" transform="rotate(12)"/>` +
      `<rect x="-9" y="0" width="18" height="3.2" rx="1.4" fill="${C.wood2}" transform="rotate(-16)"/>` +
      `<path d="M0 -2 Q-6 -8 -2 -14 Q2 -9 3 -13 Q7 -6 2 0 Z" fill="${C.flame}"/>` +
      `<path d="M-0.5 -3 Q-3 -7 -0.5 -11 Q1.5 -8 1 -11 Q4 -6 0.5 -1 Z" fill="${C.flame2}"/>` +
      `</g>`;
  }

  // drying rack with `items` (names) hung as little painted cloths
  function dryingRack(items) {
    const x0 = 12, x1 = 80, top = 118, baseY = 150;
    let s = `<g stroke="${C.wood2}" stroke-width="1.6" stroke-linecap="round">` +
      `<line x1="${x0}" y1="${top}" x2="${x0}" y2="${baseY}"/>` +
      `<line x1="${x1}" y1="${top}" x2="${x1}" y2="${baseY}"/>` +
      `<line x1="${x0-4}" y1="${top}" x2="${x1+4}" y2="${top}" stroke="${C.wood}"/>` +
      `<line x1="${x0-4}" y1="${baseY}" x2="${x0+4}" y2="${baseY}"/>` +
      `<line x1="${x1-4}" y1="${baseY}" x2="${x1+4}" y2="${baseY}"/>` +
      `</g>`;
    const show = items.slice(0, 4);
    const size = 15, gap = (x1 - x0 - show.length * size) / (show.length + 1);
    show.forEach((name, i) => {
      const x = x0 + gap * (i + 1) + i * size;
      s += `<line x1="${x + size/2}" y1="${top}" x2="${x + size/2}" y2="${top+3}" stroke="${C.paper}" stroke-width="0.8"/>`;
      s += place(ART.item(name), x, top + 3, size);
    });
    if (items.length > 4) {
      s += `<text x="${x1 - 2}" y="${top + 12}" font-size="8" fill="${C.paper}" text-anchor="end" ` +
        `font-family="'Zen Kaku Gothic New',sans-serif" font-weight="700">+${items.length - 4}</text>`;
    }
    return s;
  }

  // companions gathered by the fire (little standing figures)
  function companionRow(comps) {
    const show = comps.slice(0, 3);
    let s = "";
    show.forEach((id, i) => {
      s += place(ART.comp(id), 120 + i * 20, 132, 18);
    });
    if (comps.length > 3) {
      s += `<text x="${120 + 3 * 20}" y="146" font-size="8" fill="${C.paper}" ` +
        `font-family="'Zen Kaku Gothic New',sans-serif" font-weight="700">+${comps.length - 3}</text>`;
    }
    return s;
  }

  // the traveller — feet at (x,baseY), injury 0..3
  function traveller(x, baseY, injury) {
    const robe = injury >= 3 ? C.robeHurt : C.robe;
    const lean = injury >= 3 ? ` rotate(-7 0 0)` : "";
    let g = `<g transform="translate(${x},${baseY})${lean}">`;
    g += `<ellipse cx="0" cy="0" rx="9" ry="2.4" fill="#000" opacity="0.28"/>`;
    // legs
    g += `<rect x="-4" y="-11" width="3" height="11" fill="${C.wood2}"/>`;
    g += `<rect x="1" y="-11" width="3" height="11" fill="${C.wood2}"/>`;
    // robe
    g += `<path d="M-8 -11 L8 -11 L6 -30 L-6 -30 Z" fill="${robe}" stroke="${C.ink}" stroke-width="0.7"/>`;
    g += `<path d="M0 -30 L6 -11 L0 -11 Z" fill="#000" opacity="0.12"/>`;
    // sash
    g += `<rect x="-8" y="-19" width="16" height="2.6" fill="${C.crimson}" opacity="0.85"/>`;
    // head + straw hat
    g += `<circle cx="0" cy="-33" r="4" fill="${C.skin}"/>`;
    g += `<path d="M-10 -34 Q0 -42 10 -34 Q0 -31 -10 -34 Z" fill="${C.straw}" stroke="${C.wood2}" stroke-width="0.7"/>`;
    // staff
    g += `<line x1="8" y1="-26" x2="13" y2="1" stroke="${C.wood}" stroke-width="1.6" stroke-linecap="round"/>`;
    // injuries (additive)
    if (injury >= 1) { g += `<rect x="-9" y="-25" width="3.4" height="5" fill="${C.paper}"/><circle cx="-7.3" cy="-22.5" r="1" fill="${C.crimson}"/>`; }
    if (injury >= 2) { g += `<rect x="-4.5" y="-35" width="9" height="2.4" fill="${C.paper}"/><circle cx="3" cy="-18" r="1.3" fill="${C.crimson}"/>`; }
    if (injury >= 3) { g += `<path d="M-5 -26 L3 -14" stroke="${C.crimson}" stroke-width="1.6" opacity="0.8"/><rect x="2" y="-24" width="3.4" height="5" fill="${C.paper}"/>`; }
    g += `</g>`;
    return g;
  }

  // caption cartouche
  function caption(text) {
    return `<g>` +
      `<rect x="6" y="160" width="72" height="12" rx="2" fill="${C.ink}" opacity="0.72" stroke="${C.gold}" stroke-width="0.7"/>` +
      `<text x="42" y="169" font-size="8" fill="${C.goldSoft}" text-anchor="middle" ` +
      `font-family="'Yuji Syuku','Shippori Mincho',serif">${text}</text>` +
      `</g>`;
  }

  // inner ornamental frame (drawn over the art)
  function frameOverlay() {
    const cn = (cx, cy) => `<rect x="${cx-2}" y="${cy-2}" width="4" height="4" fill="${C.gold}" transform="rotate(45 ${cx} ${cy})"/>`;
    return `<rect x="3" y="3" width="${VB.w-6}" height="${VB.h-6}" rx="4" fill="none" stroke="${C.gold}" stroke-width="1.4" opacity="0.85"/>` +
      cn(3,3) + cn(VB.w-3,3) + cn(3,VB.h-3) + cn(VB.w-3,VB.h-3);
  }

  // insert x/y/width/height into an ART tile <svg> so it nests + scales
  function place(svgStr, x, y, size) {
    return svgStr.replace("<svg ", `<svg x="${x}" y="${y}" width="${size}" height="${size}" `);
  }

  /* ---------- composition ---------------------------------------------- */
  function render() {
    const el = document.getElementById("scene-svg");
    if (!el) return;
    let s = grad() + sky() + fuji() + farHills() + ground();

    if (st.mode === "camp") {
      s += pine(16, VB.horizon + 4, 1.05);
      s += pine(206, VB.horizon + 6, 0.9);
      s += tent();
      s += dryingRack(st.items);
      s += campfire(104, 150);
      s += companionRow(st.comps);
      s += traveller(90, 152, st.injury);
      s += caption("野営　Camp");
    } else {
      s += pine(200, VB.horizon + 6, 0.95);
      s += traveller(150, 150, 0);   // a lone traveller, gazing at the mountain
      s += caption("旅立ち　Setting Out");
    }
    s += frameOverlay();
    el.innerHTML = s;
  }

  function injuryFromHp(hp, maxhp) {
    if (!maxhp) return 0;
    const f = hp / maxhp;
    return f > 0.66 ? 0 : f > 0.4 ? 1 : f > 0.15 ? 2 : 3;
  }

  /* ---------- public API ----------------------------------------------- */
  function reset() {
    st = { mode:"fuji", statusId:null, items:[], comps:[], injury:0 };
    render();
  }
  function sync(S) {
    if (!S) { render(); return; }
    // camp appears the moment a station is chosen (your first "obtain")
    st.mode = S.status ? "camp" : "fuji";
    st.statusId = S.status ? S.status.id : null;
    st.items = (S.inventory || []).slice();
    st.comps = (S.companions || []).slice();
    st.injury = injuryFromHp(S.hp, S.maxhp);
    render();
  }

  return { reset, sync, render };
})();
