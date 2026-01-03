/* =========================================================
   CAMPUS CFC LITE — PEA
   ESTADÍSTICAS 12 → 17 INTEGRADAS
   + GRÁFICOS SVG INLINE
   ========================================================= */

(function () {

  /* =========================================================
     SVG BAR CHART GENERIC
     ========================================================= */
  function renderBarChart({ data, width = 420 }) {
    const barH = 18;
    const gap = 8;
    const max = Math.max(...data.map(d => (d.g + d.p)), 1);
    const height = data.length * (barH + gap) + 20;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.style.margin = "12px 0 20px";
    svg.style.display = "block";

    data.forEach((d, i) => {
      const y = 10 + i * (barH + gap);
      const usableW = (width - 140);

      const gW = (d.g / max) * usableW;
      const pW = (d.p / max) * usableW;

      svg.appendChild(rect(120, y, gW, barH, "#3fb950"));
      svg.appendChild(rect(120 + gW, y, pW, barH, "#f85149"));

      svg.appendChild(text(0, y + 13, d.label));
      svg.appendChild(text(125 + gW + pW + 6, y + 13, `${d.g}/${d.p}`));
    });

    return svg;
  }

  function rect(x, y, w, h, fill) {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", String(x));
    r.setAttribute("y", String(y));
    r.setAttribute("width", String(Math.max(0, w)));
    r.setAttribute("height", String(h));
    r.setAttribute("rx", "4");
    r.setAttribute("fill", fill);
    return r;
  }

  function text(x, y, txt) {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", String(x));
    t.setAttribute("y", String(y));
    t.setAttribute("fill", "#ddd");
    t.setAttribute("font-size", "12");
    t.textContent = String(txt ?? "");
    return t;
  }

  /* =========================================================
     POST-RENDER INJECTION
     ========================================================= */
  function injectCharts(indice) {
    const box = document.getElementById("pea-level-4");
    if (!box) return;

    // Tomar la ÚLTIMA tabla renderizada (normalmente corresponde al último cuadro insertado)
    const tables = box.querySelectorAll(".pea-table");
    const table = tables.length ? tables[tables.length - 1] : null;
    if (!table) return;

    // Evitar duplicados
    if (table.dataset.chartDone === "1") return;

    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const data = [];

    rows.forEach((r) => {
      const tds = r.querySelectorAll("td");
      if (!tds || !tds.length) return;

      const label = (tds[1]?.innerText || "").trim();
      if (!label || label === "—" || label.toUpperCase() === "TOTALES") return;

      const g = parseInt((tds[2]?.innerText || "").trim(), 10) || 0;
      const p = parseInt((tds[3]?.innerText || "").trim(), 10) || 0;

      // Si ambos son 0, igual puede ser info útil, pero normalmente son filas vacías.
      // Lo dejamos pasar igual para que el gráfico refleje lo que muestra la tabla.
      data.push({ label, g, p });
    });

    if (!data.length) return;

    const chart = renderBarChart({ data });

    // Insertar después de la tabla
    table.insertAdjacentElement("afterend", chart);
    table.dataset.chartDone = "1";
  }

  /* =========================================================
     HOOK FINAL (Stats 12 → 17)
     ========================================================= */
  const originalInsert = HTMLElement.prototype.insertAdjacentHTML;

  HTMLElement.prototype.insertAdjacentHTML = function (pos, html) {
    originalInsert.call(this, pos, html);

    if (this && this.id === "pea-level-4") {
      setTimeout(() => {
        // CLAVE: tomar el ÚLTIMO título, no el primero.
        const hs = this.querySelectorAll("h3, h4");
        const h = hs.length ? hs[hs.length - 1] : null;
        if (!h) return;

        const txt = (h.innerText || "").trim();

        // Match tolerante (según tus títulos reales)
        if (txt.includes("Acciones críticas")) injectCharts(15);
        if (txt.includes("Pensamientos críticos")) injectCharts(16);
        if (txt.includes("Estados")) injectCharts(17); // más robusto que "Estados (E)"
      }, 0);
    }
  };

})();
