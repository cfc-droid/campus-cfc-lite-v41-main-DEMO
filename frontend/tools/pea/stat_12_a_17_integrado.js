/* =========================================================
   CAMPUS CFC LITE — PEA
   ESTADÍSTICAS 12 → 17 INTEGRADAS
   + GRÁFICOS SVG INLINE (AUTO-INJECT)
   ========================================================= */

(function () {
  "use strict";

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

  function wrapChartContainer(title) {
    const div = document.createElement("div");
    div.style.margin = "10px 0 18px";
    div.style.padding = "10px 12px";
    div.style.border = "1px solid rgba(255,255,255,.10)";
    div.style.borderRadius = "12px";
    div.style.background = "#0F0F10";
    div.style.color = "#EAEAEA";
    div.style.fontSize = "13px";
    div.innerHTML = `<div style="font-weight:800; margin-bottom:8px;">${escapeHtml(
      title
    )}</div>`;
    return div;
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function parseIntLoose(s) {
    const m = String(s ?? "").match(/-?\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function parseFloatLoose(s) {
    const m = String(s ?? "").replace(",", ".").match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  }

  /* =========================================================
     CHARTS
     ========================================================= */

  // 2-series stacked: GANADAS vs PERDIDAS
  function renderBarChartGP({ data, width = 520 }) {
    const barH = 18;
    const gap = 8;
    const leftPad = 170; // espacio para label
    const rightPad = 60; // espacio para valores
    const usableW = Math.max(180, width - leftPad - rightPad);

    const max = Math.max(
      ...data.map((d) => (d.g || 0) + (d.p || 0)),
      1
    );
    const height = data.length * (barH + gap) + 18;

    const svg = svgEl("svg");
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.style.display = "block";

    data.forEach((d, i) => {
      const y = 8 + i * (barH + gap);
      const gW = ((d.g || 0) / max) * usableW;
      const pW = ((d.p || 0) / max) * usableW;

      svg.appendChild(text(0, y + 13, d.label, "#ddd", 12));

      // ganadas (verde)
      svg.appendChild(rect(leftPad, y, gW, barH, "#3fb950"));
      // perdidas (rojo)
      svg.appendChild(rect(leftPad + gW, y, pW, barH, "#f85149"));

      svg.appendChild(
        text(leftPad + gW + pW + 8, y + 13, `${d.g}/${d.p}`, "#ddd", 12)
      );
    });

    return svg;
  }

  // 1-series bars (para Stat 12 intensidad / picos)
  function renderBarChart1({ data, valueMax, width = 520, color = "#5AA0FF", suffix = "" }) {
    const barH = 16;
    const gap = 8;
    const leftPad = 170;
    const rightPad = 60;
    const usableW = Math.max(180, width - leftPad - rightPad);

    const max = Math.max(valueMax || 1, 1);
    const height = data.length * (barH + gap) + 18;

    const svg = svgEl("svg");
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.style.display = "block";

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
     DETECTION + PARSERS
     ========================================================= */

  function detectStatFromContainer(container) {
    // Busca títulos dentro del mismo cuadro/segmento
    const h = container.querySelector("h3, h4");
    const txt = (h?.innerText || "").toLowerCase();

    if (txt.includes("intensidad promedio") || txt.includes("picos por resultado")) return 12;
    if (txt.includes("acciones críticas")) return 15;
    if (txt.includes("pensamientos críticos")) return 16;
    if (txt.includes("estados") && txt.includes("crític")) return 17; // “Estados críticos…”
    return null;
  }

  function getLastRelevantBlock(root) {
    // Intento 1: último “cuadro” (si existe una clase típica)
    const candidates = root.querySelectorAll(".pea-cuadro, .pea-card, .pea-cuadro-base, .pea-box, .pea-cuadro-estadistica");
    if (candidates && candidates.length) return candidates[candidates.length - 1];

    // Intento 2: último hijo element
    const kids = Array.from(root.children || []).filter((x) => x && x.nodeType === 1);
    return kids.length ? kids[kids.length - 1] : root;
  }

  function findLastTable(block) {
    // tablas posibles
    const tables = block.querySelectorAll("table.pea-table, table");
    if (!tables.length) return null;

    // elegimos la última tabla visible
    return tables[tables.length - 1];
  }

  // Stats 15/16/17: label en col 2; ganadas en col 3; perdidas en col 4 (texto puede venir "2 (33%)")
  function parseTableForGP(table) {
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const out = [];

    rows.forEach((r) => {
      const tds = r.querySelectorAll("td");
      if (!tds || tds.length < 4) return;

      const label = (tds[1]?.innerText || "").trim();
      if (!label || label === "—") return;

      const up = label.toUpperCase();
      if (up === "TOTALES" || up === "TOTAL" || up === "TOT") return;

      const g = parseIntLoose(tds[2]?.innerText);
      const p = parseIntLoose(tds[3]?.innerText);

      out.push({ label, g, p });
    });

    // si todas son 0/0, no tiene sentido dibujar
    const anyNonZero = out.some((d) => (d.g || 0) + (d.p || 0) > 0);
    return anyNonZero ? out : [];
  }

  // Stat 12: Resultado | Registros | Intensidad promedio | % picos (4–5)
  function parseTableForIntensity(table) {
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const intensidad = [];
    const picos = [];

    rows.forEach((r) => {
      const tds = r.querySelectorAll("td");
      if (!tds || tds.length < 4) return;

      const label = (tds[0]?.innerText || tds[1]?.innerText || "").trim();
      // Algunas tablas ponen “Resultado” como primera col, otras como segunda.
      // Preferimos detectar GANADA/PERDIDA/BE/NA:
      const label2 = (tds[0]?.innerText || "").trim();
      const label3 = (tds[1]?.innerText || "").trim();
      const pick = [label2, label3].find((x) => x && x !== "—") || label;
      const L = pick.toUpperCase();

      if (!pick || pick === "—") return;
      if (L === "TOTALES" || L === "TOTAL") return;

      // Intentamos intensidad desde la col que contenga un decimal típico
      const inten = parseFloatLoose(tds[2]?.innerText);
      const pico = parseIntLoose(tds[3]?.innerText); // “67%” -> 67

      intensidad.push({ label: pick, v: Number.isFinite(inten) ? inten : 0 });
      picos.push({ label: pick, v: Number.isFinite(pico) ? pico : 0 });
    });

    const anyI = intensidad.some((d) => (d.v || 0) > 0);
    const anyP = picos.some((d) => (d.v || 0) > 0);

    return {
      intensidad: anyI ? intensidad : [],
      picos: anyP ? picos : []
    };
  }

  /* =========================================================
     INJECTOR
     ========================================================= */
  function tryInject(root) {
    const block = getLastRelevantBlock(root);
    if (!block) return;

    const table = findLastTable(block);
    if (!table) return;

    if (table.dataset.chartDone === "1") return;

    const stat = detectStatFromContainer(block);
    if (!stat) return;

    // STAT 15/16/17 (GP)
    if (stat === 15 || stat === 16 || stat === 17) {
      const data = parseTableForGP(table);
      if (!data.length) return;

      const wrap = wrapChartContainer("Gráfico: Ganadas vs Perdidas (por ítem)");
      wrap.appendChild(renderBarChartGP({ data, width: 520 }));

      table.insertAdjacentElement("afterend", wrap);
      table.dataset.chartDone = "1";
      return;
    }

    // STAT 12 (Intensidad + Picos)
    if (stat === 12) {
      const parsed = parseTableForIntensity(table);
      if (!parsed.intensidad.length && !parsed.picos.length) return;

      const wrap = wrapChartContainer("Gráficos: Intensidad promedio y % Picos (4–5)");
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
      table.dataset.chartDone = "1";
      return;
    }
  }

  /* =========================================================
     BOOTSTRAP (Observer)
     ========================================================= */
  function start() {
    const root = document.getElementById("pea-level-4");
    if (!root) return;

    // Intento inicial (por si ya estaba renderizado)
    tryInject(root);

    const obs = new MutationObserver(() => {
      // en cuanto cambia el DOM, intentamos inyectar en el último bloque
      tryInject(root);
    });

    obs.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
