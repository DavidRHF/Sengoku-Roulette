/* ============================================================================
 *  main.js — boot & controls
 * ========================================================================== */
(function () {
  const $ = id => document.getElementById(id);

  const HOW_TO = `
    <p>The realm is at war. Every road, every rest, every stranger is a spin of the wheel — and your fate is swayed by who you are.</p>
    <p><b>1. The wheel decides your birth.</b> Spin first for your <i>station</i> (peasant, ronin, daimyō, and more) and your <i>tool or weapon</i>. The lowly are common; the mighty are rare. These set your four gauges:</p>
    <ul>
      <li><b>Health</b> — how much punishment you can take (15–50).</li>
      <li><b>Strength</b> — bends spins about force and survival.</li>
      <li><b>Wisdom</b> — bends spins about cunning and lore.</li>
      <li><b>Charisma</b> — bends spins about deceit and persuasion.</li>
    </ul>
    <p>Strength, Wisdom and Charisma run 0–20. The higher the stat, the more a matching wheel tilts in your favor.</p>
    <p><b>2. The road unfolds.</b> Two encounters, then a night's rest, then again. Where you are — city, forest, shrine, coast — decides what you meet. Roads intertwine: a peasant and a drunkard may walk the same dark path.</p>
    <p><b>3. Companions sway the wheel.</b> A samurai lifts your Strength spins; a drunkard drags your Charisma down. Gain and lose them as you travel.</p>
    <p><b>4. Many endings.</b> Some come fast and cruel; some take the whole long road. Fulfil your quest, or simply survive the age.</p>
    <p class="sm">Your journey autosaves. History is unkind here — steep yourself in it, and spin well.</p>`;

  function boot() {
    STATE.fresh();

    $("btn-new").onclick = () => {
      UI.sfx.click();
      UI.modal("Begin anew?", "<p>Abandon the current road and spin a fresh fate?</p>",
        "Yes, a new road", () => GAME.newGame());
    };
    $("btn-save").onclick = () => {
      UI.sfx.click();
      const ok = STATE.save();
      flash($("btn-save"), ok ? "Saved ✓" : "Save failed");
    };
    $("btn-load").onclick = () => {
      UI.sfx.click();
      if (STATE.load()) GAME.resume();
      else flash($("btn-load"), "No save found");
    };
    $("btn-how").onclick = () => { UI.sfx.click(); UI.modal("How to Play", HOW_TO, "To the road"); };
    $("btn-mute").onclick = () => { UI.sfx.click(); UI.toggleMute(); };

    // resume if a save exists, otherwise fresh game
    if (STATE.hasSave() && STATE.load()) {
      UI.modal("A road awaits", "<p>A saved journey was found. Continue it, or begin anew?</p>",
        "Continue journey", () => GAME.resume());
      // offer a new-game path via the New button; modal continues the save
    } else {
      GAME.newGame();
    }
  }

  function flash(btn, msg) {
    const old = btn.textContent;
    btn.textContent = msg;
    setTimeout(() => (btn.textContent = old), 1200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
