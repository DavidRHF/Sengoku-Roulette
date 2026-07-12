/* ============================================================================
 *  scene.js — the illustrated journey, in the old style
 *  --------------------------------------------------------------------------
 *  A composed woodblock "print" in the left frame. It now paints a picture for
 *  EVERY spin, not just camps:
 *   • Backdrops vary by biome (city / road / paddy / forest / mountain / river
 *     / coast / shrine), by time of day (dawn·day·dusk·night) and by weather
 *     (clear · rain · snow).
 *   • Each encounter shows a matching MOTIF — bandits fighting, a shrine, an
 *     onryō, a market, a river ford, a lord's court, a beast, a duel, jail
 *     bars, a ransom camp, a press-gang, and more. Tag is enc.art or inferred
 *     from the text.
 *   • Rest sites (and creation) show the CAMP: fire, tent (flying your clan
 *     mon if you bear one), pines, a drying-rack hung with your items,
 *     companions gathered by the fire, the traveller holding their actual tool.
 *   • Injury is CUMULATIVE — the lowest health you've ever reached leaves
 *     scars that never fade: a bandage, then a wound, then a hunched limp.
 *  All vector, offline, one flat palette. SCENE.sync(state) repaints from truth.
 * ========================================================================== */
window.SCENE = (function () {
  const C = {
    ink:"#2a241b",
    fuji:"#e2e8ee", fujiDark:"#7c9ab5", snow:"#f4efe0", snowShade:"#cdd9e6",
    hill:"#8ea9c2", hill2:"#a3bacf",
    ground:"#d8c191", groundDk:"#c2a970", groundLine:"#a98f57",
    wood:"#8a5f34", wood2:"#5c3c20",
    tent:"#a9743c", tentDk:"#6f471f", tentDoor:"#3a2412",
    pine:"#4f6f3f", pineDk:"#3a5730", pineTrunk:"#6b4a2b",
    flame:"#d9772a", flame2:"#f0b03e", glow:"#e0902f",
    robe:"#3a5a86", robeWarrior:"#2f4a6e", robeNoble:"#6e5488", robeRelig:"#c39a3a",
    robeCrim:"#2b3340", robeMerch:"#4f7d4a", robeLow:"#7a5230", robeHurt:"#8a7f70",
    skin:"#e8cfa8", straw:"#d8b968",
    gold:"#b8912f", goldSoft:"#d8b968", paper:"#efe6cf", crimson:"#b23a2c",
    sea:"#274b78", seaLt:"#3f6ea0", foam:"#eef2ea",
    paddy:"#7a9a4a", pagoda:"#7c4a2c", pagodaRoof:"#4a4048",
    torii:"#b23a2c", lantern:"#d8b968", moon:"#f4efe0", star:"#f4efe0",
    rain:"#7c93ad", blade:"#b8bfc9", banner:"#efe6cf", jade:"#4f7d4a",
  };
  const W = 300, H = 210, HZ = 150, GY = 188;

  let st = { mode:"fuji", tag:"setting_out", S:null, minFrac:1 };

  /* ---------------- tiny geometry helpers ------------------------------ */
  const rnd = (seed) => { let x = Math.sin(seed) * 10000; return x - Math.floor(x); };

  function biomeOf(S){
    if(!S || !S.loc || !window.DATA) return "road";
    return (DATA.locations[S.loc] && S.loc) || "road";
  }
  function timeOf(S, rest){
    if(rest) return "night";
    const t = ["dawn","day","day","dusk","night"];
    return t[((S && S.steps) || 0) % t.length];
  }
  function weatherOf(S, biome){
    const s = (S && S.steps) || 0;
    if((biome==="mountain") && s%7===0) return "snow";
    if((biome==="mountain"||biome==="forest"||biome==="river") && s%4===2) return "rain";
    if(biome==="coast" && s%5===0) return "rain";
    return "clear";
  }

  /* ---------------- sky + celestial ------------------------------------ */
  function sky(time){
    const map = {
      dawn:["#d9c3a8","#e8d9bd","#efe6cf"],
      day: ["#c6d8dd","#e2e0cf","#efe6cf"],
      dusk:["#dcae7e","#e6b98c","#d98f5a"],
      night:["#3a4a68","#6b7a92","#aab2bd"],
    };
    const [a,b,c] = map[time] || map.day;
    let s = `<defs><linearGradient id="scSky" x1="0" y1="0" x2="0" y2="1">`+
      `<stop offset="0" stop-color="${a}"/><stop offset="0.6" stop-color="${b}"/>`+
      `<stop offset="1" stop-color="${c}"/></linearGradient>`+
      `<radialGradient id="scGlow" cx="0.5" cy="0.5" r="0.5">`+
      `<stop offset="0" stop-color="${C.glow}" stop-opacity="0.6"/>`+
      `<stop offset="1" stop-color="${C.glow}" stop-opacity="0"/></radialGradient></defs>`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#scSky)"/>`;
    if(time==="night"){
      s += `<circle cx="232" cy="46" r="15" fill="${C.moon}" stroke="${C.ink}" stroke-width="1"/>`+
           `<circle cx="238" cy="42" r="15" fill="${map[time][0]}"/>`; // crescent
      for(let i=0;i<14;i++){ const x=12+rnd(i+1)*276, y=12+rnd(i+9)*90;
        s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(rnd(i)*0.9+0.4).toFixed(1)}" fill="${C.foam}" opacity="0.8"/>`; }
    } else {
      const sy = time==="dusk" ? 92 : time==="dawn" ? 74 : 44;
      s += `<circle cx="232" cy="${sy}" r="18" fill="${C.crimson}" stroke="${C.ink}" stroke-width="1"/>`+
           `<circle cx="227" cy="${sy-4}" r="5" fill="${C.foam}" opacity="0.5"/>`;
    }
    // soft woodblock cloud bands (pale blue on cream)
    s += `<g fill="#c4d3df" opacity="0.5">`+
      `<path d="M6 70q20-8 40 0t40 0 40 0q-20 8-40 0t-40 0-40 0z"/>`+
      `<path d="M150 40q18-7 36 0t36 0q-18 7-36 0t-36 0z"/></g>`;
    return s;
  }

  /* ---------------- backdrop features by biome ------------------------- */
  function fuji(scale, x){
    x = x || 150; const w = 64*scale, h = 82*scale;
    return `<path d="M${x-w} ${HZ} Q${x-w*0.55} ${HZ-h*0.7} ${x} ${HZ-h} Q${x+w*0.55} ${HZ-h*0.7} ${x+w} ${HZ} Z" fill="${C.fuji}" stroke="${C.fujiDark}" stroke-width="1"/>`+
      `<path d="M${x} ${HZ-h} Q${x+w*0.55} ${HZ-h*0.7} ${x+w} ${HZ} L${x+w*0.25} ${HZ} Z" fill="${C.fujiDark}" opacity="0.25"/>`+
      `<path d="M${x-w*0.35} ${HZ-h*0.62} Q${x-w*0.12} ${HZ-h*0.55} ${x} ${HZ-h*0.63} Q${x+w*0.12} ${HZ-h*0.55} ${x+w*0.35} ${HZ-h*0.62} L${x} ${HZ-h} Z" fill="${C.snow}"/>`;
  }
  function pine(x, baseY, s){ s=s||1; const h=34*s, w=15*s;
    return `<g transform="translate(${x},${baseY})">`+
      `<rect x="${-2*s}" y="${-9*s}" width="${4*s}" height="${9*s}" fill="${C.pineTrunk}"/>`+
      `<path d="M0 ${-h} L${w} ${-h*0.45} L${w*0.45} ${-h*0.45} L${w} ${-h*0.16} L${-w} ${-h*0.16} L${-w*0.45} ${-h*0.45} L${-w} ${-h*0.45} Z" fill="${C.pine}"/>`+
      `<path d="M0 ${-h} L${w*0.55} ${-h*0.5} L${-w*0.55} ${-h*0.5} Z" fill="${C.pineDk}" opacity="0.5"/></g>`; }
  function horse(x, baseY, s, flip){ s=s||1; const f = flip?" scale(-1,1)":"";
    return `<g transform="translate(${x},${baseY}) scale(${s})${f}">`+
      `<ellipse cx="0" cy="0" rx="20" ry="3" fill="#000" opacity="0.25"/>`+
      `<path d="M-22 -18 Q-24 -30 -16 -32 L-12 -26 Q-6 -30 0 -26 Q10 -26 18 -16 L18 -2 L13 -2 L11 -12 Q4 -8 -4 -10 L-4 -2 L-9 -2 L-9 -12 Q-16 -12 -18 -18 Z" fill="${C.wood}" stroke="${C.wood2}" stroke-width="1"/>`+
      `<path d="M-16 -32 l-4 -6 3 1 2 4z" fill="${C.wood2}"/>`+
      `<path d="M-20 -20 q-6 4 -8 12 q4 -4 9 -8z" fill="${C.pineDk}" opacity="0.7"/>`+
      `<circle cx="-17" cy="-27" r="1.1" fill="${C.ink}"/></g>`; }
  function torii(x, baseY, s){ s=s||1; const w=30*s, h=34*s;
    return `<g transform="translate(${x},${baseY})" fill="${C.torii}">`+
      `<rect x="${-w/2-3}" y="${-h}" width="${w+6}" height="4"/>`+
      `<rect x="${-w/2-2}" y="${-h+7}" width="${w+4}" height="3.4"/>`+
      `<rect x="${-w/2}" y="${-h}" width="4" height="${h}"/>`+
      `<rect x="${w/2-4}" y="${-h}" width="4" height="${h}"/></g>`; }
  function lantern(x, baseY, s){ s=s||1;
    return `<g transform="translate(${x},${baseY})">`+
      `<rect x="-4" y="-20" width="8" height="12" rx="1.5" fill="${C.lantern}" stroke="${C.wood2}" stroke-width="1"/>`+
      `<rect x="-6" y="-22" width="12" height="3" fill="${C.wood2}"/>`+
      `<rect x="-2" y="-8" width="4" height="8" fill="${C.wood2}"/></g>`; }
  // an animated campfire: pulsing glow + flickering flame
  function firePit(x, y, s){ s=s||1;
    return `<g transform="translate(${x},${y}) scale(${s})">`+
      `<ellipse cx="0" cy="2" rx="20" ry="10" fill="url(#scGlow)">`+
        `<animate attributeName="opacity" values="0.65;1;0.7;0.95;0.65" dur="1.7s" repeatCount="indefinite"/></ellipse>`+
      `<rect x="-10" y="0" width="20" height="3.4" rx="1.4" fill="${C.wood}" transform="rotate(12)"/>`+
      `<rect x="-10" y="0" width="20" height="3.4" rx="1.4" fill="${C.wood2}" transform="rotate(-16)"/>`+
      `<g>`+
        `<animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;1.05 1.18;0.96 0.9;1.04 1.12;1 1" dur="0.7s" repeatCount="indefinite"/>`+
        `<path d="M0 -3 Q-7 -10 -2 -17 Q2 -11 4 -16 Q9 -7 3 0 Z" fill="${C.flame}"/>`+
        `<path d="M0 -4 Q-3 -9 0 -14 Q2 -10 2 -13 Q5 -7 1 -1 Z" fill="${C.flame2}"/></g></g>`; }
  function pagoda(x, baseY, s){ s=s||1; const u=(a,b,w,h)=>`<rect x="${a}" y="${b}" width="${w}" height="${h}" fill="${C.pagoda}"/>`;
    const roof=(y,w)=>`<path d="M${-w} ${y} Q0 ${y-7} ${w} ${y} L${w*0.7} ${y+2} Q0 ${y-3} ${-w*0.7} ${y+2} Z" fill="${C.pagodaRoof}"/>`;
    return `<g transform="translate(${x},${baseY}) scale(${s})">`+u(-8,-40,16,40)+roof(-40,18)+roof(-28,15)+roof(-16,12)+`</g>`; }
  function paddies(){ let s=`<rect x="0" y="${HZ}" width="${W}" height="18" fill="${C.paddy}"/>`;
    s+=`<g stroke="#4f6a32" stroke-width="0.8" opacity="0.6">`;
    for(let i=0;i<10;i++) s+=`<path d="M${i*30} ${HZ+2} q15 6 30 0"/>`; s+=`</g>`; return s; }
  function sea(){ let s=`<rect x="0" y="${HZ}" width="${W}" height="${H-HZ}" fill="${C.sea}"/>`;
    s+=`<g fill="none" stroke="${C.foam}" stroke-width="1" opacity="0.5">`;
    for(let r=0;r<5;r++) for(let i=0;i<11;i++) s+=`<path d="M${i*30-10} ${HZ+8+r*10} q10 -6 20 0"/>`;
    s+=`</g>`; return s; }
  function ground(biome){
    if(biome==="coast") return sea();
    let s=`<rect x="0" y="${HZ}" width="${W}" height="${H-HZ}" fill="${C.ground}"/>`;
    s+=`<rect x="0" y="${HZ}" width="${W}" height="3" fill="${C.groundDk}"/>`;
    if(biome==="farm") s = paddies()+`<rect x="0" y="${HZ+18}" width="${W}" height="${H-HZ-18}" fill="${C.ground}"/>`;
    s+=`<g fill="none" stroke="${C.groundLine}" stroke-width="0.8" opacity="0.45">`;
    for(let i=0;i<10;i++) s+=`<path d="M${i*32-8} ${HZ+22} q16 -8 32 0"/>`; s+=`</g>`;
    return s;
  }
  function weatherFx(weather){
    if(weather==="rain"){ let s=`<g stroke="${C.rain}" stroke-width="1" opacity="0.5">`+
        `<animateTransform attributeName="transform" type="translate" values="0 -12;0 12" dur="0.45s" repeatCount="indefinite"/>`;
      for(let i=0;i<44;i++){ const x=rnd(i)*W, y=rnd(i+5)*(H+24)-12; s+=`<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x-4).toFixed(0)}" y2="${(y+11).toFixed(0)}"/>`; }
      return s+`</g>`; }
    if(weather==="snow"){ let s=`<g fill="${C.paper}" opacity="0.85">`+
        `<animateTransform attributeName="transform" type="translate" values="0 -14;2 14" dur="3.2s" repeatCount="indefinite"/>`;
      for(let i=0;i<36;i++){ const x=rnd(i)*W, y=rnd(i+3)*(H+28)-14; s+=`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(rnd(i)*1+0.6).toFixed(1)}"/>`; }
      return s+`</g>`; }
    return "";
  }

  function backdrop(biome, time, weather){
    let s = sky(time);
    // mountain / far peak
    if(biome==="mountain") s += fuji(1.15, 150);
    else if(biome==="coast") { s += fuji(0.7, 60); }
    else if(biome==="forest"||biome==="river"||biome==="road"||biome==="outskirts"||biome==="tokaido") s += fuji(0.8, 150);
    else if(biome==="farm") s += fuji(0.8, 210);
    else s += fuji(0.75, 150);
    // hills
    s += `<path d="M0 ${HZ} Q46 ${HZ-18} 100 ${HZ} Z" fill="${C.hill}"/>`+
         `<path d="M150 ${HZ} Q210 ${HZ-20} ${W} ${HZ} Z" fill="${C.hill2}"/>`;
    // biome landmark
    if(biome==="shrine"||biome==="kyoto") s += torii(60, HZ+2, 1.05);
    if(biome==="edo"||biome==="kyoto") s += pagoda(250, HZ+2, 1.05);
    if(biome==="forest"){ s += pine(24,HZ+4,1.1)+pine(276,HZ+8,1.25)+pine(50,HZ+6,0.8); }
    s += ground(biome);
    s += weatherFx(weather);
    return s;
  }

  /* ---------------- the traveller / figures ---------------------------- */
  function robeFor(S){
    if(!S) return C.robe;
    const c = S.circles || (S.status && S.status.circles) || [];
    if(c.includes("warrior")) return C.robeWarrior;
    if(c.includes("noble")) return C.robeNoble;
    if(c.includes("religious")) return C.robeRelig;
    if(c.includes("criminal")) return C.robeCrim;
    if(c.includes("merchant")||c.includes("artisan")) return C.robeMerch;
    if(c.includes("low")||c.includes("peasant")) return C.robeLow;
    return C.robe;
  }
  function toolGlyphKey(S){
    if(!S) return null;
    const t = (S.tool && S.tool.name) || "";
    const n = t.toLowerCase();
    if(/bow|yumi/.test(n)) return "bow";
    if(/matchlock|teppo|gun/.test(n)) return "gun";
    if(/naginata|glaive/.test(n)) return "naginata";
    if(/spear|yari/.test(n)) return "spear";
    if(/katana|blade|sword|wakizashi|tach|tanto|tantō|knife|dagger/.test(n)) return "katana";
    if(/staff|bo\b|cane|stick/.test(n)) return "staff";
    return null;
  }
  // weapon drawn at hand origin (0,0), extending up-right; caller places it
  function weapon(key){
    switch(key){
      case "katana": return `<line x1="0" y1="0" x2="15" y2="-11" stroke="${C.blade}" stroke-width="2"/><line x1="-1" y1="1" x2="3" y2="-2" stroke="${C.gold}" stroke-width="2.4"/>`;
      case "spear": return `<line x1="-3" y1="4" x2="16" y2="-14" stroke="${C.wood}" stroke-width="2"/><path d="M16 -14 l4 -3 -1 5 z" fill="${C.blade}"/>`;
      case "naginata": return `<line x1="-3" y1="5" x2="12" y2="-10" stroke="${C.wood}" stroke-width="2"/><path d="M12 -10 q6 -2 9 -7 q-1 6 -5 9 z" fill="${C.blade}"/>`;
      case "bow": return `<path d="M2 6 Q14 -6 2 -18" fill="none" stroke="${C.wood}" stroke-width="2"/><line x1="2" y1="6" x2="2" y2="-18" stroke="${C.paper}" stroke-width="0.7"/>`;
      case "gun": return `<rect x="0" y="-2" width="16" height="3" rx="1" fill="#3a3a42" transform="rotate(-14)"/><rect x="-3" y="0" width="4" height="6" rx="1" fill="${C.wood2}"/>`;
      case "staff": return `<line x1="1" y1="-8" x2="6" y2="16" stroke="${C.wood}" stroke-width="2" stroke-linecap="round"/>`;
      default: return "";
    }
  }
  function hat(kind){
    if(kind==="helmet") return `<path d="M-9 -33 Q0 -44 9 -33 Q0 -30 -9 -33 Z" fill="#2b2f3a" stroke="${C.ink}" stroke-width="0.7"/><path d="M-3 -41 Q0 -47 3 -41" fill="none" stroke="${C.gold}" stroke-width="2"/>`;
    if(kind==="hood") return `<path d="M-6 -30 Q0 -42 6 -30 Q4 -36 0 -36 Q-4 -36 -6 -30 Z" fill="#20232e"/>`;
    if(kind==="bald") return "";
    if(kind==="none") return "";
    return `<path d="M-10 -34 Q0 -42 10 -34 Q0 -31 -10 -34 Z" fill="${C.straw}" stroke="${C.wood2}" stroke-width="0.7"/>`; // kasa
  }
  // person: feet at (x,baseY); opts {robe,hat,tool,injury,pose,flip,skin}
  function person(x, baseY, s, o){
    o = o || {};
    const robe = o.injury>=3 ? C.robeHurt : (o.robe || C.robe);
    const skin = o.skin || C.skin;
    const flip = o.flip ? " scale(-1,1)" : "";
    const lean = (o.injury>=3 && o.pose!=="fallen") ? " rotate(-7 0 0)" : "";
    let g = `<g transform="translate(${x},${baseY}) scale(${s})${flip}${lean}">`;
    g += `<ellipse cx="0" cy="0" rx="9" ry="2.4" fill="#000" opacity="0.26"/>`;

    if(o.pose==="fallen"){
      g += `<path d="M-14 -2 L6 -6 L8 -1 L-13 2 Z" fill="${robe}" stroke="${C.ink}" stroke-width="0.6"/>`;
      g += `<circle cx="-15" cy="-5" r="4" fill="${skin}"/>`;
      g += hat(o.hat).replace(/translate|rotate/g,"");
      g += `</g>`; return g;
    }
    if(o.pose==="fight"){
      g += `<rect x="-7" y="-10" width="3" height="10" fill="${C.wood2}" transform="rotate(-12)"/>`;
      g += `<rect x="3" y="-10" width="3" height="10" fill="${C.wood2}" transform="rotate(10)"/>`;
      g += `<path d="M-9 -10 L7 -11 L5 -27 L-7 -26 Z" fill="${robe}" stroke="${C.ink}" stroke-width="0.7"/>`;
      g += `<rect x="-8" y="-19" width="15" height="2.4" fill="${C.crimson}" opacity="0.85"/>`;
      g += `<circle cx="-1" cy="-30" r="4" fill="${skin}"/>`;
      g += hat(o.hat);
      // raised weapon arm
      g += `<line x1="-2" y1="-25" x2="9" y2="-33" stroke="${robe}" stroke-width="3"/>`;
      g += `<g transform="translate(9,-33)">${weapon(o.tool||"katana")}</g>`;
      if(o.injury>=1){ g+=`<rect x="-9" y="-24" width="3.2" height="5" fill="${C.paper}"/>`; }
      if(o.injury>=2){ g+=`<rect x="-5" y="-34" width="8" height="2.2" fill="${C.paper}"/>`; }
      g += `</g>`; return g;
    }
    if(o.pose==="bow"){
      g += `<rect x="-4" y="-11" width="3" height="11" fill="${C.wood2}"/><rect x="1" y="-11" width="3" height="11" fill="${C.wood2}"/>`;
      g += `<path d="M-8 -11 L6 -11 L12 -22 L2 -24 Z" fill="${robe}" stroke="${C.ink}" stroke-width="0.7"/>`;
      g += `<circle cx="11" cy="-24" r="4" fill="${skin}"/>`;
      g += `</g>`; return g;
    }
    // stand (default)
    g += `<rect x="-4" y="-11" width="3" height="11" fill="${C.wood2}"/><rect x="1" y="-11" width="3" height="11" fill="${C.wood2}"/>`;
    g += `<path d="M-8 -11 L8 -11 L6 -30 L-6 -30 Z" fill="${robe}" stroke="${C.ink}" stroke-width="0.7"/>`;
    g += `<path d="M0 -30 L6 -11 L0 -11 Z" fill="#000" opacity="0.12"/>`;
    g += `<rect x="-8" y="-19" width="16" height="2.6" fill="${C.crimson}" opacity="0.85"/>`;
    g += `<circle cx="0" cy="-33" r="4" fill="${skin}"/>`;
    g += hat(o.hat);
    if(o.tool){ g += `<g transform="translate(7,-22)">${weapon(o.tool)}</g>`; }
    else { g += `<line x1="8" y1="-26" x2="12" y2="1" stroke="${C.wood}" stroke-width="1.6" stroke-linecap="round"/>`; }
    if(o.injury>=1){ g += `<rect x="-9" y="-25" width="3.4" height="5" fill="${C.paper}"/><circle cx="-7.3" cy="-22.5" r="1" fill="${C.crimson}"/>`; }
    if(o.injury>=2){ g += `<rect x="-4.5" y="-35" width="9" height="2.4" fill="${C.paper}"/><circle cx="3" cy="-18" r="1.3" fill="${C.crimson}"/>`; }
    if(o.injury>=3){ g += `<path d="M-5 -26 L3 -14" stroke="${C.crimson}" stroke-width="1.6" opacity="0.8"/>`; }
    g += `</g>`; return g;
  }

  /* ---------------- misc props for motifs ------------------------------ */
  function banner(x, baseY, s){ s=s||1;
    return `<g transform="translate(${x},${baseY}) scale(${s})">`+
      `<rect x="-1" y="-46" width="2.4" height="46" fill="${C.wood2}"/>`+
      `<rect x="1" y="-46" width="14" height="34" fill="${C.banner}" stroke="${C.wood2}" stroke-width="0.6"/>`+
      `<circle cx="8" cy="-33" r="4.5" fill="none" stroke="${C.crimson}" stroke-width="1.4"/>`+
      `<path d="M8 -37 q3 4 0 8 q-3 -4 0 -8z" fill="${C.crimson}"/></g>`; }
  function stall(x){ return `<g transform="translate(${x},${GY})">`+
      `<rect x="-22" y="-6" width="44" height="6" fill="${C.wood}"/>`+
      `<path d="M-26 -6 L26 -6 L20 -20 L-20 -20 Z" fill="${C.crimson}" opacity="0.85"/>`+
      `<rect x="-24" y="-20" width="48" height="3" fill="${C.paper}" opacity="0.5"/>`+
      `<circle cx="-10" cy="-9" r="2.5" fill="${C.gold}"/><circle cx="0" cy="-9" r="2.5" fill="${C.paper}"/><circle cx="10" cy="-9" r="2.5" fill="${C.crimson}"/></g>`; }
  function bars(){ let s=`<rect x="0" y="0" width="${W}" height="${H}" fill="#000" opacity="0.32"/>`;
    s+=`<g fill="${C.wood2}">`; for(let i=0;i<7;i++){ s+=`<rect x="${18+i*44}" y="6" width="9" height="${H-12}"/>`; }
    s+=`<rect x="6" y="10" width="${W-12}" height="9"/><rect x="6" y="${H-19}" width="${W-12}" height="9"/></g>`; return s; }
  function boat(x){ return `<g transform="translate(${x},${HZ+22})">`+
      `<path d="M-26 0 Q0 12 26 0 L20 6 Q0 14 -20 6 Z" fill="${C.wood2}"/>`+
      `<rect x="-1" y="-22" width="2" height="22" fill="${C.wood}"/>`+
      `<path d="M1 -22 L14 -8 L1 -8 Z" fill="${C.paper}" opacity="0.85"/></g>`; }
  function crow(x,y){ return `<path d="M${x} ${y} q4 -3 8 0 q-4 1 -4 4 q0 -3 -4 -4z" fill="#111"/>`; }

  /* ---- extra props used by the bespoke ending scenes ------------------ */
  function bigMoon(cx,cy,r,fill){ return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill||C.moon}"/>`; }
  function ensoRing(cx,cy,r){ return `<path d="M${cx-r*0.7} ${cy-r*0.7} A ${r} ${r} 0 1 1 ${cx-r*0.9} ${cy+r*0.4}" `+
      `fill="none" stroke="${C.gold}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`; }
  function crowd(cx, baseY, n){ let s=""; for(let i=0;i<n;i++){ const x=cx+(i-(n-1)/2)*15+ (rnd(i)*4-2);
      const rob=[C.robeLow,C.robeMerch,C.robeRelig,C.robeCrim][i%4];
      s+=`<g transform="translate(${x.toFixed(0)},${baseY})"><path d="M-6 0 L6 0 L4 -14 L-4 -14 Z" fill="${rob}"/>`+
         `<circle cx="0" cy="-17" r="3.4" fill="${C.skin}"/></g>`; } return s; }
  function castle(x, baseY, s){ s=s||1; const roof=(y,w)=>`<path d="M${-w} ${y} Q0 ${y-7} ${w} ${y} L${w-4} ${y+3} L${-w+4} ${y+3} Z" fill="${C.pagodaRoof}"/>`;
    return `<g transform="translate(${x},${baseY}) scale(${s})">`+
      `<rect x="-24" y="-52" width="48" height="52" fill="#d9c7a8"/>`+
      `<rect x="-24" y="-52" width="48" height="4" fill="${C.wood2}"/>`+
      roof(-52,30)+`<rect x="-16" y="-44" width="32" height="30" fill="#c9b48a"/>`+
      roof(-30,20)+`<rect x="-10" y="-24" width="20" height="18" fill="#c9b48a"/>`+roof(-6,12)+
      `<rect x="-6" y="-14" width="4" height="8" fill="${C.tentDoor}"/><rect x="2" y="-14" width="4" height="8" fill="${C.tentDoor}"/>`+
      `<rect x="-4" y="-40" width="8" height="6" fill="${C.gold}"/></g>`; }
  function stele(x, baseY, s){ s=s||1; return `<g transform="translate(${x},${baseY}) scale(${s})">`+
      `<rect x="-14" y="-6" width="28" height="6" fill="#7a7f8c"/>`+
      `<path d="M-11 -6 L-11 -50 Q0 -60 11 -50 L11 -6 Z" fill="#9aa3b2" stroke="#5a6472" stroke-width="1.4"/>`+
      `<circle cx="0" cy="-34" r="6" fill="none" stroke="${C.crimson}" stroke-width="1.6"/>`+
      `<path d="M0 -38 q3 4 0 8 q-3 -4 0 -8z" fill="${C.crimson}"/></g>`; }
  function skull(x,y,s){ s=s||1; return `<g transform="translate(${x},${y}) scale(${s})">`+
      `<path d="M-9 2 Q-12 -14 0 -14 Q12 -14 9 2 L5 2 L5 6 L-5 6 L-5 2 Z" fill="#e8e2d0" stroke="#b8b09a" stroke-width="1"/>`+
      `<circle cx="-4" cy="-3" r="2.4" fill="#2b2b33"/><circle cx="4" cy="-3" r="2.4" fill="#2b2b33"/>`+
      `<path d="M-1 0 L1 0 L0 3 Z" fill="#2b2b33"/></g>`; }
  function grave(x, baseY, s){ s=s||1; return `<g transform="translate(${x},${baseY}) scale(${s})">`+
      `<rect x="-3" y="-40" width="6" height="40" fill="#c9b48a"/>`+
      `<path d="M-3 -40 l3 -5 3 5z" fill="#c9b48a"/>`+
      `<line x1="-3" y1="-30" x2="3" y2="-30" stroke="${C.wood2}" stroke-width="1"/>`+
      `<line x1="-3" y1="-22" x2="3" y2="-22" stroke="${C.wood2}" stroke-width="1"/></g>`; }
  function coinPile(x, baseY){ let s=""; const spots=[[0,0],[-8,1],[8,1],[-4,-4],[4,-4],[0,-8]];
    for(const [dx,dy] of spots){ s+=`<circle cx="${x+dx}" cy="${baseY+dy}" r="5" fill="${C.gold}" stroke="#7a5216" stroke-width="1"/>`+
      `<rect x="${x+dx-1.6}" y="${baseY+dy-1.6}" width="3.2" height="3.2" fill="#7a5216"/>`; } return s; }
  function bridge(){ return `<path d="M40 176 Q150 140 260 176" fill="none" stroke="${C.wood2}" stroke-width="6"/>`+
      `<path d="M40 176 Q150 146 260 176" fill="none" stroke="${C.wood}" stroke-width="3"/>`+
      `<g stroke="${C.wood2}" stroke-width="2">`+Array.from({length:7},(_,i)=>`<line x1="${60+i*30}" y1="${168-Math.round(Math.sin(i/6*Math.PI)*22)}" x2="${60+i*30}" y2="176"/>`).join("")+`</g>`; }
  function dais(x,baseY,w){ return `<rect x="${x-w}" y="${baseY-6}" width="${w*2}" height="6" fill="${C.wood}"/>`+
      `<rect x="${x-w}" y="${baseY-10}" width="${w*2}" height="4" fill="${C.crimson}"/>`; }

  /* ---------------- MOTIFS (foreground per encounter) ------------------ */
  function playerOpts(inj, tool, S){ return { robe:robeFor(S), hat:"kasa", tool:tool, injury:inj }; }

  const MOTIF = {
    setting_out:(x)=> person(178, GY, 1.2, {robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    road:(x)=> person(150, GY, 1.25, {robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    bandits:(x)=>
      person(96, GY, 1.2, {robe:robeFor(x.S),hat:"kasa",tool:x.tool||"katana",injury:x.inj,pose:"fight"})+
      person(210, GY, 1.15, {robe:C.robeCrim,hat:"hood",tool:"katana",injury:0,pose:"fight",flip:true})+
      person(238, GY-2, 1.05, {robe:C.robeCrim,hat:"hood",tool:"spear",injury:0,pose:"stand",flip:true})+
      `<path d="M150 150 l24 -14 M172 150 l-22 -14" stroke="${C.gold}" stroke-width="1" opacity="0.6"/>`,
    duel:(x)=>
      person(104, GY, 1.25, {robe:robeFor(x.S),hat:"kasa",tool:x.tool||"katana",injury:x.inj,pose:"fight"})+
      person(206, GY, 1.25, {robe:"#4a3550",hat:"none",tool:"katana",injury:0,pose:"fight",flip:true}),
    shrine:(x)=> torii(150, GY, 1.4)+lantern(96, GY,1.1)+lantern(204,GY,1.1)+
      person(150, GY, 1.15, {robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj,pose:"bow"}),
    monk:(x)=> person(150,GY,1.2,{robe:C.robeRelig,hat:"bald",tool:"staff",injury:0})+
      person(96,GY,0.9,{robe:C.robeLow,hat:"none",injury:0})+person(210,GY,0.9,{robe:C.robeLow,hat:"none",injury:0})+
      person(60,GY,1.1,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    ghost:(x)=> `<g opacity="0.7"><path d="M196 ${GY} q-10 -46 8 -60 q18 14 8 60 q-8 -6 -8 4 q0 -10 -8 -4z" fill="#cfe3ea"/>`+
      `<circle cx="200" cy="${GY-52}" r="6" fill="#eef6f8"/><circle cx="198" cy="${GY-53}" r="1.2" fill="#33414a"/><circle cx="203" cy="${GY-53}" r="1.2" fill="#33414a"/></g>`+
      person(110,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    market:(x)=> stall(70)+stall(212)+person(150,GY,1.1,{robe:C.robeMerch,hat:"none",injury:0})+
      person(120,GY,1.1,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    battlefield:(x)=> banner(60,GY,1)+banner(250,GY,0.9)+
      person(150,GY,0.95,{robe:C.robeWarrior,injury:0,pose:"fallen"})+
      crow(120,110)+crow(180,96)+crow(150,120)+
      person(100,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    court:(x)=> `<rect x="150" y="70" width="150" height="8" fill="${C.crimson}"/>`+
      `<g stroke="${C.paper}" stroke-width="6" opacity="0.85">`+
      `<line x1="170" y1="78" x2="170" y2="128"/><line x1="200" y1="78" x2="200" y2="128"/><line x1="230" y1="78" x2="230" y2="128"/><line x1="260" y1="78" x2="260" y2="128"/></g>`+
      banner(276,GY,0.9)+person(210,GY,1.05,{robe:C.robeNoble,hat:"none",injury:0,pose:"sit"})+
      person(120,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj,pose:"bow"}),
    river:(x)=> `<rect x="0" y="${HZ}" width="${W}" height="${H-HZ}" fill="${C.sea}"/>`+
      `<g fill="none" stroke="${C.foam}" stroke-width="1" opacity="0.5">`+
      Array.from({length:5},(_,r)=>Array.from({length:11},(_,i)=>`<path d="M${i*30-10} ${HZ+8+r*10} q10 -6 20 0"/>`).join("")).join("")+`</g>`+
      `<ellipse cx="110" cy="176" rx="10" ry="3" fill="${C.groundDk}"/><ellipse cx="150" cy="184" rx="10" ry="3" fill="${C.groundDk}"/><ellipse cx="190" cy="176" rx="10" ry="3" fill="${C.groundDk}"/>`+
      person(110,176,1.1,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    coast:(x)=> boat(210)+person(96,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    beast:(x)=> `<g transform="translate(210,${GY})"><path d="M-30 0 q4 -20 22 -18 q10 -6 18 2 q-6 2 -10 0 q6 6 4 14 l-6 2 -4 -8 -6 8 -6 -8 -6 8z" fill="#5a4630"/>`+
      `<circle cx="6" cy="-14" r="1.3" fill="${C.crimson}"/></g>`+
      person(96,GY,1.2,{robe:robeFor(x.S),hat:"kasa",tool:x.tool||"spear",injury:x.inj,pose:"fight"}),
    gamble:(x)=> `<ellipse cx="150" cy="176" rx="46" ry="12" fill="${C.wood}" opacity="0.7"/>`+
      `<rect x="140" y="168" width="8" height="8" fill="${C.paper}"/><rect x="152" y="170" width="8" height="8" fill="${C.paper}"/>`+
      person(96,GY,1.05,{robe:C.robeCrim,hat:"none",injury:0,pose:"sit"})+
      person(204,GY,1.05,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj,pose:"sit"}),
    gate:(x)=> `<g><rect x="120" y="96" width="60" height="8" fill="${C.wood2}"/><rect x="122" y="104" width="8" height="46" fill="${C.wood}"/><rect x="170" y="104" width="8" height="46" fill="${C.wood}"/><rect x="130" y="112" width="40" height="30" fill="${C.tentDoor}" opacity="0.7"/></g>`+
      person(196,GY,1.05,{robe:C.robeWarrior,hat:"helmet",tool:"spear",injury:0,flip:true})+
      person(96,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    festival:(x)=> `<g>`+Array.from({length:6},(_,i)=>`<line x1="${20+i*50}" y1="70" x2="${45+i*50}" y2="60" stroke="${C.wood2}" stroke-width="0.8"/>`+`<circle cx="${32+i*50}" cy="72" r="5" fill="${i%2?C.crimson:C.lantern}"/>`).join("")+`</g>`+
      person(150,GY,1.15,{robe:C.robeRelig,hat:"none",injury:0})+
      person(100,GY,1.1,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    poison:(x)=> `<rect x="0" y="0" width="${W}" height="${H}" fill="#0a0c16" opacity="0.35"/>`+
      person(206,GY,1.15,{robe:"#1c1c26",hat:"hood",injury:0,flip:true})+
      person(104,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    wounded:(x)=> person(200,GY,1.05,{robe:C.robeLow,injury:0,pose:"fallen"})+
      person(110,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj,pose:"bow"}),
    mystic:(x)=> `<g opacity="0.5" fill="none" stroke="${C.goldSoft}" stroke-width="1.4"><circle cx="200" cy="96" r="18"/><circle cx="200" cy="96" r="10"/></g>`+
      person(150,GY,0.95,{robe:C.robeRelig,hat:"hood",injury:0})+
      person(96,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    // ---- bespoke marquee & new-station motifs ------------------------
    tea:(x)=> `<rect x="60" y="98" width="180" height="5" fill="${C.wood2}"/>`+
      `<rect x="138" y="66" width="22" height="34" fill="${C.paper}" opacity="0.85" stroke="${C.wood2}" stroke-width="0.6"/>`+
      `<path d="M144 74 q5 6 10 0" stroke="${C.crimson}" stroke-width="1" fill="none"/>`+
      person(96,GY,1.05,{robe:C.robeWarrior,hat:"none",injury:0,pose:"sit",flip:true})+
      person(204,GY,1.05,{robe:C.robeNoble,hat:"none",injury:0,pose:"sit"})+
      person(150,GY,1.1,{robe:robeFor(x.S),hat:"none",injury:x.inj,pose:"bow"})+
      `<circle cx="150" cy="176" r="4" fill="${C.jade}"/><circle cx="150" cy="175" r="2" fill="${C.paper}"/>`,
    sumo:(x)=> `<ellipse cx="150" cy="178" rx="74" ry="18" fill="#d9c49a" stroke="#b09666" stroke-width="1.4"/>`+
      `<ellipse cx="150" cy="178" rx="58" ry="12" fill="none" stroke="#b09666" stroke-width="1"/>`+
      person(124,178,1.35,{robe:C.robeLow,hat:"none",injury:0,pose:"fight"})+
      person(176,178,1.35,{robe:C.robeCrim,hat:"none",injury:x.inj,pose:"fight",flip:true}),
    cavalry:(x)=> horse(214,GY,1.25,true)+ person(214,GY-30,1.0,{robe:C.robeWarrior,hat:"helmet",tool:"spear",injury:0,flip:true})+
      person(92,GY,1.2,{robe:robeFor(x.S),hat:"kasa",tool:x.tool||"katana",injury:x.inj,pose:"fight"}),
    plague:(x)=> `<rect x="118" y="96" width="64" height="8" fill="${C.wood2}"/>`+
      `<line x1="122" y1="104" x2="122" y2="150" stroke="${C.wood}" stroke-width="4"/><line x1="178" y1="104" x2="178" y2="150" stroke="${C.wood}" stroke-width="4"/>`+
      `<path d="M122 100 h56" stroke="${C.paper}" stroke-width="3"/>`+
      `<path d="M130 100 v6 M142 100 v6 M154 100 v6 M166 100 v6" stroke="${C.paper}" stroke-width="1.4"/>`+
      person(196,GY,1.0,{robe:C.robeLow,injury:0,pose:"fallen"})+
      person(120,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj,pose:"bow"}),
    harbor:(x)=> `<rect x="0" y="${HZ}" width="${W}" height="${H-HZ}" fill="${C.sea}"/>`+
      `<g fill="none" stroke="${C.foam}" stroke-width="1" opacity="0.5">`+
      Array.from({length:4},(_,r)=>Array.from({length:11},(_,i)=>`<path d="M${i*30-10} ${HZ+10+r*11} q10 -6 20 0"/>`).join("")).join("")+`</g>`+
      `<g transform="translate(196,168) rotate(-8)"><path d="M-40 0 Q0 20 40 0 L30 10 Q0 18 -30 10 Z" fill="${C.wood2}"/>`+
      `<rect x="-1" y="-40" width="3" height="40" fill="${C.wood}"/><path d="M2 -38 L22 -12 L2 -12 Z" fill="${C.paper}" opacity="0.85"/>`+
      `<rect x="-18" y="-6" width="10" height="7" fill="${C.tent}"/></g>`+
      person(84,180,1.1,{robe:robeFor(x.S),hat:"kasa",tool:x.tool||"katana",injury:x.inj}),
    biwa:(x)=> person(112,GY,1.15,{robe:robeFor(x.S),hat:"none",injury:x.inj,pose:"sit"})+
      `<path d="M118 ${GY-18} q10 -2 8 -14" stroke="${C.wood2}" stroke-width="2" fill="none"/>`+
      `<path d="M122 ${GY-30} a5 8 0 1 0 0.1 0z" fill="${C.wood}"/>`+
      person(190,GY,1.0,{robe:C.robeWarrior,hat:"helmet",injury:0,flip:true})+
      person(216,GY,1.0,{robe:C.robeWarrior,hat:"helmet",injury:0,flip:true}),
    reckoning:(x)=> `<rect x="0" y="0" width="${W}" height="${H}" fill="#0a0e1c" opacity="0.42"/>`+ weatherFx("rain")+
      lantern(52,GY,1.1)+ `<rect x="40" y="${HZ}" width="${W-80}" height="3" fill="${C.groundDk}"/>`+
      person(108,GY,1.3,{robe:robeFor(x.S),hat:"none",tool:x.tool||"katana",injury:x.inj,pose:"fight"})+
      person(206,GY,1.3,{robe:"#3a2f42",hat:"none",tool:"katana",injury:0,pose:"fight",flip:true}),
    nanban:(x)=> `<rect x="0" y="${HZ}" width="${W}" height="${H-HZ}" fill="${C.sea}"/>`+
      `<g transform="translate(210,150)"><path d="M-46 20 Q0 34 46 20 L36 30 Q0 38 -36 30 Z" fill="#4a3526"/>`+
      `<rect x="-30" y="-46" width="3" height="66" fill="${C.wood}"/><rect x="10" y="-40" width="3" height="60" fill="${C.wood}"/>`+
      `<rect x="-44" y="-40" width="30" height="24" fill="${C.paper}" opacity="0.9"/><rect x="-4" y="-34" width="28" height="22" fill="${C.paper}" opacity="0.9"/>`+
      `<path d="M-30 -46 l0 -6 8 3z" fill="${C.crimson}"/></g>`+
      person(70,GY,1.1,{robe:"#6b3f2a",hat:"none",tool:"gun",injury:0})+
      person(112,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    war_council:(x)=> `<rect x="150" y="64" width="150" height="7" fill="${C.crimson}"/>`+
      banner(160,GY,1.05)+banner(286,GY,0.95)+
      `<path d="M196 ${GY} L236 ${GY} L232 ${GY-30} L200 ${GY-30} Z" fill="${C.robeNoble}" stroke="${C.ink}" stroke-width="0.8"/>`+
      `<circle cx="216" cy="${GY-36} " r="5" fill="${C.skin}"/>`+
      `<path d="M232 ${GY-24} l14 -8" stroke="${C.gold}" stroke-width="2"/><rect x="244" y="${GY-36}" width="10" height="8" rx="2" fill="${C.ink}" stroke="${C.gold}" stroke-width="1"/>`+
      person(120,GY,1.15,{robe:robeFor(x.S),hat:"none",injury:x.inj,pose:"bow"}),
    vision:(x)=> `<g opacity="0.6" fill="none" stroke="${C.goldSoft}" stroke-width="1.6"><circle cx="188" cy="86" r="24"><animate attributeName="r" values="20;26;20" dur="3s" repeatCount="indefinite"/></circle><circle cx="188" cy="86" r="13"/></g>`+
      `<circle cx="188" cy="86" r="6" fill="${C.gold}" opacity="0.7"/>`+
      lantern(120,GY,1)+`<path d="M150 ${GY} q4 -20 0 -34" stroke="${C.paper}" stroke-width="1" opacity="0.4" fill="none"/>`+
      person(150,GY,1.15,{robe:robeFor(x.S),hat:"hood",injury:x.inj,pose:"bow"}),
    cave:(x)=> `<path d="M150 ${HZ} q-70 0 -80 ${H-HZ} L${W} ${H} L${W} ${HZ} Z" fill="#3a3242"/>`+
      `<path d="M150 ${GY} q-40 -60 -8 -78 q40 6 40 78 z" fill="#0c0d15"/>`+
      person(96,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj})+
      `<circle cx="112" cy="${GY-26}" r="5" fill="url(#scGlow)"/><path d="M110 ${GY-22} l3 -6" stroke="${C.flame2}" stroke-width="2"/>`,
    execution:(x)=> `<rect x="0" y="0" width="${W}" height="${H}" fill="#100c10" opacity="0.28"/>`+
      `<rect x="146" y="112" width="6" height="40" fill="${C.wood2}"/><rect x="132" y="112" width="34" height="5" fill="${C.wood2}"/>`+
      person(150,GY,1.15,{robe:robeFor(x.S),hat:"none",injury:Math.max(1,x.inj),pose:"bow"})+
      person(96,GY,1.05,{robe:C.robeWarrior,hat:"helmet",tool:"spear",injury:0})+
      person(210,GY,1.05,{robe:C.robeWarrior,hat:"helmet",tool:"spear",injury:0,flip:true}),
    fire:(x)=> `<g transform="translate(206,${GY})"><path d="M-34 0 L-34 -34 L0 -46 L34 -34 L34 0 Z" fill="${C.tentDoor}"/>`+
      `<g><animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;1.06 1.2;0.95 0.92;1 1" dur="0.6s" repeatCount="indefinite"/>`+
      `<path d="M-20 -20 Q-30 -40 -14 -52 Q-12 -40 -4 -48 Q-2 -34 -12 -20 Z" fill="${C.flame}"/>`+
      `<path d="M8 -18 Q0 -38 16 -50 Q16 -36 24 -46 Q26 -30 16 -18 Z" fill="${C.flame2}"/></g>`+
      `<ellipse cx="0" cy="-24" rx="40" ry="26" fill="url(#scGlow)"><animate attributeName="opacity" values="0.5;0.9;0.6" dur="1.3s" repeatCount="indefinite"/></ellipse></g>`+
      person(88,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj}),
    storm:(x)=> weatherFx("rain")+
      `<path d="M60 60 l-8 30 8 -6 -6 26" stroke="${C.goldSoft}" stroke-width="2" fill="none" opacity="0.8"/>`+
      `<path d="M28 ${HZ+4} q-6 -20 -18 -28 q14 2 22 12" fill="${C.pineDk}"/>`+
      person(140,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj,pose:"bow"}),
    // predicaments
    jail:(x)=> person(150,GY,1.2,{robe:robeFor(x.S),hat:"none",injury:Math.max(1,x.inj)})+ bars(),
    ransom:(x)=> campBase(false)+ person(150,GY,1.15,{robe:robeFor(x.S),hat:"none",injury:Math.max(1,x.inj),pose:"bow"})+
      person(210,GY,1.15,{robe:C.robeCrim,hat:"hood",tool:"katana",injury:0,flip:true})+
      `<path d="M140 ${GY-18} q10 -4 20 0" stroke="${C.paper}" stroke-width="1.2" fill="none"/>`,
    conscript:(x)=> banner(60,GY,1)+
      `<g stroke="${C.wood}" stroke-width="2">`+Array.from({length:5},(_,i)=>`<line x1="${180+i*22}" y1="${GY}" x2="${188+i*22}" y2="${GY-40}"/>`).join("")+`</g>`+
      `<g fill="${C.blade}">`+Array.from({length:5},(_,i)=>`<path d="M${188+i*22} ${GY-40} l3 -6 1 6z"/>`).join("")+`</g>`+
      person(110,GY,1.15,{robe:robeFor(x.S),hat:"none",tool:"spear",injury:x.inj}),
  };

  /* ---------------- camp ---------------------------------------------- */
  function campBase(withFuji){
    // returns just the ground-level camp furniture (used also by ransom)
    let s = pine(28, HZ+6, 1.05) + pine(272, HZ+8, 0.95);
    s += `<path d="M198 ${GY} L224 ${GY-42} L250 ${GY} Z" fill="${C.tent}" stroke="${C.tentDk}" stroke-width="1.4"/>`+
      `<path d="M224 ${GY-42} L250 ${GY} L236 ${GY} Z" fill="${C.tentDk}" opacity="0.35"/>`+
      `<path d="M214 ${GY} L224 ${GY-26} L234 ${GY} Z" fill="${C.tentDoor}"/>`;
    // campfire (animated)
    s += firePit(150, GY, 1.0);
    return s;
  }
  function camp(ctx){
    const S = ctx.S || {};
    let s = campBase(true);
    // clan banner + tent mon if you bear rank/crest
    const c = S.circles || [];
    const bears = c.includes("warrior")||c.includes("noble")|| (S.inventory||[]).some(i=>/crest|seal|token/i.test(i));
    if(bears){ s += banner(268, GY, 1.0);
      s += `<circle cx="224" cy="${GY-34}" r="4" fill="none" stroke="${C.gold}" stroke-width="1.1"/>`; }
    // drying rack with items
    const items = S.inventory || [];
    const x0=24, x1=104, top=HZ+2, base=GY;
    s += `<g stroke="${C.wood2}" stroke-width="1.8" stroke-linecap="round">`+
      `<line x1="${x0}" y1="${top}" x2="${x0}" y2="${base}"/><line x1="${x1}" y1="${top}" x2="${x1}" y2="${base}"/>`+
      `<line x1="${x0-4}" y1="${top}" x2="${x1+4}" y2="${top}" stroke="${C.wood}"/></g>`;
    const show = items.slice(0,4), size=17, gap=(x1-x0-show.length*size)/(show.length+1);
    show.forEach((name,i)=>{ const x=x0+gap*(i+1)+i*size;
      s += `<line x1="${x+size/2}" y1="${top}" x2="${x+size/2}" y2="${top+3}" stroke="${C.paper}" stroke-width="0.8"/>`;
      s += place(ART.item(name), x, top+3, size); });
    if(items.length>4) s += `<text x="${x1-2}" y="${top+13}" font-size="9" fill="${C.paper}" text-anchor="end" font-family="'Zen Kaku Gothic New',sans-serif" font-weight="700">+${items.length-4}</text>`;
    // companions by the fire
    const comps = S.companions || [];
    comps.slice(0,3).forEach((id,i)=> s += place(ART.comp(id), 120+i*22, GY-40, 20));
    if(comps.length>3) s += `<text x="${120+3*22}" y="${GY-26}" font-size="9" fill="${C.paper}" font-family="'Zen Kaku Gothic New',sans-serif" font-weight="700">+${comps.length-3}</text>`;
    // the traveller by the fire, holding their tool
    s += person(96, GY, 1.15, {robe:robeFor(S), hat:"kasa", tool:ctx.tool, injury:ctx.inj});
    return s;
  }

  function caption(text){
    return `<g><rect x="8" y="${H-17}" width="112" height="14" rx="1" fill="${C.crimson}" stroke="${C.ink}" stroke-width="1"/>`+
      `<text x="64" y="${H-6}" font-size="9" fill="${C.paper}" text-anchor="middle" font-family="'Yuji Syuku','Shippori Mincho',serif">${text}</text></g>`;
  }
  function frameOverlay(){
    const cn=(cx,cy)=>`<rect x="${cx-2.5}" y="${cy-2.5}" width="5" height="5" fill="${C.crimson}" transform="rotate(45 ${cx} ${cy})"/>`;
    return `<rect x="2.5" y="2.5" width="${W-5}" height="${H-5}" fill="none" stroke="${C.ink}" stroke-width="2"/>`+
      cn(3,3)+cn(W-3,3)+cn(3,H-3)+cn(W-3,H-3);
  }
  function place(svgStr,x,y,size){ return svgStr.replace("<svg ", `<svg x="${x}" y="${y}" width="${size}" height="${size}" `); }

  const CAP = {
    setting_out:"旅立ち　Setting Out", road:"道中　On the Road", camp:"野営　Camp",
    bandits:"山賊　Bandits", duel:"果し合い　Duel", shrine:"神社　Shrine", monk:"説法　Sermon",
    ghost:"怨霊　Restless Spirit", market:"市　Market", battlefield:"戦場　Battlefield",
    court:"御前　The Court", river:"渡し　The Ford", coast:"海辺　The Coast", beast:"獣　Beast",
    gamble:"賭場　Gambling", gate:"関所　Barrier Gate", festival:"祭　Festival",
    poison:"密約　Dark Bargain", wounded:"行き倒れ　The Fallen", mystic:"予兆　An Omen",
    tea:"茶の湯　The Tea Room", sumo:"相撲　The Bout", cavalry:"騎馬　Horsemen",
    plague:"疫病　The Fever Road", harbor:"湊　The Harbor", biwa:"平曲　The Minstrel",
    reckoning:"仇討ち　The Reckoning", nanban:"南蛮船　The Foreign Ship",
    war_council:"軍議　War Council", vision:"神託　The Summons", cave:"洞　The Cavern",
    execution:"仕置き　The Sentence", fire:"火事　Fire", storm:"嵐　The Storm",
    jail:"牢　The Cage", ransom:"人質　Held for Ransom", conscript:"徴募　The Levy",
  };

  /* ---------------- classifier ----------------------------------------- */
  function classify(enc){
    if(enc && enc.art) return enc.art;
    const hay = ((enc&&enc.id||"")+" "+(enc&&enc.title||"")+" "+((enc&&enc.scene&&enc.scene.text)||"")).toLowerCase();
    const m = [
      [/tea[ -]?room|tea[ -]?ceremony|chaj|whisk|bowl of froth/,"tea"],
      [/sumo|rikishi|wrestl|dohyo|the ring/,"sumo"],
      [/horse|cavalr|rider|lance|saddle|mounted/,"cavalry"],
      [/plague|fever|sick village|pox|pestilence|physician/,"plague"],
      [/harbor|harbour|junk|wreck|tide|grounded/,"harbor"],
      [/biwa|minstrel|lute|lament|the fallen \(house/,"biwa"],
      [/reckoning|vendetta|old enemy|vengeance/,"reckoning"],
      [/nanban|matchlock|portug|foreign ship|teppo/,"nanban"],
      [/war[ -]?council|envoy|war[ -]?fan|the lord asks|his master gathers/,"war_council"],
      [/vision|summons in the smoke|omen at|prophe/,"vision"],
      [/cavern|cave|ravine|tunnel|passage under/,"cave"],
      [/execution|sentence|magistrate|branded|false charge|gallows/,"execution"],
      [/on fire|burning|conflagration|the city burns/,"fire"],
      [/storm|blizzard|typhoon|downpour|thunder/,"storm"],
      [/bandit|brigand|nobushi|robber|ambush|thief|thieves/,"bandits"],
      [/duel|reckoning|vendetta|old enemy|challenge|rival|swords? cross/,"duel"],
      [/ghost|spirit|onry|haunt|restless|drowned|crows/,"ghost"],
      [/shrine|torii|pilgrim|purif|miko|kami|bless|sacred|temple gate/,"shrine"],
      [/monk|sermon|sutra|abbot|preach|temple|pray|buddhi/,"monk"],
      [/market|merchant|trade|caravan|storehouse|gold|coin|toll|profit|price|ledger/,"market"],
      [/war[ -]?council|army|siege|banner|lord|daimy|envoy|oath|pledge|clan|castle/,"court"],
      [/river|ford|bridge|boat|drown|water|stream/,"river"],
      [/coast|sea|shore|fisher|tide|harbor|harbour|ship|salvage/,"coast"],
      [/wolf|boar|beast|bear|tiger|tanuki|hunt/,"beast"],
      [/gamble|dice|bet|wager|drink|contest|festival|poem|dance|actor/,"gamble"],
      [/gate|barrier|sekisho|checkpoint|papers|inspect|press[ -]?gang|recruit|muster/,"gate"],
      [/poison|assassin|contract|shadow|kill|kunoichi|quiet commission/,"poison"],
      [/wounded|fallen|dying|beggar|starv|sick|corpse|body/,"wounded"],
      [/omen|dream|vision|hermit|fox|tengu|prophe|stars|fate/,"mystic"],
      [/battle|slain|field after|killing/,"battlefield"],
      [/festival|lantern/,"festival"],
    ];
    for(const [re,tag] of m) if(re.test(hay)) return tag;
    return "road";
  }

  /* ---------------- render + API --------------------------------------- */
  function ctxFrom(){
    const S = st.S;
    const inj = injuryLevel();
    const tool = toolGlyphKey(S);
    const biome = biomeOf(S);
    return { S, inj, tool, biome };
  }
  function injuryLevel(){
    const f = st.minFrac;
    return f>0.66?0 : f>0.4?1 : f>0.15?2 : 3;
  }
  function render(){
    const el = document.getElementById("scene-svg");
    if(!el) return;
    el.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const S = st.S || {};
    const rest = st.mode==="camp";
    const biome = biomeOf(S);
    const time = timeOf(S, rest || st.mode==="fuji" ? (rest?true:false) : false);
    const weather = weatherOf(S, biome);
    const ctx = { S, inj:injuryLevel(), tool:toolGlyphKey(S), biome, time, weather };

    let s = backdrop(biome, rest?"night":time, weather);
    let cap;
    if(st.mode==="camp"){ s += camp(ctx); cap = CAP.camp; }
    else if(st.mode==="fuji"){ s += MOTIF.setting_out(ctx); cap = CAP.setting_out; }
    else { const fn = MOTIF[st.tag] || MOTIF.road; s += fn(ctx); cap = CAP[st.tag] || CAP.road; }
    s += caption(cap);
    s += frameOverlay();
    el.innerHTML = s;
  }

  function snapshot(S){
    st.S = S || null;
    if(S && S.maxhp){ st.minFrac = Math.min(st.minFrac, S.hp / S.maxhp); }
  }

  function reset(){ st = { mode:"fuji", tag:"setting_out", S:null, minFrac:1 }; render(); }
  function sync(S){ snapshot(S); if(!st.mode) st.mode="fuji"; render(); }
  function setCamp(S){ snapshot(S); st.mode="camp"; render(); }
  function setEncounter(enc, S){ snapshot(S); st.mode="encounter"; st.tag=classify(enc); render(); }
  function setMotif(tag, S){ snapshot(S); st.mode="encounter"; st.tag=tag; render(); }

  /* ---- ending art: a full framed scene for the run's final beat -------- */
  const ENDMOTIF = {
    death_hunted:"poison", death_wild:"storm", death_generic:"wounded",
    legend:"war_council", unify:"war_council", province_held:"court",
    revenge_done:"reckoning", pilgrimage_done:"shrine", satori:"vision",
    fortune_made:"market", duty_done:"court", peace_sealed:"tea",
    contract_kept:"poison", escape_done:"road", peoples_hero:"festival",
    survive_well:"camp", survive_hard:"cave", epilogue:"setting_out",
  };
  // bespoke, hand-composed final scenes — each returns {time,biome?,svg}
  const P = (x,by,sc,o)=>person(x,by,sc,o); // shorthand
  const ENDART = {
    satori:(x)=>({ time:"dawn", biome:"mountain", svg:
      ensoRing(214,64,26)+ bigMoon(214,64,7,C.gold)+ pine(40,HZ+6,1.1)+
      `<path d="M110 ${GY} q40 -6 80 0" stroke="${C.paper}" stroke-width="1" opacity="0.3" fill="none"/>`+
      P(150,GY,1.2,{robe:robeFor(x.S),hat:"none",injury:0,pose:"bow"}) }),
    unify:(x)=>({ time:"day", svg:
      banner(40,GY,1.15)+banner(84,GY,1.0)+banner(260,GY,1.0)+banner(288,GY,1.15)+
      dais(150,GY,44)+ P(150,GY-10,1.35,{robe:C.robeNoble,hat:"none",tool:null,injury:0})+
      `<g transform="translate(163,${GY-40})">${weapon("staff")}</g>`+
      P(96,GY,1.0,{robe:C.robeWarrior,hat:"helmet",injury:0,pose:"bow"})+
      P(204,GY,1.0,{robe:C.robeWarrior,hat:"helmet",injury:0,pose:"bow",flip:true}) }),
    legend:(x)=>({ time:"dusk", svg:
      stele(200,GY,1.5)+ crow(150,70)+crow(120,84)+
      P(96,GY,1.1,{robe:robeFor(x.S),hat:"kasa",injury:0,pose:"bow"}) }),
    province_held:(x)=>({ time:"day", svg:
      castle(196,HZ+2,1.2)+ banner(120,GY,1.15)+
      P(96,GY,1.15,{robe:robeFor(x.S),hat:"helmet",tool:x.tool||"katana",injury:x.inj}) }),
    revenge_done:(x)=>({ time:"dusk", weather:"rain", svg:
      lantern(56,GY,1.1)+ P(206,GY,1.05,{robe:"#3a2f42",injury:0,pose:"fallen"})+
      P(120,GY,1.25,{robe:robeFor(x.S),hat:"none",tool:x.tool||"katana",injury:Math.max(1,x.inj),pose:"bow"}) }),
    pilgrimage_done:(x)=>({ time:"dawn", biome:"shrine", svg:
      torii(150,GY,1.7)+ lantern(96,GY,1.1)+lantern(204,GY,1.1)+
      `<rect x="120" y="${GY}" width="60" height="4" fill="${C.groundDk}"/>`+
      P(150,GY,1.2,{robe:C.robeRelig,hat:"none",injury:0,pose:"bow"}) }),
    fortune_made:(x)=>({ time:"day", svg:
      `<rect x="176" y="${GY-16}" width="18" height="16" fill="${C.wood}" stroke="${C.wood2}" stroke-width="1.2"/>`+
      `<rect x="196" y="${GY-22}" width="20" height="22" fill="${C.wood}" stroke="${C.wood2}" stroke-width="1.2"/>`+
      `<path d="M176 ${GY-16}h18M196 ${GY-22}h20" stroke="${C.wood2}"/>`+
      coinPile(150,GY-4)+ horse(232,GY,1.0)+
      P(96,GY,1.2,{robe:C.robeMerch,hat:"none",injury:x.inj}) }),
    duty_done:(x)=>({ time:"day", svg:
      `<rect x="150" y="66" width="150" height="7" fill="${C.crimson}"/>`+
      `<g stroke="${C.paper}" stroke-width="6" opacity="0.85"><line x1="180" y1="73" x2="180" y2="120"/><line x1="220" y1="73" x2="220" y2="120"/><line x1="260" y1="73" x2="260" y2="120"/></g>`+
      banner(286,GY,1.0)+ P(210,GY,1.05,{robe:C.robeNoble,hat:"none",injury:0,pose:"sit"})+
      P(120,GY,1.15,{robe:robeFor(x.S),hat:"helmet",tool:x.tool||"katana",injury:x.inj}) }),
    peace_sealed:(x)=>({ time:"day", svg:
      banner(50,GY,1.1)+banner(250,GY,1.1)+ pine(150,HZ+6,1.0)+
      P(112,GY,1.15,{robe:C.robeWarrior,hat:"none",injury:0})+
      P(188,GY,1.15,{robe:C.robeNoble,hat:"none",injury:0,flip:true})+
      `<path d="M126 ${GY-20} h48" stroke="${C.gold}" stroke-width="2"/>` }),
    contract_kept:(x)=>({ time:"night", svg:
      `<rect x="0" y="0" width="${W}" height="${H}" fill="#0a0c16" opacity="0.4"/>`+ lantern(70,GY,1.1)+
      P(112,GY,1.15,{robe:"#1c1c26",hat:"hood",injury:0})+
      P(196,GY,1.15,{robe:robeFor(x.S),hat:"hood",tool:x.tool,injury:x.inj,flip:true})+
      `<circle cx="150" cy="${GY-18}" r="4" fill="${C.gold}"/>` }),
    escape_done:(x)=>({ time:"dawn", biome:"river", svg:
      bridge()+ P(196,168,1.1,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj,flip:true}) }),
    peoples_hero:(x)=>({ time:"day", svg:
      `<g>`+Array.from({length:6},(_,i)=>`<line x1="${24+i*50}" y1="70" x2="${49+i*50}" y2="60" stroke="${C.wood2}" stroke-width="0.8"/><circle cx="${36+i*50}" cy="72" r="5" fill="${i%2?C.crimson:C.lantern}"/>`).join("")+`</g>`+
      crowd(80,GY,3)+crowd(224,GY,3)+
      P(150,GY,1.3,{robe:robeFor(x.S),hat:"none",tool:x.tool,injury:x.inj,pose:"fight"}) }),
    survive_well:(x)=>({ time:"dusk", svg:
      pine(40,HZ+6,1.1)+pine(266,HZ+8,0.95)+
      `<path d="M198 ${GY} L224 ${GY-42} L250 ${GY} Z" fill="${C.tent}" stroke="${C.tentDk}" stroke-width="1.4"/>`+
      firePit(180,GY,1.0)+ P(120,GY,1.15,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:x.inj,pose:"sit"}) }),
    survive_hard:(x)=>({ time:"dusk", weather:"rain", svg:
      `<path d="M28 ${HZ+4} q-6 -20 -18 -28 q14 2 22 12" fill="${C.pineDk}"/>`+ crow(210,80)+
      P(150,GY,1.2,{robe:robeFor(x.S),hat:"kasa",tool:x.tool,injury:3,pose:"bow"}) }),
    death_generic:(x)=>({ time:"dusk", svg:
      grave(150,GY,1.2)+ `<path d="M138 ${GY-40} q12 -6 24 0 q0 4 -12 4 q-12 0 -12 -4z" fill="${C.straw}" stroke="${C.wood2}" stroke-width="0.8"/>`+
      crow(110,78)+crow(200,70) }),
    death_wild:(x)=>({ time:"night", biome:"mountain", weather:"snow", svg:
      skull(150,168,1.5)+ `<g stroke="#d9dbe4" stroke-width="2" opacity="0.8"><path d="M132 182 q18 -8 36 0"/><path d="M136 188 q14 -6 28 0"/></g>` }),
    death_hunted:(x)=>({ time:"night", svg:
      `<rect x="0" y="0" width="${W}" height="${H}" fill="#080a14" opacity="0.5"/>`+ lantern(60,GY,1.1)+
      P(140,GY,1.1,{robe:robeFor(x.S),injury:0,pose:"fallen"})+
      P(210,GY,1.15,{robe:"#14141c",hat:"hood",tool:"katana",injury:0,flip:true}) }),
  };

  // returns a standalone SVG string (its own <svg>) sized 300x210
  function endingArt(end, S){
    snapshot(S);
    const ctx = { S, inj:injuryLevel(), tool:toolGlyphKey(S), biome:biomeOf(S), time:"day", weather:"clear" };
    const bespoke = end && ENDART[end.id] ? ENDART[end.id](ctx) : null;
    let biome = (bespoke && bespoke.biome) || biomeOf(S);
    let time = (bespoke && bespoke.time) || (end && end.tone==="bad" ? "dusk" : "day");
    let weather = (bespoke && bespoke.weather) || "clear";
    let s = backdrop(biome, time, weather);
    if(bespoke){ s += bespoke.svg; }
    else {
      const tag = (end && ENDMOTIF[end.id]) || "road";
      if(tag==="camp") s += camp(ctx); else s += (MOTIF[tag]||MOTIF.road)(ctx);
    }
    s += frameOverlay();
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" `+
      `style="width:100%;height:auto;display:block">${s}</svg>`;
  }

  return { reset, sync, setCamp, setEncounter, setMotif, endingArt, render };
})();
