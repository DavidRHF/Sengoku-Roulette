/* ============================================================================
 *  wheel.js — the Wheel of the Warring States
 *  --------------------------------------------------------------------------
 *  Renders N equal wedges (fair-looking). The colored wedges spin, but every
 *  label stays HORIZONTAL and upright at all times — labels orbit the hub
 *  rather than rotating with it, so no option is ever upside-down. The winner
 *  always comes to rest dead-centre beneath the pointer at 3 o'clock (0°).
 * ========================================================================== */
window.WHEEL = (function () {
  const NS = "http://www.w3.org/2000/svg";
  const CX = 150, CY = 150, R = 132, RLABEL = 84;
  const PALETTE = [
    "#4a6e97", "#bd5a4a", "#7e9268", "#cdb277",
    "#8a749c", "#5a8791", "#9c7a5c", "#97a06a",
  ];
  const DUR = 4100; // ms

  let wedgeGroup, labelLayer, labels = [], wedges = [], segCount = 0;
  let currentRot = 0, spinning = false, rafId = null;

  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function pt(a, r) {
    const rad = (a * Math.PI) / 180;
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
  }
  function arcPath(a0, a1) {
    const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
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
    return lines.slice(0, 3);
  }

  function render(segments) {
    const svg = document.getElementById("wheel-svg");
    svg.innerHTML = "";
    segCount = segments.length;
    currentRot = 0;
    labels = []; wedges = [];

    // woodblock paper grain + a soft centre bokashi, printed over the wedges
    const NOISE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23n)'/%3E%3C/svg%3E";
    const defs = el("defs", {});
    defs.innerHTML =
      `<pattern id="wbPaper" patternUnits="userSpaceOnUse" width="150" height="150">` +
      `<image href="${NOISE}" x="0" y="0" width="150" height="150"/></pattern>` +
      `<radialGradient id="wbBokashi" cx="0.5" cy="0.5" r="0.5">` +
      `<stop offset="0" stop-color="#f4efe0" stop-opacity="0.30"/>` +
      `<stop offset="0.62" stop-color="#f4efe0" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="wbEdge" cx="0.5" cy="0.5" r="0.5">` +
      `<stop offset="0.72" stop-color="#2a241b" stop-opacity="0"/>` +
      `<stop offset="1" stop-color="#2a241b" stop-opacity="0.16"/></radialGradient>`;
    svg.appendChild(defs);

    // wedge angular sizes ∝ weight (so a fatter slice = a genuinely higher
    // chance). A floor keeps tiny-odds slices readable, then we renormalise.
    const hasW = segments.some(s => typeof s.weight === "number");
    let sizes = segments.map(s => hasW ? Math.max(0.0001, s.weight || 0) : 1);
    const total0 = sizes.reduce((a, b) => a + b, 0) || 1;
    const floor = 0.055; // each wedge at least ~5.5% of the wheel
    sizes = sizes.map(w => w / total0);
    sizes = sizes.map(f => Math.max(floor, f));
    const total = sizes.reduce((a, b) => a + b, 0);
    sizes = sizes.map(f => f / total);
    // cumulative angles
    let acc = 0;
    for (let i = 0; i < segCount; i++) {
      const a0 = acc * 360, a1 = (acc + sizes[i]) * 360;
      wedges.push({ a0, a1, mid: (a0 + a1) / 2, frac: sizes[i] });
      acc += sizes[i];
    }

    // static backing: a printed paper disc with an ink rim + vermilion inner ring
    svg.appendChild(el("circle", { cx: CX, cy: CY, r: R + 8, fill: "#e3d4b4" }));
    svg.appendChild(el("circle", { cx: CX, cy: CY, r: R + 6, fill: "none",
      stroke: "#2a241b", "stroke-width": 3 }));
    svg.appendChild(el("circle", { cx: CX, cy: CY, r: R + 1.5, fill: "none",
      stroke: "#b23a2c", "stroke-width": 1.5 }));

    // rotating wedges (colours only — no text lives in here)
    wedgeGroup = el("g", { id: "wheel-rot" });
    wedgeGroup.style.transformOrigin = "150px 150px";
    svg.appendChild(wedgeGroup);
    for (let i = 0; i < segCount; i++) {
      wedgeGroup.appendChild(el("path", {
        d: arcPath(wedges[i].a0, wedges[i].a1),
        fill: PALETTE[i % PALETTE.length],
        stroke: "#2a241b", "stroke-width": 2,
      }));
    }
    // paper grain rides WITH the print (rotates with the wedges)
    const tex = el("circle", { cx: CX, cy: CY, r: R, fill: "url(#wbPaper)", opacity: 0.13 });
    tex.style.mixBlendMode = "multiply";
    wedgeGroup.appendChild(tex);

    // static centre bokashi + soft rim shade (lighting, doesn't spin)
    svg.appendChild(el("circle", { cx: CX, cy: CY, r: R, fill: "url(#wbBokashi)" }));
    svg.appendChild(el("circle", { cx: CX, cy: CY, r: R, fill: "url(#wbEdge)" }));

    // upright labels for a few wedges; radial (read outward) when there are many
    labelLayer = el("g", { id: "wheel-labels" });
    svg.appendChild(labelLayer);
    const radial = segCount > 12;
    const fontSize = radial ? (segCount > 22 ? 7 : 8)
      : segCount > 6 ? 9 : segCount > 4 ? 10.5 : 12;
    for (let i = 0; i < segCount; i++) {
      const mid = wedges[i].mid;
      let lines;
      if (radial) {
        // strip parenthetical clarifiers and keep to one radial line
        lines = [String(segments[i].label).replace(/\s*\([^)]*\)\s*/g, "").trim()];
      } else {
        const cap = wedges[i].frac < 0.09 ? 9 : (segCount > 6 ? 12 : 15);
        lines = wrap(segments[i].label, cap);
      }
      const t = el("text", {
        fill: "#f8f2e4", "font-size": fontSize,
        "font-family": "'Zen Kaku Gothic New', sans-serif", "font-weight": 700,
        "text-anchor": "middle", "dominant-baseline": "middle",
        style: "paint-order:stroke;stroke:#2a241b;stroke-width:2.2px;stroke-linejoin:round;",
      });
      const tspans = lines.map(() => el("tspan", {}));
      tspans.forEach((ts, li) => { ts.textContent = lines[li]; t.appendChild(ts); });
      labelLayer.appendChild(t);
      labels.push({ el: t, tspans, mid, nLines: lines.length, fs: fontSize, radial });
    }

    // hub + ensō (static, drawn on top) — cream disc, sumi-ink brush ring
    svg.appendChild(el("circle", { cx: CX, cy: CY, r: 22, fill: "#efe6cf",
      stroke: "#2a241b", "stroke-width": 2.5 }));
    svg.appendChild(el("path", {
      d: "M 150 134 A 16 16 0 1 1 141 137",
      fill: "none", stroke: "#2a241b", "stroke-width": 3.5, "stroke-linecap": "round",
    }));
    svg.appendChild(el("circle", { cx: CX, cy: CY, r: 4.5, fill: "#b23a2c" }));

    layoutLabels(0);
  }

  /* place every label at its orbital position for wheel angle `rot` */
  function layoutLabels(rot) {
    for (const L of labels) {
      const a = L.mid + rot;
      if (L.radial) {
        // sit mid-slice and rotate to read outward; flip on the left half to stay upright
        const [ax, ay] = pt(a, RLABEL + 4);
        let deg = ((a % 360) + 360) % 360;
        const flip = deg > 90 && deg < 270;
        const rdeg = flip ? deg + 180 : deg;
        L.el.setAttribute("x", ax);
        L.el.setAttribute("y", ay);
        L.el.setAttribute("transform", `rotate(${rdeg} ${ax} ${ay})`);
        L.tspans.forEach(ts => { ts.setAttribute("x", ax); ts.setAttribute("y", ay); });
        continue;
      }
      const [ax, ay] = pt(a, RLABEL);
      const lh = L.fs + 1.5;
      const y0 = ay - ((L.nLines - 1) / 2) * lh;
      L.el.removeAttribute("transform");
      L.el.setAttribute("x", ax);
      L.el.setAttribute("y", ay);
      L.tspans.forEach((ts, li) => {
        ts.setAttribute("x", ax);
        ts.setAttribute("y", y0 + li * lh);
      });
    }
  }

  function setWedgeRot(rot) {
    wedgeGroup.style.transform = `rotate(${rot}deg)`;
  }

  /* Spin so segment `winnerIndex` stops under the pointer (0°) — landing at a
   * random point within that wedge (not its exact centre) so it feels real. */
  function spinTo(winnerIndex, cb) {
    if (spinning || !wedgeGroup) return;
    spinning = true;
    const w = wedges[winnerIndex] || { a0: 0, a1: 360, mid: 0 };
    const span = w.a1 - w.a0;
    // keep a small margin from the dividers so it never looks like it split two slices
    const margin = Math.min(span * 0.18, 8);
    const landAngle = w.a0 + margin + Math.random() * Math.max(0.0001, span - 2 * margin);
    // rotation that brings that point of the wheel to 0° (mod 360)
    const target = ((-landAngle) % 360 + 360) % 360;
    let delta = ((target - (currentRot % 360)) % 360 + 360) % 360;
    const startRot = currentRot;
    const endRot = startRot + delta + 360 * 5;   // five full turns, then settle
    const t0 = performance.now();
    const ease = p => 1 - Math.pow(1 - p, 3);     // easeOutCubic — decelerates

    function frame(now) {
      const p = Math.min(1, (now - t0) / DUR);
      const rot = startRot + (endRot - startRot) * ease(p);
      setWedgeRot(rot);
      layoutLabels(rot);
      if (p < 1) { rafId = requestAnimationFrame(frame); }
      else {
        currentRot = ((endRot % 360) + 360) % 360;
        setWedgeRot(currentRot);
        layoutLabels(currentRot);
        spinning = false;
        if (cb) cb();
      }
    }
    rafId = requestAnimationFrame(frame);
  }

  function isSpinning() { return spinning; }

  return { render, spinTo, isSpinning };
})();
