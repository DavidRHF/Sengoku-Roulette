/* ============================================================================
 *  game.js — the conductor
 *  --------------------------------------------------------------------------
 *  Phases:  status spin → tool spin → story spin → journey loop → ending
 *  Journey loop:  encounter, encounter, REST, repeat  (as the brief specifies)
 * ========================================================================== */
window.GAME = (function () {

  /* ---- spin / continue gating ----------------------------------------- */
  function pendingSpin(segments, winnerIndex, resolve) {
    // order the wheel from the slimmest chance to the widest (clockwise from
    // the pointer), so the odds read at a glance.
    const winner = segments[winnerIndex];
    const ordered = segments.slice().sort((a, b) => (a.weight || 1) - (b.weight || 1));
    const widx = ordered.indexOf(winner);
    WHEEL.render(ordered);
    UI.showAction();
    UI.setAction("◈ Spin the Wheel", () => {
      UI.setAction("Spinning…", () => {}, false);
      UI.sfx.spin();
      WHEEL.spinTo(widx, () => resolve(ordered[widx].item, widx));
    });
  }
  function pendingContinue(label, fn) {
    UI.showAction();
    UI.setAction(label, fn);
  }
  function oddsHint(stat, eff, opts) {
    const S = STATE.get();
    let s = "";
    if (stat) {
      const base = S[stat], bonus = STATE.compMod(stat);
      const name = { str: "Strength", wis: "Wisdom", cha: "Charisma" }[stat];
      s = `${name} check — your ${stat.toUpperCase()} ${base}`;
      if (bonus) s += ` (${bonus > 0 ? "+" : ""}${bonus} allies)`;
      const tot = eff == null ? base : eff;
      s += tot >= 15 ? " · the odds favor you" : tot <= 6 ? " · the odds are against you" : " · an even test";
    } else {
      s = "A turn of fortune";
    }
    const luck = STATE.totalLuck();
    if (luck) s += ` · fortune ${luck > 0 ? "smiles" : "frowns"}`;
    // surface item influence so the player understands the wheel
    const boosted = opts && opts.find(o => o.boostItem && STATE.hasItem(o.boostItem));
    if (boosted) s += ` · your ${boosted.boostItem} widens “${boosted.label}”`;
    const unlocked = opts && opts.find(o => o.needItem && STATE.hasItem(o.needItem));
    if (unlocked) s += ` · your ${unlocked.needItem} opens “${unlocked.label}”`;
    const paid = opts && opts.find(o => o.costCoin || o.needCoin);
    if (paid) s += ` · coin can buy “${paid.label}”`;
    const rich = opts && opts.find(o => o.coinBoost && STATE.get().coin >= o.coinBoost.min);
    if (rich) s += ` · your purse widens “${rich.label}”`;
    return s;
  }

  /* ---- 1. NEW GAME (modes) --------------------------------------------- */
  function newGameBase() {
    STATE.fresh();
    document.getElementById("journal").innerHTML = "";
    if (window.SCENE) SCENE.reset();
    UI.renderSheet();
    UI.log("戦国の輪 — Wheel of the Warring States", "header");
  }

  // (A) Normal adventure — the wheels decide everything, as ever
  function newGame() { startNormal(); }
  function startNormal() {
    newGameBase();
    UI.log("The realm is shattered into warring provinces. Before your road begins, the wheel decides who you are.", "story");
    beginStatusSpin();
  }

  // (D) Randomized stats — created normally, but the gifts are scrambled
  function startRandomStats() {
    newGameBase();
    STATE.get().randomStats = true;
    UI.log("You cast your lot to the winds — your very gifts will be left to chance.", "story");
    beginStatusSpin();
  }

  // (C) Random Conditions — a boon or bane spun before the creation wheels
  function startRandomConditions() {
    newGameBase();
    UI.log("Before the wheel names you, fate presses a gift — or a curse — into your hands.", "story");
    beginConditionSpin();
  }
  function beginConditionSpin() {
    STATE.get().phase = "condition";
    const wheel = (DATA.conditionWheel || []).map(id => ({ id, def: DATA.conditions[id] })).filter(x => x.def);
    const segs = wheel.map(x => ({
      label: x.def.name, item: x,
      weight: x.def.kind === "neutral" ? 3 : 4,
      valence: x.def.kind === "good" ? "good" : x.def.kind === "bad" ? "bad" : "neutral",
    }));
    const widx = Math.floor(Math.random() * segs.length);
    UI.setTitle("The kami weigh your fate…");
    UI.setSub("A boon or a bane to carry from the very first step — good, ill, or strange.");
    pendingSpin(segs, widx, (x) => {
      const d = STATE.applyCondition(x.id);
      UI.log(`You begin ${d.name}: ${d.desc}`, d.kind === "good" ? "good" : d.kind === "bad" ? "bad" : "story");
      UI.renderSheet();
      pendingContinue("Now — who are you? ▸", beginStatusSpin);
    });
  }

  // (B) Status scenario — a preset station, tool and quest, wheels skipped
  function startScenario(id) {
    const sc = (DATA.scenarios || []).find(s => s.id === id);
    if (!sc) { startNormal(); return; }
    newGameBase();
    const st = DATA.statuses.find(s => s.id === sc.statusId);
    const tl = DATA.tools.find(t => t.id === sc.toolId);
    STATE.applyStatus(st);
    if (tl) STATE.applyTool(tl);
    const S = STATE.get();
    S.quest = sc.quest; S.intro = null;
    UI.log(`Scenario — ${sc.name}.`, "header");
    UI.log(`${st.name}, ${tl ? tl.name : "bare-handed"}, sworn to the road of ${UI.questLabel(sc.quest)}. ${sc.desc}`, "story");
    if (S.inventory.length) UI.log(`You carry: ${S.inventory.join(", ")}.`, "gain");
    S.phase = "journey";
    UI.renderSheet();
    if (window.SCENE) SCENE.setMotif("setting_out", S);
    pendingContinue("Set out ▸", journeyTurn);
  }

  function beginStatusSpin() {
    STATE.get().phase = "status";
    const { segments, winnerIndex } = RNG.creationSpin(DATA.statuses, DATA.statuses.length);
    segments.forEach(s => { s.weight = s.item.rarity; });
    UI.setTitle("What is your station in life?");
    UI.setSub("The lowly are common; the mighty, rare — see how the slices differ.");
    pendingSpin(segments, winnerIndex, (st) => {
      STATE.applyStatus(st);
      UI.log(`Your station: ${st.name}. ${st.blurb}`, tierKind(st.tier));
      const S = STATE.get();
      if (S.inventory.length) UI.log(`You carry: ${S.inventory.join(", ")}.`, "gain");
      UI.renderSheet();
      if (window.SCENE) SCENE.setCamp(S);
      pendingContinue("Take up your tools ▸", beginToolSpin);
    });
  }

  function beginToolSpin() {
    STATE.get().phase = "tool";
    const { segments, winnerIndex } = RNG.creationSpin(DATA.tools, DATA.tools.length);
    segments.forEach(s => { s.weight = s.item.rarity; });
    UI.setTitle("What do you carry?");
    UI.setSub("A weapon, a tool, or nothing at all.");
    pendingSpin(segments, winnerIndex, (tl) => {
      STATE.applyTool(tl);
      const S = STATE.get();
      UI.log(`In hand: ${tl.name}. ${tl.blurb}`, tierKind(tl.tier));
      UI.log(`You set out with ${S.hp} health, ${S.str} strength, ${S.wis} wisdom, ${S.cha} charisma.`, "gain");
      UI.renderSheet();
      if (window.SCENE) SCENE.setCamp(S);
      pendingContinue("How does your road begin? ▸", beginStorySpin);
    });
  }

  function beginStorySpin() {
    STATE.get().phase = "story";
    const S = STATE.get();
    const intros = RNG.sample(STATE.eligibleIntros(S.status), 6);
    const winner = intros[Math.floor(Math.random() * intros.length)];
    const winnerIndex = intros.indexOf(winner);
    const segments = intros.map(i => ({ label: UI.questLabel(i.quest), item: i }));
    UI.setTitle("How does your road begin?");
    UI.setSub("The kami spin the thread of your fate.");
    pendingSpin(segments, winnerIndex, (intro) => {
      S.intro = intro; S.quest = intro.quest;
      UI.log("Your road begins: " + intro.text, "story");
      if (S.randomStats) {
        STATE.randomizeStats();
        const S2 = STATE.get();
        UI.log(`Fate scrambles your gifts — you set out with ${S2.hp} health, ${S2.coin} mon, ${S2.str} strength, ${S2.wis} wisdom, ${S2.cha} charisma.`, "gain");
      }
      S.phase = "journey";
      UI.renderSheet();
      if (window.SCENE) SCENE.setMotif("setting_out", S);
      pendingContinue("Set out ▸", journeyTurn);
    });
  }

  /* ---- 2. JOURNEY LOOP ------------------------------------------------- */
  function journeyTurn() {
    const S = STATE.get();
    if (S.ended) return;
    UI.renderSheet();
    const isRest = S.sinceRest >= 2;
    // an encounter can't repeat back-to-back (a rest resets the streak)
    const pool = isRest ? STATE.eligibleRests() : STATE.eligibleEncounters(S.lastEnc);
    const cands = RNG.sample(pool, 6);
    const winner = RNG.weightedPick(cands);
    const widx = cands.indexOf(winner);
    const segs = cands.map(c => ({ label: c.title, item: c, weight: c.weight || 5 }));
    UI.setTitle(isRest ? "Night falls. Where do you rest?" : "The road unwinds ahead…");
    UI.setSub(DATA.locations[S.loc].name + " — " + DATA.locations[S.loc].blurb);
    pendingSpin(segs, widx, (enc) => {
      S.lastEnc = isRest ? null : enc.id;   // remember for the no-repeat rule
      runScene(enc, enc.scene, isRest);
    });
  }

  // build the option set for any spin: hides item-gated options you can't use,
  // applies item bias, computes true weights, picks the winner.
  function buildSpin(spin) {
    const S = STATE.get();
    const myCircles = S.circles || [];
    const myId = S.status && S.status.id;
    const stat = spin.stat;
    const eff = STATE.effStat(stat);
    const luck = STATE.totalLuck();
    let opts = spin.options.filter(o => {
      if (o.needItem && !STATE.hasItem(o.needItem)) return false;
      // can't afford it → the option isn't on the wheel at all
      if (o.needCoin && S.coin < o.needCoin) return false;
      if (o.costCoin && S.coin < o.costCoin) return false;
      // station-appropriate choices: only some stations get some options
      if (o.circles && !o.circles.some(c => myCircles.includes(c))) return false;
      if (o.forbidCircles && o.forbidCircles.some(c => myCircles.includes(c))) return false;
      if (o.requiresStatus && ![].concat(o.requiresStatus).includes(myId)) return false;
      return true;
    });
    if (opts.length < 1) opts = spin.options;
    const bias = opts.map(o => {
      let m = 1;
      if (o.boostItem && STATE.hasItem(o.boostItem)) m *= (o.boostAmt || 2.6);
      if (o.dampItem && STATE.hasItem(o.dampItem)) m *= (o.dampAmt || 0.4);
      // a full purse fattens bribes, purchases, and other coin-swayed options
      if (o.coinBoost && S.coin >= o.coinBoost.min) m *= (o.coinBoost.amt || 2.2);
      // your station makes some choices come more naturally
      if (o.boostCircles && o.boostCircles.circles.some(c => myCircles.includes(c))) m *= (o.boostCircles.amt || 2.2);
      return m;
    });
    const weights = RNG.optionWeights(opts, stat, eff == null ? 0 : eff, luck, bias);
    const widx = RNG.weightedIndex(weights);
    const segs = opts.map((o, i) => ({ label: o.label, item: o, valence: o.valence, weight: weights[i] }));
    return { stat, eff, opts, segs, widx };
  }

  function runScene(enc, scene, isRest) {
    const S = STATE.get();
    if (enc.once) S.usedOnce[enc.id] = true;
    UI.setTitle(enc.title);
    UI.setSub(DATA.locations[S.loc].name);
    UI.log("— " + enc.title + " —", "header");
    UI.log(scene.text, "story");
    if (window.SCENE) { if (isRest) SCENE.setCamp(S); else SCENE.setEncounter(enc, S); }

    if (scene.spin) {
      const sp = buildSpin(scene.spin);
      UI.setTitle(scene.spin.prompt || enc.title);
      UI.setSub(oddsHint(sp.stat, sp.eff, sp.opts));
      pendingSpin(sp.segs, sp.widx, (opt) => {
        UI.log(opt.text, opt.valence === "good" ? "good" : opt.valence === "bad" ? "bad" : "story");
        const notes = STATE.applyEffects(opt);
        UI.logNotes(notes);
        UI.renderSheet();
        // a gained item / companion pulls the picture back to camp to reveal it
        if (window.SCENE && !isRest && notes.some(n => n.t === "item" || n.t === "comp"))
          SCENE.setCamp(STATE.get());
        if (STATE.get().hp <= 0 || STATE.get().forceEnding) { finishBeat(isRest, enc); return; }
        if (STATE.get().pendingPredicament) { enterPredicament(isRest, enc); return; }
        if (opt.goto && enc.sub && enc.sub[opt.goto]) {
          pendingContinue("Continue ▸", () => runScene(enc, enc.sub[opt.goto], isRest));
        } else {
          finishBeat(isRest, enc);
        }
      });
    } else {
      const notes = STATE.applyEffects(scene);
      UI.logNotes(notes);
      UI.renderSheet();
      if (window.SCENE && !isRest && notes.some(n => n.t === "item" || n.t === "comp"))
        SCENE.setCamp(STATE.get());
      if (STATE.get().pendingPredicament) { enterPredicament(isRest, enc); return; }
      finishBeat(isRest, enc);
    }
  }

  /* ---- PREDICAMENTS: what happens after a roll goes truly wrong -------- */
  function enterPredicament(isRest, enc) {
    const S = STATE.get();
    const kind = S.pendingPredicament;
    S.pendingPredicament = null;
    S.predDays = 0;
    const pred = DATA.predicaments[kind];
    if (!pred) { finishBeat(isRest, enc); return; }
    if (window.SCENE) SCENE.setMotif(kind, STATE.get());
    UI.log("═══ " + pred.title + " ═══", "header");
    pendingContinue("Face it ▸", () => runPredicament(pred, "entry", isRest, enc));
  }

  function runPredicament(pred, key, isRest, enc) {
    const S = STATE.get();
    const scene = pred.scenes[key];
    UI.setTitle(pred.title);
    UI.setSub(DATA.locations[S.loc].name + (scene.sub ? " — " + scene.sub : ""));
    UI.log(scene.text, "story");

    const exit = (opt) => {
      if (STATE.get().hp <= 0 || STATE.get().forceEnding) { finishBeat(isRest, enc); return; }
      if (opt && opt.escape) {
        if (opt.freeText) UI.log(opt.freeText, "good");
        finishBeat(isRest, enc); return;
      }
      if (opt && opt.goto && pred.scenes[opt.goto]) {
        pendingContinue("Continue ▸", () => runPredicament(pred, opt.goto, isRest, enc)); return;
      }
      // no explicit exit → another day, until the cap forces release
      S.predDays = (S.predDays || 0) + 1;
      if (S.predDays >= (pred.maxDays || 3)) {
        pendingContinue("Continue ▸", () => runPredicament(pred, pred.forced || "entry", isRest, enc));
      } else {
        pendingContinue("Another day passes ▸", () => runPredicament(pred, "entry", isRest, enc));
      }
    };

    if (scene.spin) {
      const sp = buildSpin(scene.spin);
      UI.setTitle(scene.spin.prompt || pred.title);
      UI.setSub(oddsHint(sp.stat, sp.eff, sp.opts));
      pendingSpin(sp.segs, sp.widx, (opt) => {
        UI.log(opt.text, opt.valence === "good" ? "good" : opt.valence === "bad" ? "bad" : "story");
        const notes = STATE.applyEffects(opt);
        UI.logNotes(notes);
        UI.renderSheet();
        exit(opt);
      });
    } else {
      const notes = STATE.applyEffects(scene);
      UI.logNotes(notes);
      UI.renderSheet();
      exit(scene);
    }
  }

  function finishBeat(isRest, enc) {
    const S = STATE.get();
    let moved = false;
    if (S.pendingLoc) { S.loc = S.pendingLoc; S.pendingLoc = null; moved = true; }
    S.steps++;
    if (isRest) S.sinceRest = 0; else S.sinceRest++;

    // lasting conditions take their toll (poison drain, regen, wearing-off)
    const cnotes = STATE.tickConditions();
    if (cnotes.length) UI.logNotes(cnotes);

    UI.renderSheet();

    // ending check first (death or achievement)
    const end = STATE.checkEndings();
    if (end) { showEnding(end); return; }

    // travel between locations to simulate crossing the land
    if (!moved) {
      const chance = isRest ? 0.6 : 0.22;
      if (Math.random() < chance) travel();
    }
    STATE.save();
    UI.renderSheet();

    UI.setTitle(isRest ? "Dawn breaks over the road." : "You press onward.");
    UI.setSub("Step " + S.steps + " · " + DATA.locations[S.loc].name);
    pendingContinue(isRest ? "Break camp ▸" : "Travel on ▸", journeyTurn);
  }

  function travel() {
    const S = STATE.get();
    const links = DATA.locations[S.loc].links || [];
    if (!links.length) return;
    const next = links[Math.floor(Math.random() * links.length)];
    if (next && next !== S.loc) {
      S.loc = next;
      UI.log("You journey on to " + DATA.locations[S.loc].name + ".", "travel");
    }
  }

  /* ---- 3. ENDING ------------------------------------------------------- */
  function showEnding(end) {
    const S = STATE.get();
    S.phase = "ending"; S.ended = end;
    STATE.markEndingSeen(end.id);
    const comps = S.companions.map(id => DATA.companions[id].name);
    // record this run as the best (fastest) for this ending, if it is
    STATE.recordRun(end.id, {
      steps: S.steps, status: S.status ? S.status.name : "—", tool: S.tool ? S.tool.name : "—",
      quest: UI.questLabel(S.quest), hp: Math.max(0, S.hp), maxhp: S.maxhp,
      str: S.str, wis: S.wis, cha: S.cha, coin: S.coin,
      comps: comps.slice(), items: S.inventory.slice(), tone: end.tone,
      when: Date.now(),
    });
    UI.log("═══ " + end.title + " ═══", "header");
    UI.log(end.text, end.tone === "bad" ? "bad" : (end.tone === "good" || end.tone === "great") ? "good" : "story");
    UI.renderSheet();
    UI.setTitle(end.title);
    UI.setSub("Your road has reached its end.");

    const compStr = comps.join(", ") || "—";
    const items = S.inventory.length ? S.inventory.join(", ") : "—";
    const artSvg = window.SCENE ? SCENE.endingArt(end, S) : "";
    // The <img> looks for a real illustration at assets/endings/<id>.(png|jpg|webp).
    // Until one is dropped in, it fails to load and the drawn placeholder shows.
    const imgTry =
      `<img class="ending-art-img" alt="" ` +
      `src="assets/endings/${end.id}.png" ` +
      `onload="this.classList.add('loaded')" ` +
      `onerror="var s='assets/endings/${end.id}.';` +
      `if(this.dataset.t==='png'){this.dataset.t='jpg';this.src=s+'jpg';}` +
      `else if(this.dataset.t==='jpg'){this.dataset.t='webp';this.src=s+'webp';}` +
      `else{this.remove();}" data-t="png">`;

    const body =
      `<p class="ending-desc ending-tone-${end.tone}">${end.text}</p>` +
      `<div class="ending-art">${artSvg}${imgTry}` +
        `<span class="ending-art-tag">illustration placeholder</span></div>` +
      `<div class="ending-stats">` +
        statRow("Station", S.status ? S.status.name : "—") +
        statRow("Carried", S.tool ? S.tool.name : "—") +
        statRow("Purpose", UI.questLabel(S.quest)) +
        statRow("Health", `${Math.max(0, S.hp)} / ${S.maxhp}`) +
        statRow("Strength · Wisdom · Charisma", `${S.str} · ${S.wis} · ${S.cha}`) +
        statRow("Coin", `${S.coin} mon`) +
        statRow("Companions", compStr) +
        statRow("Carrying", items) +
        statRow("Steps walked", String(S.steps)) +
        statRow("Fate", end.title) +
      `</div>`;
    UI.modal("The Wheel Comes to Rest", body, "Walk a new road", newGame, "modal-ending");
    UI.setAction("◈ New Journey", newGame);
    try { localStorage.removeItem("sengoku_save"); } catch (e) {}
  }
  function statRow(k, v) {
    return `<div class="ending-stat"><span class="ending-stat-k">${k}</span>` +
      `<span class="ending-stat-v">${v}</span></div>`;
  }

  /* ---- helpers --------------------------------------------------------- */
  function tierKind(t) {
    return t === "exalted" ? "good" : t === "fortunate" ? "gain"
      : t === "cursed" ? "bad" : "story";
  }

  /* ---- resume from save ------------------------------------------------ */
  function resume() {
    const S = STATE.get();
    UI.rebuildJournal();
    UI.renderSheet();
    if (window.SCENE) SCENE.setCamp(S);
    if (S.phase === "journey") {
      UI.setTitle("Your road continues.");
      UI.setSub("Step " + S.steps + " · " + DATA.locations[S.loc].name);
      pendingContinue("Travel on ▸", journeyTurn);
    } else {
      // mid-creation saves are rare; just restart cleanly
      newGame();
    }
  }

  return { newGame, resume, showEnding, startNormal, startScenario, startRandomConditions, startRandomStats };
})();
