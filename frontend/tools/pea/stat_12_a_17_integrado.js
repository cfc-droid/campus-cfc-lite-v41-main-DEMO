/* =========================================================
   CAMPUS CFC LITE — PEA
   ESTADÍSTICAS 12 → 17 INTEGRADAS
   + GRÁFICOS SVG INLINE (AUTO-INJECT DEFINITIVO)
   - Detecta bloques por "ESTADÍSTICA x/17"
   - Elige la TABLA correcta por contenido del header (no "última table")
   - Reinserta si el DOM se re-renderiza y el chart desaparece
   - Soporta Shadow DOM (deep scan)
   ========================================================= */

(function () {
  "use strict";

  console.log("[PEA] stat_12_a_17_integrado.js LOADED");

  /* =========================================================
     UTILS
     ========================================================= */

  function safeText(el) {
    return (el && (el.innerText || el.textContent) ? (el.innerText || el.textContent) : "").trim();
  }

  function parseIntLoose(s) {
    const m = String(s ?? "").match(/-?\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function parseFloatLoose(s) {
    const m = String(s ?? "").replace(",", ".").match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  }

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    const r = el.getBoundingClientRect();
    return r.width > 10 && r.height > 10;
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* =========================================================
     DEEP QUERY (incluye Shadow DOM)
     ========================================================= */

  function deepQueryAll(root, selector, out) {
    out = out || [];
    if (!root) return out;

    // normal DOM
    try {
      if (root.querySelectorAll) {
        out.push(...Array.from(root.querySelectorAll(selector)));
      }
    } catch {}

    // shadow roots
    const all = [];
    try {
      if (root.querySelectorAll) {
        all.push(...Array.from(root.querySelectorAll("*")));
      }
    } catch {}

    all.forEach((el) => {
      if (el && el.shadowRoot) {
        deepQueryAll(el.shadowRoot, selector, out);
      }
    });

    return out;
  }

  /* =========================================================
     SVG HELPERS
     ========================================================= */

  function svgEl(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  function rect(x, y, w, h, fill) {
    const r = svgEl("rect");
    r.setAttribute("x", String(x));
    r.setAttribute("y", String(y));
    r.setAttribute("width", String(Math.max(0, w)));
    r.setAttribute("height", String(h));
    r.setAttribute("rx", "4");
    r.setAttribute("fill", fill);
    return r;
  }

  function text(x, y, txt, fill = "#ddd", size = 12) {
    const t = svgEl("text");
    t.setAttribute("x", String(x));
    t.setAttribute("y", String(y));
    t.setAttribute("fill", fill);
    t.setAttribute("font-size", String(size));
    t.textContent = String(txt ?? "");
    return t;
  }

  function wrapChartContainer(title, stat) {
    const div = document.createElement("div");
    div.className = "pea-inline-chart";
    div.dataset.peaChart = "1";
    div.dataset.peaChartStat = String(stat);

    // fallback inline styles (aunque no haya CSS)
    div.style.margin = "10px 0 18px";
    div.style.padding = "10px 12px";
    div.style.border = "1px solid rgba(255,255,255,.10)";
    div.style.borderRadius = "12px";
    div.style.background = "#0F0F10";
    div.style.color = "#EAEAEA";
    div.style.fontSize = "13px";

    div.innerHTML = `<div style="font-weight:900; margin-bottom:8px;">${escapeHtml(title)}</div>`;
    return div;
  }

  /* =========================================================
     CHARTS
     ========================================================= */

  function renderBarChartGP({ data, width = 520 }) {
    const barH = 18;
    const gap = 8;
    const leftPad = 170;
    const rightPad = 70;
    const usableW = Math.max(220, width - leftPad - rightPad);

    const max = Math.max(...data.map((d) => (d.g || 0) + (d.p || 0)), 1);
    const height = data.length * (barH + gap) + 18;

    const svg = svgEl("svg");
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.style.display = "block";
    svg.style.maxWidth = "100%";

    data.forEach((d, i) => {
      const y = 8 + i * (barH + gap);
      const gW = ((d.g || 0) / max) * usableW;
      const pW = ((d.p || 0) / max) * usableW;

      svg.appendChild(text(0, y + 13, d.label, "#ddd", 12));
      svg.appendChild(rect(leftPad, y, gW, barH, "#3fb950"));
      svg.appendChild(rect(leftPad + gW, y, pW, barH, "#f85149"));
      svg.appendChild(text(leftPad + gW + pW + 8, y + 13, `${d.g}/${d.p}`, "#ddd", 12));
    });

    return svg;
  }

  function renderBarChart1({ data, valueMax, width = 520, color = "#5AA0FF", suffix = "" }) {
    const barH = 16;
    const gap = 8;
    const leftPad = 170;
    const rightPad = 70;
    const usableW = Math.max(220, width - leftPad - rightPad);

    const max = Math.max(valueMax || 1, 1);
    const height = data.length * (barH + gap) + 18;

    const svg = svgEl("svg");
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.style.display = "block";
    svg.style.maxWidth = "100%";

    data.forEach((d, i) => {
      const y = 8 + i * (barH + gap);
      const w = ((d.v || 0) / max) * usableW;

      svg.appendChild(text(0, y + 12, d.label, "#ddd", 12));
      svg.appendChild(rect(leftPad, y, w, barH, color));
      svg.appendChild(text(leftPad + w + 8, y + 12, `${d.v}${suffix}`, "#ddd", 12));
    });

    return svg;
  }

  /* =========================================================
     DETECTION (STAT POR TEXTO)
     ========================================================= */

  function detectStatFromText(txtRaw) {
    const txt = String(txtRaw || "");
    const m = txt.match(/ESTAD[ÍI]STICA\s+(\d+)\s*\/\s*17/i);
    if (m && m[1]) {
      const n = parseInt(m[1], 10);
      if ([12, 15, 16, 17].includes(n)) return n;
    }

    const low = txt.toLowerCase();
    if (low.includes("intensidad promedio") || low.includes("picos por resultado")) return 12;
    if (low.includes("acciones críticas")) return 15;
    if (low.includes("pensamientos críticos")) return 16;
    if (low.includes("estados") && (low.includes("(e)") || low.includes("por resultado"))) return 17;

    return null;
  }

  /* =========================================================
     BLOCKS: encontrar contenedores de stats
     ========================================================= */

  function findStatBlocksDeep() {
    const blocks = [];

    // 1) wrapper conocido
    deepQueryAll(document, ".pea-cuadro-estadistico", blocks);

    // 2) fallback: elementos que contengan "ESTADÍSTICA x/17"
    const any = deepQueryAll(document, "h1,h2,h3,h4,div,section,article", []);
    any.forEach((el) => {
      const t = safeText(el);
      if (!/ESTAD[ÍI]STICA\s+\d+\s*\/\s*17/i.test(t)) return;

      // subimos a un bloque que contenga una tabla
      let b = el;
      for (let i = 0; i < 8; i++) {
        if (!b || !b.parentElement) break;
        b = b.parentElement;
        const hasTable = (() => {
          try {
            return b.querySelector && b.querySelector("table, .pea-table, [role='table']");
          } catch {
            return null;
          }
        })();
        if (hasTable) break;
      }
      if (b) blocks.push(b);
    });

    // dedupe
    return Array.from(new Set(blocks)).filter((b) => b && b.nodeType === 1);
  }

  /* =========================================================
     TABLE PICKER: elegir la tabla correcta por header
     ========================================================= */

  function tableToHeaderText(table) {
    if (!table) return "";
    try {
      // thead
      const thead = table.querySelector("thead");
      if (thead) return safeText(thead);
      // si no hay thead, tomamos primera fila
      const firstRow = table.querySelector("tr");
      if (firstRow) return safeText(firstRow);
      return safeText(table);
    } catch {
      return safeText(table);
    }
  }

  function pickBestTableForStat(block, stat) {
    // tomamos todas las tablas dentro del bloque
    let tables = [];
    try {
      tables = Array.from(block.querySelectorAll("table"));
    } catch {
      tables = [];
    }
    if (!tables.length) return null;

    // preferimos visibles
    const visible = tables.filter(isVisible);
    if (visible.length) tables = visible;

    const want = (stat === 12)
      ? ["intensidad", "picos"]
      : ["ganadas", "perdidas"];

    let best = null;
    let bestScore = -1;

    tables.forEach((t) => {
      const h = tableToHeaderText(t).toLowerCase();
      let score = 0;

      want.forEach((w) => { if (h.includes(w)) score += 5; });

      // bonus si menciona "resultado"
      if (h.includes("resultado")) score += 2;

      // bonus si tiene tbody con varias filas
      try {
        const rows = t.querySelectorAll("tbody tr").length;
        if (rows >= 2) score += 2;
        if (rows >= 5) score += 2;
      } catch {}

      if (score > bestScore) {
        bestScore = score;
        best = t;
      }
    });

    // umbral mínimo: si no matchea nada, devolvemos null
    if (bestScore < 5) return null;
    return best;
  }

  /* =========================================================
     PARSERS
     ========================================================= */

  function parseTableGP(table) {
    const out = [];
    const rows = Array.from(table.querySelectorAll("tbody tr"));

    rows.forEach((r) => {
      const tds = r.querySelectorAll("td");
      if (!tds || tds.length < 4) return;

      const label = safeText(tds[1]);
      if (!label || label === "—") return;

      const up = label.toUpperCase();
      if (up === "TOTALES" || up === "TOTAL") return;

      const g = parseIntLoose(safeText(tds[2]));
      const p = parseIntLoose(safeText(tds[3]));
      out.push({ label, g, p });
    });

    const anyNonZero = out.some((d) => (d.g || 0) + (d.p || 0) > 0);
    return anyNonZero ? out : [];
  }

  function parseTableIntensity(table) {
    const intensidad = [];
    const picos = [];
    const rows = Array.from(table.querySelectorAll("tbody tr"));

    rows.forEach((r) => {
      const tds = r.querySelectorAll("td");
      if (!tds || tds.length < 4) return;

      const resultado = safeText(tds[0]); // GANADA / PERDIDA
      if (!resultado || resultado === "—") return;

      const up = resultado.toUpperCase();
      if (up === "TOTALES" || up === "TOTAL") return;

      const inten = parseFloatLoose(safeText(tds[2]));
      const pico = parseIntLoose(safeText(tds[3])); // “67%” -> 67

      intensidad.push({ label: resultado, v: Number.isFinite(inten) ? inten : 0 });
      picos.push({ label: resultado, v: Number.isFinite(pico) ? pico : 0 });
    });

    const anyI = intensidad.some((d) => (d.v || 0) > 0);
    const anyP = picos.some((d) => (d.v || 0) > 0);

    return { intensidad: anyI ? intensidad : [], picos: anyP ? picos : [] };
  }

  /* =========================================================
     INJECTOR (por bloque)
     ========================================================= */

  function ensureReinjectAllowed(block, stat) {
    // Si el bloque está marcado pero el chart no existe, permitimos reinyección.
    const existing = block.querySelector(`.pea-inline-chart[data-pea-chart="1"][data-pea-chart-stat="${String(stat)}"]`);
    if (existing) return false; // ya está
    // si estaba marcado como done, lo limpiamos (porque el chart desapareció)
    if (block.dataset.peaChartDone === "1") {
      delete block.dataset.peaChartDone;
    }
    return true;
  }

  function injectIntoBlock(block) {
    if (!block) return;

    const txt = safeText(block);
    if (!txt) return;

    const stat = detectStatFromText(txt);
    if (![12, 15, 16, 17].includes(stat)) return;

    // si ya existe, no duplicar; si desapareció, reinyectar
    if (!ensureReinjectAllowed(block, stat)) return;

    const table = pickBestTableForStat(block, stat);
    if (!table) return;

    // STAT 15/16/17
    if (stat === 15 || stat === 16 || stat === 17) {
      const data = parseTableGP(table);
      if (!data.length) return;

      const wrap = wrapChartContainer("Gráfico: Ganadas vs Perdidas (por ítem)", stat);
      wrap.appendChild(renderBarChartGP({ data, width: 520 }));

      table.insertAdjacentElement("afterend", wrap);
      block.dataset.peaChartDone = "1";
      return;
    }

    // STAT 12
    if (stat === 12) {
      const parsed = parseTableIntensity(table);
      if (!parsed.intensidad.length && !parsed.picos.length) return;

      const wrap = wrapChartContainer("Gráficos: Intensidad promedio y % Picos (4–5)", stat);

      if (parsed.intensidad.length) {
        wrap.appendChild(
          renderBarChart1({
            data: parsed.intensidad,
            valueMax: 5,
            width: 520,
            color: "#5AA0FF",
            suffix: ""
          })
        );
      }

      if (parsed.picos.length) {
        wrap.appendChild(
          renderBarChart1({
            data: parsed.picos,
            valueMax: 100,
            width: 520,
            color: "#F5C542",
            suffix: "%"
          })
        );
      }

      table.insertAdjacentElement("afterend", wrap);
      block.dataset.peaChartDone = "1";
      return;
    }
  }

  function scanAll() {
    const blocks = findStatBlocksDeep();
    if (!blocks.length) return;
    blocks.forEach(injectIntoBlock);
  }

  /* =========================================================
     BOOTSTRAP
     ========================================================= */

  function start() {
    scanAll();

    const obs = new MutationObserver(() => {
      scanAll();
    });

    obs.observe(document.documentElement, { childList: true, subtree: true });

    // refuerzo (por render tardío)
    let ticks = 0;
    const iv = setInterval(() => {
      ticks++;
      scanAll();
      if (ticks >= 40) clearInterval(iv); // 20s
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
