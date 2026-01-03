/* =========================================================
   CAMPUS CFC LITE — PEA
   ESTADÍSTICAS 12 → 17 INTEGRADAS
   + GRÁFICOS SVG INLINE (AUTO-INJECT ULTRA ROBUSTO)
   - No depende de #pea-level-4
   - Detecta bloques por "ESTADÍSTICA x/17"
   - Funciona aunque el render sea tardío o re-renderice
   ========================================================= */

(function () {
  "use strict";

  // ✅ DEBUG: si NO ves este log en consola, el archivo NO se está cargando.
  console.log("[PEA] stat_12_a_17_integrado.js LOADED");

  /* =========================================================
     UTILS
     ========================================================= */

  function qsAll(root, sel) {
    try { return Array.from(root.querySelectorAll(sel)); } catch { return []; }
  }

  function safeText(el) {
    return (el && (el.innerText || el.textContent) ? (el.innerText || el.textContent) : "").trim();
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

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    const r = el.getBoundingClientRect();
    return r.width > 10 && r.height > 10;
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

  function wrapChartContainer(title) {
    const div = document.createElement("div");
    // ✅ clase para que tu CSS lo estilice si querés
    div.className = "pea-inline-chart";
    // estilos inline de fallback (si el CSS no se cargó)
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

  // 2-series stacked: GANADAS vs PERDIDAS (Stats 15/16/17)
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

  // 1-series bars (Stat 12)
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
     DETECTION (bloques por texto "ESTADÍSTICA x/17")
     ========================================================= */

  function detectStatFromBlockText(txtRaw) {
    const txt = String(txtRaw || "");
    // match: "ESTADÍSTICA 15/17" o "ESTADISTICA 15/17"
    const m = txt.match(/ESTAD[ÍI]STICA\s+(\d+)\s*\/\s*17/i);
    if (m && m[1]) {
      const n = parseInt(m[1], 10);
      if ([12, 15, 16, 17].includes(n)) return n;
    }

    // fallback por keywords (por si cambian títulos)
    const low = txt.toLowerCase();
    if (low.includes("intensidad promedio") || low.includes("picos por resultado")) return 12;
    if (low.includes("acciones críticas")) return 15;
    if (low.includes("pensamientos críticos")) return 16;
    if (low.includes("estados") && low.includes("(e)")) return 17;
    if (low.includes("estados") && low.includes("por resultado")) return 17;

    return null;
  }

  function findStatBlocks() {
    // buscamos contenedores "grandes" que contengan la palabra ESTADÍSTICA
    // (tomamos padres razonables para que "la tabla" esté dentro)
    const hits = [];

    // 1) tu wrapper nuevo (si existe)
    qsAll(document, ".pea-cuadro-estadistico").forEach((b) => hits.push(b));

    // 2) fallback: cualquier elemento que tenga “ESTADÍSTICA x/17”
    // buscamos headers y subimos al contenedor más cercano con tabla
    const headers = qsAll(document, "h1,h2,h3,h4,div,section");
    headers.forEach((el) => {
      const t = safeText(el);
      if (!/ESTAD[ÍI]STICA\s+\d+\s*\/\s*17/i.test(t)) return;

      // subimos un poco para agarrar el bloque completo
      let block = el;
      for (let i = 0; i < 6; i++) {
        if (!block || !block.parentElement) break;
        // si el parent contiene una tabla, lo elegimos
        const p = block.parentElement;
        const hasTable = qsAll(p, "table, .pea-table, [role='table']").length > 0;
        if (hasTable) block = p;
        else block = p;
      }
      if (block) hits.push(block);
    });

    // dedupe
    return Array.from(new Set(hits)).filter((b) => b && b.nodeType === 1);
  }

  /* =========================================================
     TABLE FINDERS (tabla real o "table-like")
     ========================================================= */

  function findMainTableInBlock(block) {
    // preferimos la tabla que sea visible y que esté "cerca" del header
    const tables = qsAll(block, "table.pea-table, table, [role='table'], .pea-table");
    const vis = tables.filter(isVisible);
    const list = vis.length ? vis : tables;
    if (!list.length) return null;

    // tomamos la última (normalmente tu layout pone 1 tabla por stat al final del bloque)
    return list[list.length - 1];
  }

  function getRowsAndCells(tableLike) {
    // Caso A: <table>
    if (tableLike && tableLike.tagName && tableLike.tagName.toLowerCase() === "table") {
      const rows = qsAll(tableLike, "tbody tr");
      const out = rows.map((r) => qsAll(r, "td").map((td) => safeText(td)));
      return out.filter((r) => r && r.length);
    }

    // Caso B: role=table o divs con .pea-table (grid)
    // Intentamos detectar filas por [role=row] o .row
    const roleRows = qsAll(tableLike, "[role='row']");
    if (roleRows.length) {
      return roleRows
        .map((rr) => qsAll(rr, "[role='cell'], [role='gridcell'], td, div").map((c) => safeText(c)))
        .filter((r) => r && r.length && r.some((x) => x));
    }

    // Último fallback: si no podemos parsear, devolvemos vacío
    return [];
  }

  /* =========================================================
     PARSERS (12 vs 15/16/17)
     ========================================================= */

  function parseGPFromGrid(grid) {
    // esperamos algo tipo:
    // [CANTIDAD, NOMBRE, GANADAS, PERDIDAS, TOTAL]
    const out = [];
    grid.forEach((row) => {
      if (!row || row.length < 4) return;

      // tu label está en col 2 (index 1)
      const label = (row[1] || "").trim();
      if (!label || label === "—") return;

      const up = label.toUpperCase();
      if (up === "TOTALES" || up === "TOTAL") return;

      // ganadas/perdidas: col 3 y 4 (index 2,3) aunque vengan "2 (33%)"
      const g = parseIntLoose(row[2]);
      const p = parseIntLoose(row[3]);

      out.push({ label, g, p });
    });

    const anyNonZero = out.some((d) => (d.g || 0) + (d.p || 0) > 0);
    return anyNonZero ? out : [];
  }

  function parseIntensityFromGrid(grid) {
    // esperamos:
    // [Resultado, Registros, Intensidad promedio, % picos]
    const intensidad = [];
    const picos = [];

    grid.forEach((row) => {
      if (!row || row.length < 4) return;

      const resultado = (row[0] || "").trim(); // GANADA / PERDIDA
      if (!resultado || resultado === "—") return;

      const up = resultado.toUpperCase();
      if (up === "TOTALES" || up === "TOTAL") return;

      const inten = parseFloatLoose(row[2]);
      const pico = parseIntLoose(row[3]);

      intensidad.push({ label: resultado, v: Number.isFinite(inten) ? inten : 0 });
      picos.push({ label: resultado, v: Number.isFinite(pico) ? pico : 0 });
    });

    const anyI = intensidad.some((d) => (d.v || 0) > 0);
    const anyP = picos.some((d) => (d.v || 0) > 0);

    return { intensidad: anyI ? intensidad : [], picos: anyP ? picos : [] };
  }

  /* =========================================================
     INJECTION (por bloque)
     ========================================================= */

  function injectIntoBlock(block) {
    if (!block || block.dataset.peaChartDone === "1") return;

    const txt = safeText(block);
    if (!txt) return;

    const stat = detectStatFromBlockText(txt);
    if (![12, 15, 16, 17].includes(stat)) return;

    const tableLike = findMainTableInBlock(block);
    if (!tableLike) return;

    const grid = getRowsAndCells(tableLike);
    if (!grid.length) return;

    // ya lo hicimos?
    if (block.dataset.peaChartDone === "1") return;

    // --- STAT 15/16/17
    if (stat === 15 || stat === 16 || stat === 17) {
      const data = parseGPFromGrid(grid);
      if (!data.length) return;

      const wrap = wrapChartContainer("Gráfico: Ganadas vs Perdidas (por ítem)");
      wrap.appendChild(renderBarChartGP({ data, width: 520 }));

      // Insertamos después de la tabla (si es table real) o al final del bloque
      if (tableLike.insertAdjacentElement) {
        tableLike.insertAdjacentElement("afterend", wrap);
      } else {
        block.appendChild(wrap);
      }

      block.dataset.peaChartDone = "1";
      return;
    }

    // --- STAT 12
    if (stat === 12) {
      const parsed = parseIntensityFromGrid(grid);
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

      if (tableLike.insertAdjacentElement) {
        tableLike.insertAdjacentElement("afterend", wrap);
      } else {
        block.appendChild(wrap);
      }

      block.dataset.peaChartDone = "1";
      return;
    }
  }

  function scanAll() {
    const blocks = findStatBlocks();
    if (!blocks.length) return;
    blocks.forEach(injectIntoBlock);
  }

  /* =========================================================
     BOOTSTRAP (Observer + Interval)
     ========================================================= */

  function start() {
    // intento inicial
    scanAll();

    // observer global (porque no sabemos qué root exacto cambia)
    const obs = new MutationObserver(() => {
      scanAll();
    });

    obs.observe(document.documentElement, { childList: true, subtree: true });

    // interval de respaldo (por renders que pisan el DOM o llegan tarde)
    let ticks = 0;
    const iv = setInterval(() => {
      ticks++;
      scanAll();
      // 30 ticks * 500ms = 15s de refuerzo
      if (ticks >= 30) clearInterval(iv);
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
