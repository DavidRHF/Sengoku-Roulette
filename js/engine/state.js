/* ============================================================================
 *  state.js — the run's memory
 * ========================================================================== */
window.STATE = (function () {
  const clamp = RNG.clamp;
  const TIER_LUCK = { cursed: -2, poor: -1, plain: 0, fortunate: 1, exalted: 2 };
  const LOOT_RE = /purse|spoils|winnings|profit|cargo|coin|takings|gifts|provisions|salvage/i;

  let S = null;

  function fresh() {
    S = {
      phase: "title",
      status: null, tool: null, intro: null, quest: null,
      hp: 20, maxhp: 20, str: 0, wis: 0, cha: 0, luck: 0,
      circles: [],
      loc: "outskirts",
      flags: {},
      inventory: [],
      companions: [],   // array of companion ids
      steps: 0,
      sinceRest: 0,
      usedOnce: {},
      log: [],
      ended: null,
      pendingLoc: null,
      lastEnc: null,     // id of the previous encounter (no repeats back-to-back)
      pendingPredicament: null, // a failed roll may drop you into a jail / capture
      predDays: 0,
    };
    return S;
  }

  function get() { return S; }

  /* ---- Apply status + tool to derive starting stats -------------------- */
  function applyStatus(st) {
    S.status = st;
    S.circles = st.circles.slice();
    S.loc = st.startLoc || "outskirts";
    S.hp = st.hp; S.maxhp = st.hp;
    S.str = st.str; S.wis = st.wis; S.cha = st.cha;
    S.luck = st.luck || 0;
    if (st.startItems) for (const it of st.startItems) S.inventory.push(it);
    if (st.startComp) addCompanion(st.startComp, true);
  }

  function applyTool(tl) {
    S.tool = tl;
    S.str = clamp(S.str + (tl.str || 0), 0, 20);
    S.wis = clamp(S.wis + (tl.wis || 0), 0, 20);
    S.cha = clamp(S.cha + (tl.cha || 0), 0, 20);
    S.maxhp = clamp(S.maxhp + (tl.hp || 0), 15, 50);
    S.hp = S.maxhp;
    S.luck += (TIER_LUCK[tl.tier] || 0);
  }

  /* ---- Companion aggregation ------------------------------------------- */
  function compMod(stat) {
    let m = 0;
    for (const id of S.companions) {
      const c = DATA.companions[id];
      if (c && c.mods && c.mods[stat]) m += c.mods[stat];
    }
    return m;
  }
  function compLuck() {
    let m = 0;
    for (const id of S.companions) {
      const c = DATA.companions[id];
      if (c && c.luck) m += c.luck;
    }
    return m;
  }
  function effStat(stat) {
    if (!stat) return null;
    return clamp((S[stat] || 0) + compMod(stat), 0, 30);
  }
  function totalLuck() { return S.luck + compLuck(); }

  function addCompanion(id, silent) {
    if (!id || S.companions.includes(id) || !DATA.companions[id]) return null;
    S.companions.push(id);
    if (!silent) return DATA.companions[id].name;
    return null;
  }
  function removeCompanion() {
    if (!S.companions.length) return null;
    const id = S.companions.shift();
    return DATA.companions[id] ? DATA.companions[id].name : null;
  }

  function hasItem(name) { return S.inventory.includes(name); }
  function consumeItem(name) {
    const i = S.inventory.indexOf(name);
    if (i >= 0) { S.inventory.splice(i, 1); return name; }
    return null;
  }

  /* ---- Apply a scene/option effect object ------------------------------ */
  function applyEffects(eff) {
    const notes = [];
    if (!eff) return notes;
    if (eff.hp) { S.hp = clamp(S.hp + eff.hp, 0, S.maxhp);
      notes.push({ t: eff.hp > 0 ? "heal" : "hurt", v: eff.hp }); }
    if (eff.maxhp) { S.maxhp = clamp(S.maxhp + eff.maxhp, 15, 60);
      S.hp = clamp(S.hp + eff.maxhp, 0, S.maxhp);
      notes.push({ t: "maxhp", v: eff.maxhp }); }
    if (eff.item) { S.inventory.push(eff.item); notes.push({ t: "item", v: eff.item }); }
    if (eff.consume) { const n = consumeItem(eff.consume); if (n) notes.push({ t: "consume", v: n }); }
    if (eff.comp) { const n = addCompanion(eff.comp); if (n) notes.push({ t: "comp", v: n }); }
    if (eff.rmComp) { const n = removeCompanion(); if (n) notes.push({ t: "rmcomp", v: n }); }
    if (eff.flag) S.flags[eff.flag] = true;
    if (eff.rmFlag) delete S.flags[eff.rmFlag];
    if (eff.quest && eff.quest !== S.quest) {
      const old = S.quest; S.quest = eff.quest;
      notes.push({ t: "quest", v: eff.quest, old });
    }
    if (eff.loc) S.pendingLoc = eff.loc;
    if (eff.predicament) { S.pendingPredicament = eff.predicament;
      notes.push({ t: "predicament", v: eff.predicament }); }
    if (eff.ending) S.forceEnding = eff.ending;
    return notes;
  }

  /* ---- Eligibility for encounters / rests ------------------------------ */
  function locMatch(list) {
    if (!list) return true;
    const type = DATA.locations[S.loc].type;
    return list.includes("any") || list.includes(S.loc) || list.includes(type);
  }
  function circleMatch(list) {
    if (!list || list.includes("any")) return true;
    return list.some(c => S.circles.includes(c));
  }
  function eligible(entry) {
    if (entry.loc && !locMatch(entry.loc)) return false;
    if (entry.circles && !circleMatch(entry.circles)) return false;
    if (entry.minStep && S.steps < entry.minStep) return false;
    if (entry.once && S.usedOnce[entry.id]) return false;
    if (entry.requiresFlag && !S.flags[entry.requiresFlag]) return false;
    if (entry.forbidFlag && S.flags[entry.forbidFlag]) return false;
    if (entry.requiresItem && !S.inventory.includes(entry.requiresItem)) return false;
    if (entry.requiresQuest) {
      const q = [].concat(entry.requiresQuest);
      if (!q.includes(S.quest)) return false;
    }
    if (entry.requiresStatus) {
      const r = [].concat(entry.requiresStatus);
      if (!S.status || !r.includes(S.status.id)) return false;
    }
    return true;
  }
  function eligibleEncounters(excludeId) {
    let list = DATA.encounters.filter(eligible);
    // no encounter twice in a row (unless a rest broke the streak)
    if (excludeId) { const f = list.filter(e => e.id !== excludeId); if (f.length) list = f; }
    return list.length ? list : DATA.encounters.filter(e => (e.circles || ["any"]).includes("any"));
  }
  function eligibleRests() {
    const list = DATA.rests.filter(eligible);
    return list.length ? list : DATA.rests.filter(r => (r.loc || ["any"]).includes("any"));
  }

  /* ---- Intro pool for a status (guarantees ≥10 options) ---------------- */
  function eligibleIntros(st) {
    const matches = i =>
      i.for.includes("any") ||
      i.for.includes(st.id) ||
      i.for.some(c => st.circles.includes(c));
    let list = DATA.storyIntros.filter(matches);
    // top up with universals if somehow short
    if (list.length < 10) {
      const uni = DATA.storyIntros.filter(i => i.for.includes("any"));
      for (const u of uni) if (!list.includes(u)) list.push(u);
    }
    return list;
  }

  /* ---- Ending evaluation ----------------------------------------------- */
  function snapshot() {
    const loot = S.inventory.filter(n => LOOT_RE.test(n)).length;
    return {
      statusId: S.status ? S.status.id : "",
      quest: S.quest,
      circles: S.circles,
      hp: S.hp, maxhp: S.maxhp, steps: S.steps,
      str: S.str, wis: S.wis, cha: S.cha,
      has: f => !!S.flags[f],
      hasComp: id => S.companions.includes(id),
      hasItem: n => S.inventory.includes(n),
      compCount: S.companions.length,
      itemCount: S.inventory.length,
      loot,
      locType: DATA.locations[S.loc].type,
    };
  }
  function checkEndings() {
    if (S.forceEnding) {
      const e = DATA.endings.find(x => x.id === S.forceEnding);
      if (e) { S.ended = e; return e; }
    }
    const snap = snapshot();
    const sorted = DATA.endings.slice().sort((a, b) => b.priority - a.priority);
    for (const e of sorted) {
      try { if (e.check(snap)) { S.ended = e; return e; } } catch (_) {}
    }
    return null;
  }

  /* ---- Save / Load (works on GitHub Pages; may be limited on file://) --- */
  function save() {
    try {
      const data = {
        v: 1, phase: S.phase,
        statusId: S.status && S.status.id, toolId: S.tool && S.tool.id,
        introId: S.intro && S.intro.id, quest: S.quest,
        hp: S.hp, maxhp: S.maxhp, str: S.str, wis: S.wis, cha: S.cha, luck: S.luck,
        circles: S.circles, loc: S.loc, flags: S.flags,
        inventory: S.inventory, companions: S.companions,
        steps: S.steps, sinceRest: S.sinceRest, usedOnce: S.usedOnce, log: S.log,
        lastEnc: S.lastEnc,
      };
      localStorage.setItem("sengoku_save", JSON.stringify(data));
      return true;
    } catch (e) { return false; }
  }
  function hasSave() {
    try { return !!localStorage.getItem("sengoku_save"); } catch (e) { return false; }
  }
  function load() {
    try {
      const raw = localStorage.getItem("sengoku_save");
      if (!raw) return false;
      const d = JSON.parse(raw);
      fresh();
      S.phase = d.phase; S.quest = d.quest;
      S.status = DATA.statuses.find(x => x.id === d.statusId) || null;
      S.tool = DATA.tools.find(x => x.id === d.toolId) || null;
      S.intro = DATA.storyIntros.find(x => x.id === d.introId) || null;
      Object.assign(S, {
        hp: d.hp, maxhp: d.maxhp, str: d.str, wis: d.wis, cha: d.cha, luck: d.luck,
        circles: d.circles || [], loc: d.loc || "outskirts", flags: d.flags || {},
        inventory: d.inventory || [], companions: d.companions || [],
        steps: d.steps || 0, sinceRest: d.sinceRest || 0, usedOnce: d.usedOnce || {},
        log: d.log || [], lastEnc: d.lastEnc || null,
      });
      return true;
    } catch (e) { return false; }
  }

  return {
    fresh, get, applyStatus, applyTool, applyEffects,
    effStat, totalLuck, compMod, addCompanion, hasItem, consumeItem,
    eligibleEncounters, eligibleRests, eligibleIntros,
    checkEndings, save, load, hasSave,
  };
})();
