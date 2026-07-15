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

    $("btn-new").onclick = () => { UI.sfx.click(); openModeMenu(); };
    $("btn-endings").onclick = () => { UI.sfx.click(); openGallery(); };
    $("btn-how").onclick = () => { UI.sfx.click(); UI.modal("How to Play", HOW_TO, "To the road"); };

    if (window.SCENE) SCENE.reset();

    // resume if a save exists, otherwise open the mode menu
    if (STATE.hasSave() && STATE.load()) {
      UI.modal("A road awaits", "<p>A saved journey was found. Continue it, or begin anew?</p>",
        "Continue journey", () => GAME.resume());
    } else {
      openModeMenu();
    }
  }

  /* ---- new-game mode menu ---------------------------------------------- */
  function closeModal() { const m = document.getElementById("modal"); if (m) m.classList.remove("show"); }
  function openModeMenu() {
    UI.modal("Choose your path", UI.modeMenu(), "Not yet", null, "modal-modes");
    document.querySelectorAll("#modal-body .mode-btn").forEach(btn => {
      btn.onclick = () => {
        UI.sfx.click();
        const mode = btn.getAttribute("data-mode");
        if (mode === "scenario") { openScenarioMenu(); return; }
        closeModal();
        if (mode === "conditions") GAME.startRandomConditions();
        else if (mode === "stats") GAME.startRandomStats();
        else GAME.startNormal();
      };
    });
  }
  function openScenarioMenu() {
    const body = document.getElementById("modal-body");
    if (!body) { GAME.startNormal(); return; }
    document.getElementById("modal-title").textContent = "Status Scenarios";
    body.innerHTML = UI.scenarioList();
    body.querySelectorAll(".scn").forEach(btn => {
      btn.onclick = () => { UI.sfx.click(); const id = btn.getAttribute("data-scenario"); closeModal(); GAME.startScenario(id); };
    });
  }

  function flash(btn, msg) {
    const old = btn.textContent;
    btn.textContent = msg;
    setTimeout(() => (btn.textContent = old), 1200);
  }

  /* ---- endings-gallery cloud-sync controls ---------------------------- */
  function setSyncStatus(m) { const s = document.getElementById("sync-status"); if (s) s.textContent = m; }
  function openGallery() {
    UI.modal("Endings — the Fates You've Met", UI.endingsGallery(), "Close", null, "modal-gallery");
    wireSync(); wireCards();
    if (window.SYNC && SYNC.configured()) SYNC.pull().then(refreshGallery);
  }
  function refreshGallery() {
    const body = document.getElementById("modal-body");
    if (body) { body.innerHTML = UI.endingsGallery(); wireSync(); wireCards(); }
  }
  function openEndingDetail(id) {
    const body = document.getElementById("modal-body");
    if (!body) return;
    body.innerHTML = UI.endingDetail(id);
    const back = document.getElementById("ending-back");
    if (back) back.onclick = () => { UI.sfx.click(); openGallery(); };
  }
  function wireCards() {
    document.querySelectorAll("#modal-body .ending-card.clickable").forEach(card => {
      card.onclick = () => { UI.sfx.click(); openEndingDetail(card.getAttribute("data-ending")); };
    });
  }
  function wireSync() {
    if (!window.SYNC) return;
    const copy = document.getElementById("sync-copy");
    if (copy) copy.onclick = () => {
      const c = SYNC.code();
      try { navigator.clipboard.writeText(c); setSyncStatus("Code copied to clipboard."); }
      catch (e) {
        const inp = document.getElementById("sync-input"); if (inp) { inp.value = c; inp.select(); }
        setSyncStatus("Copy this code: " + c);
      }
    };
    const now = document.getElementById("sync-now");
    if (now) now.onclick = async () => { setSyncStatus("Syncing…"); await SYNC.pull(); setSyncStatus("Synced."); refreshGallery(); };
    const link = document.getElementById("sync-link");
    if (link) link.onclick = async () => {
      const v = (document.getElementById("sync-input") || {}).value || "";
      setSyncStatus("Linking…");
      const r = await SYNC.link(v);
      if (r.ok) { setSyncStatus("Linked and merged."); refreshGallery(); }
      else setSyncStatus("That code looks invalid (6–40 letters/numbers).");
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
