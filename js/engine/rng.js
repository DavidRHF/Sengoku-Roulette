/* ============================================================================
 *  rng.js — the crooked dice behind an honest-looking wheel
 *  --------------------------------------------------------------------------
 *  The wheel LOOKS fair (equal wedges) but the winning wedge is chosen by
 *  weight first, then the wheel is animated to land there. That is how stats,
 *  companions, and luck "sway" a spin exactly as the brief asks.
 * ========================================================================== */
window.RNG = (function () {

  function rand(n) { return Math.random() * n; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* Weighted index pick over an array of numeric weights. */
  function weightedIndex(weights) {
    let total = 0;
    for (const w of weights) total += Math.max(0.0001, w);
    let r = rand(total);
    for (let i = 0; i < weights.length; i++) {
      r -= Math.max(0.0001, weights[i]);
      if (r <= 0) return i;
    }
    return weights.length - 1;
  }

  /* Pick one object from `pool` using each object's `.weight` (default 1). */
  function weightedPick(pool, weightKey) {
    const w = pool.map(o => (weightKey ? o[weightKey] : o.weight) || 1);
    return pool[weightedIndex(w)];
  }

  /* Uniformly sample up to `k` distinct items (order shuffled). */
  function sample(pool, k) {
    const copy = pool.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand(i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(k, copy.length));
  }

  /* ----- Character-creation spin ----------------------------------------
     Display set is sampled UNIFORMLY (any of the 20 can tempt you on the
     wheel), but the WINNER is chosen weighted by rarity, so the worst are
     easiest to land and the best are painfully rare. Returns
     { segments:[{label,item}], winnerIndex }.                              */
  function creationSpin(pool, k) {
    const shown = sample(pool, k);
    const winnerItem = weightedPick(shown, "rarity");
    const winnerIndex = shown.indexOf(winnerItem);
    return {
      segments: shown.map(o => ({ label: o.name, item: o })),
      winnerIndex,
    };
  }

  /* ----- Contested spin (the heart of the system) -----------------------
     Given a scene's options and the check stat, tilt each option's weight by
     the player's effective stat (base + companion mods), then nudge by luck.
     Good outcomes get likelier with a high stat; bad ones with a low stat.   */
  /* Compute the real per-option weights (also used to size the wheel wedges,
   * so what the player SEES matches the true odds). A high matching stat fattens
   * the 'good' options and starves the 'bad' ones; luck and carried items shift
   * them further. */
  function optionWeights(options, stat, effStat, luck, itemBias) {
    const s = stat ? clamp((effStat - 10) / 10, -1.4, 1.9) : 0; // skill vs. average
    const L = clamp(luck, -8, 12);
    return options.map((o, idx) => {
      let w = o.weight || 5;
      if (stat && o.valence === "good") w *= clamp(1 + 0.85 * s + L * 0.045, 0.12, 3.4);
      if (stat && o.valence === "bad")  w *= clamp(1 - 0.85 * s - L * 0.045, 0.12, 3.4);
      if (o.valence === "good" && !stat) w *= (1 + L * 0.04);
      if (o.valence === "bad"  && !stat) w *= (1 - L * 0.04);
      if (itemBias && itemBias[idx] != null) w *= itemBias[idx];
      return Math.max(0.02, w);
    });
  }
  function resolveOptions(options, stat, effStat, luck, itemBias) {
    return weightedIndex(optionWeights(options, stat, effStat, luck, itemBias));
  }

  return { weightedIndex, weightedPick, sample, creationSpin, resolveOptions, optionWeights, clamp };
})();
