/* =========================================================
   CAMPUS CFC LITE — PEA
   ESTADÍSTICAS 12 → 17 INTEGRADAS
   + GRÁFICOS SVG INLINE (AUTO-INJECT ROBUSTO)
   ========================================================= */

(function () {
  "use strict";

  // ✅ DEBUG: si NO ves este log en consola, el archivo NO se está cargando.
  console.log("[PEA] stat_12_a_17_integrado.js LOADED");

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

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function wrapChartContainer(title) {
    const div = document.createElement("div");
    div.className = "pea-inline-chart";
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

  // 2-series stacked: GANADAS vs PERDIDAS (Stats 15/16/17)
  function renderBarChartGP({ data, width = 520 }) {
    const barH = 18;
    const gap = 8;
    const leftPad = 170; // label
    const rightPad = 70; // numbers
    const usableW = Math.max(200, width - leftPad - rightPad);

    const max = Math.max(...data.map((d) => (d.g || 0) + (d.p || 0)), 1);
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
      svg.appendChild(rect(leftPad, y, gW, barH, "#3fb950"));
      svg.appendChild(rect(leftPad + gW, y, pW, barH, "#f85149"));
      svg.appendChild(text(leftPad + gW + pW + 8, y + 13, `${d.g}/${d.p}`, "#ddd", 12));
    });

    return svg;
  }

  // 1-series bars (Stat 12: intensidad / picos)
  function renderBarChart1({ data, valueMax, width = 520, color = "#5AA0FF", suffix = "" }) {
    const barH = 16;
    const gap = 8;
    const leftPad = 170;
    const rightPad = 70;
    const usableW = Math.max(200, width - leftPad - rightPad);

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
     DETECTION (ROBUSTA)
     ========================================================= */

  function detectStatFromText(txtRaw) {
    const txt = String(txtRaw || "").toLowerCase();

    // Stat 12 (por título o por "12/17")
    if (
      txt.includes("estadística 12/17") ||
      txt.includes("intensidad promedio") ||
      txt.includes("picos por resultado")
    ) {
      return 12;
    }

    if (txt.includes("estadística 15/17") || txt.includes("acciones críticas")) return 15;
    if (txt.includes("estadística 16/17") || txt.includes("pensamientos críticos")) return 16;

    // OJO: “Estados críticos por resultado”
    if (txt.includes("estadística 17/17") || (txt.includes("estados") && txt.includes("crític"))) return 17;

    return null;
  }

  // Sube desde la tabla hasta encontrar un contenedor que tenga texto de “ESTADÍSTICA”
  function findStatContainerForTable(root, table) {
    let el = table;
    while (el && el !== root) {
      const t = (el.innerText || "");
      if (/ESTAD[IÍ]STICA/i.test(t)) return el;
      el = el.parentElement;
    }
    return table.parentElement || root;
  }

  function findLastTableInContainer(container) {
    const tables = container.querySelectorAll("table");
    if (!tables.length) return null;
    return tables[tables.length - 1];
  }

  /* =========================================================
     PARSERS
     ========================================================= */

  // Stats 15/16/17: col2=label, col3=ganadas, col4=perdidas (puede venir "2 (33%)")
  function parseTableForGP(table) {
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const out = [];

    rows.forEach((r) => {
      const tds = r.querySelectorAll("td");
      if (!tds || tds.length < 4) return;

      const label = (tds[1]?.innerText || "").trim();
      if (!label || label === "—") return;

      const up = label.toUpperCase();
      if (up === "TOTALES" || up === "TOTAL") return;

      const g = parseIntLoose(tds[2]?.innerText);
      const p = parseIntLoose(tds[3]?.innerText);

      out.push({ label, g, p });
    });

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

      const resultado = (tds[0]?.innerText || "").trim(); // GANADA / PERDIDA
      if (!resultado || resultado === "—") return;

      const up = resultado.toUpperCase();
      if (up === "TOTALES" || up === "TOTAL") return;

      const inten = parseFloatLoose(tds[2]?.innerText);
      const pico = parseIntLoose(tds[3]?.innerText); // “67%” -> 67

      intensidad.push({ label: resultado, v: Number.isFinite(inten) ? inten : 0 });
      picos.push({ label: resultado, v: Number.isFinite(pico) ? pico : 0 });
    });

    const anyI = intensidad.some((d) => (d.v || 0) > 0);
    const anyP = picos.some((d) => (d.v || 0) > 0);

    return { intensidad: anyI ? intensidad : [], picos: anyP ? picos : [] };
  }

  /* =========================================================
     INJECT (ESCANEO GLOBAL)
     ========================================================= */

  function injectForTable(root, table) {
    if (!table || table.dataset.chartDone === "1") return;

    const container = findStatContainerForTable(root, table);
    const stat = detectStatFromText(container.innerText || "");
    if (!stat) return;

    // Evitar que meta el chart en tablas “no target” dentro del mismo cuadro
    // (tomamos la última tabla del container como la “tabla principal”)
    const mainTable = findLastTableInContainer(container);
    if (mainTable !== table) return;

    // STAT 15/16/17
    if (stat === 15 || stat === 16 || stat === 17) {
      const data = parseTableForGP(table);
      if (!data.length) return;

      const wrap = wrapChartContainer("Gráfico: Ganadas vs Perdidas (por ítem)");
      wrap.appendChild(renderBarChartGP({ data, width: 520 }));

      table.insertAdjacentElement("afterend", wrap);
      table.dataset.chartDone = "1";
      return;
    }

    // STAT 12
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

  function scanAndInjectAll(root) {
    const tables = Array.from(root.querySelectorAll("table"));
    if (!tables.length) return;
    tables.forEach((t) => injectForTable(root, t));
  }

  /* =========================================================
     BOOTSTRAP
     ========================================================= */

  function start() {
    const root = document.getElementById("pea-level-4");
    if (!root) return;

    // intento inicial
    scanAndInjectAll(root);

    // observer: cada cambio => re-scan
    const obs = new MutationObserver(() => {
      scanAndInjectAll(root);
    });

    obs.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
