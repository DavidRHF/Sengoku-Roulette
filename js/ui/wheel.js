/* ============================================================================
 *  wheel.js — the Wheel of the Warring States
 *  --------------------------------------------------------------------------
 *  Renders N equal wedges (fair-looking), then spins to a pre-chosen winner
 *  index. Pointer sits at 3 o'clock (0°), matching the reference layout.
 * ========================================================================== */
window.WHEEL = (function () {
  const NS = "http://www.w3.org/2000/svg";
  const CX = 150, CY = 150, R = 132;
  const PALETTE = [
    "#b83227", "#2b6e78", "#3f7d4e", "#c58a2b",
    "#6c4f7a", "#a35232", "#3a6f92", "#7c8b3a",
  ];

  let rotGroup, cumulative = 0, spinning = false, segCount = 0;
  let onDone = null;

  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function pt(a) {
    const r = (a * Math.PI) / 180;
    return [CX + R * Math.cos(r), CY + R * Math.sin(r)];
  }
  function arcPath(a0, a1) {
    const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`;
  }
  function wrap(label, max) {
    if (label.length <= max) return [label];
    const words = label.split(" ");
    const lines = []; let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
      else cur = (cur + " " + w).trim();
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 2);
  }

  function render(segments) {
    const svg = document.getElementById("wheel-svg");
    svg.innerHTML = "";
    segCount = segments.length;
    cumulative = 0;

    // static gold ring + backing
    svg.appendChild(el("circle", { cx: CX, cy: CY, r: R + 8, fill: "#0c0d15" }));
    const ring = el("circle", { cx: CX, cy: CY, r: R + 5, fill: "none",
      stroke: "url(#goldGrad)", "stroke-width": 8 });
    svg.appendChild(ring);

    rotGroup = el("g", { id: "wheel-rot" });
    rotGroup.style.transition = "none";
    rotGroup.style.transform = "rotate(0deg)";
    rotGroup.style.transformOrigin = "150px 150px";
    svg.appendChild(rotGroup);

    const seg = 360 / segCount;
    const fontSize = segCount > 6 ? 8.5 : segCount > 4 ? 10 : 11.5;
    for (let i = 0; i < segCount; i++) {
      const a0 = i * seg, a1 = a0 + seg, mid = a0 + seg / 2;
      rotGroup.appendChild(el("path", {
        d: arcPath(a0, a1),
        fill: PALETTE[i % PALETTE.length],
        stroke: "#1a1620", "stroke-width": 1.5,
      }));
      // label runs along the radius; flip on the left half for legibility
      const flip = mid > 90 && mid < 270;
      const rot = flip ? mid + 180 : mid;
      const anchor = flip ? "start" : "end";
      const tx = CX + (R - 12) * Math.cos((mid * Math.PI) / 180);
      const ty = CY + (R - 12) * Math.sin((mid * Math.PI) / 180);
      const lines = wrap(segments[i].label, segCount > 6 ? 14 : 18);
      const g = el("text", {
        x: tx, y: ty, fill: "#f6efe0", "font-size": fontSize,
        "font-family": "'Zen Kaku Gothic New', sans-serif", "font-weight": 700,
        "text-anchor": anchor, transform: `rotate(${rot} ${tx} ${ty})`,
        style: "paint-order:stroke;stroke:#00000055;stroke-width:2px;",
      });
      lines.forEach((ln, li) => {
        const ts = el("tspan", { x: tx, dy: li === 0 ? (lines.length > 1 ? -3 : 0) : fontSize + 1 });
        ts.textContent = ln;
        g.appendChild(ts);
      });
      rotGroup.appendChild(g);
    }

    // hub with ensō mark
    svg.appendChild(el("circle", { cx: CX, cy: CY, r: 22, fill: "#0e0f18",
      stroke: "url(#goldGrad)", "stroke-width": 3 }));
    const enso = el("path", {
      d: "M 150 134 A 16 16 0 1 1 141 137",
      fill: "none", stroke: "#b83227", "stroke-width": 3.5, "stroke-linecap": "round",
    });
    svg.appendChild(enso);

    // force reflow so a later transition animates from 0
    void svg.getBBox;
    rotGroup.getBoundingClientRect();
  }

  /* Spin so that segment `winnerIndex` stops beneath the pointer (0°). */
  function spinTo(winnerIndex, cb) {
    if (spinning || !rotGroup) return;
    spinning = true; onDone = cb;
    const seg = 360 / segCount;
    const center = winnerIndex * seg + seg / 2;
    // orientation that lands this segment's center at the pointer (0°)
    const target = ((-center) % 360 + 360) % 360;
    let delta = ((target - (cumulative % 360)) % 360 + 360) % 360;
    const jitter = (Math.random() - 0.5) * seg * 0.55;
    cumulative += delta + 360 * 5 + jitter;
    rotGroup.style.transition = "transform 4.1s cubic-bezier(.15,.62,.18,1)";
    // next frame, apply
    requestAnimationFrame(() => {
      rotGroup.style.transform = `rotate(${cumulative}deg)`;
    });
    const finish = () => {
      rotGroup.removeEventListener("transitionend", finish);
      spinning = false;
      if (onDone) { const f = onDone; onDone = null; f(); }
    };
    rotGroup.addEventListener("transitionend", finish);
    // safety fallback in case transitionend is missed
    setTimeout(() => { if (spinning) finish(); }, 4600);
  }

  function isSpinning() { return spinning; }

  return { render, spinTo, isSpinning };
})();
