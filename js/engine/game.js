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
    return s;
  }

  /* ---- 1. NEW GAME ----------------------------------------------------- */
  function newGame() {
    STATE.fresh();
    document.getElementById("journal").innerHTML = "";
    if (window.SCENE) SCENE.reset();
    UI.renderSheet();
    UI.log("戦国の輪 — Wheel of the Warring States", "header");
    UI.log("The realm is shattered into warring provinces. Before your road begins, the wheel decides who you are.", "story");
    beginStatusSpin();
  }

  function beginStatusSpin() {
    STATE.get().phase = "status";
    const { segments, winnerIndex } = RNG.creationSpin(DATA.statuses, 8);
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
    const { segments, winnerIndex } = RNG.creationSpin(DATA.tools, 8);
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
    const stat = spin.stat;
    const eff = STATE.effStat(stat);
    const luck = STATE.totalLuck();
    let opts = spin.options.filter(o => !(o.needItem && !STATE.hasItem(o.needItem)));
    if (opts.length < 1) opts = spin.options;
    const bias = opts.map(o => {
      let m = 1;
      if (o.boostItem && STATE.hasItem(o.boostItem)) m *= (o.boostAmt || 2.6);
      if (o.dampItem && STATE.hasItem(o.dampItem)) m *= (o.dampAmt || 0.4);
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
    UI.log("═══ " + end.title + " ═══", "header");
    UI.log(end.text, end.tone === "bad" ? "bad" : (end.tone === "good" || end.tone === "great") ? "good" : "story");
    UI.sfx.end();
    UI.renderSheet();
    UI.setTitle(end.title);
    UI.setSub("Your road has reached its end.");
    const comps = S.companions.map(id => DATA.companions[id].name).join(", ") || "none";
    const body =
      `<p class="ending-tone-${end.tone}">${end.text}</p><hr>` +
      `<p class="sm">Station — ${S.status ? S.status.name : "—"}</p>` +
      `<p class="sm">Carried — ${S.tool ? S.tool.name : "—"}</p>` +
      `<p class="sm">Steps walked — ${S.steps} &nbsp;·&nbsp; Health — ${Math.max(0, S.hp)}/${S.maxhp}</p>` +
      `<p class="sm">Companions — ${comps}</p>`;
    UI.modal("The Wheel Comes to Rest", body, "Walk a new road", newGame);
    UI.setAction("◈ New Journey", newGame);
    try { localStorage.removeItem("sengoku_save"); } catch (e) {}
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

  return { newGame, resume, showEnding };
})();
