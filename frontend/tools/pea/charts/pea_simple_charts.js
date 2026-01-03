/* =========================================================
   PEA_SIMPLE_CHARTS.JS
   Gráficos SVG ultra simples para PEA
   - Sin librerías
   - Sin estado
   - Exportables (PDF / PNG / DOC)
   ========================================================= */

(function () {

  /* ===============================
     BAR CHART (GANADA vs PERDIDA)
     =============================== */
  window.renderPEABarChart = function ({
    title = "",
    labels = [],
    values = [],
    colors = ["#2ECC71", "#E74C3C"],
    width = 320,
    height = 220
  }) {
    if (!labels.length || !values.length) {
      return `<div class="pea-empty">Sin datos para gráfico</div>`;
    }

    const max = Math.max(...values, 1);
    const barWidth = Math.floor((width - 40) / values.length);

    const bars = values.map((v, i) => {
      const h = Math.round((v / max) * (height - 60));
      const x = 30 + i * barWidth;
      const y = height - 30 - h;
      const color = colors[i % colors.length];

      return `
        <g>
          <rect x="${x}" y="${y}" width="${barWidth - 10}" height="${h}"
                fill="${color}" rx="4"></rect>
          <text x="${x + (barWidth - 10) / 2}" y="${y - 6}"
                text-anchor="middle" font-size="12" fill="#333">${v}</text>
          <text x="${x + (barWidth - 10) / 2}" y="${height - 10}"
                text-anchor="middle" font-size="12" fill="#333">${labels[i]}</text>
        </g>
      `;
    }).join("");

    return `
      <div class="pea-chart">
        ${title ? `<div class="pea-chart-title">${title}</div>` : ""}
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          ${bars}
        </svg>
      </div>
    `;
  };

  /* ===============================
     PIE CHART (DISTRIBUCIÓN)
     =============================== */
  window.renderPEAPieChart = function ({
    title = "",
    labels = [],
    values = [],
    colors = ["#3498DB", "#9B59B6", "#F1C40F", "#E67E22"],
    size = 220
  }) {
    if (!labels.length || !values.length) {
      return `<div class="pea-empty">Sin datos para gráfico</div>`;
    }

    const total = values.reduce((a, b) => a + b, 0);
    if (!total) {
      return `<div class="pea-empty">Sin datos para gráfico</div>`;
    }

    let cumulative = 0;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;

    function polarToCartesian(cx, cy, r, angle) {
      const rad = (angle - 90) * Math.PI / 180.0;
      return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad)
      };
    }

    function describeArc(cx, cy, r, startAngle, endAngle) {
      const start = polarToCartesian(cx, cy, r, endAngle);
      const end = polarToCartesian(cx, cy, r, startAngle);
      const largeArc = endAngle - startAngle <= 180 ? "0" : "1";

      return [
        "M", cx, cy,
        "L", start.x, start.y,
        "A", r, r, 0, largeArc, 0, end.x, end.y,
        "Z"
      ].join(" ");
    }

    const slices = values.map((v, i) => {
      const pct = v / total;
      const startAngle = cumulative * 360;
      cumulative += pct;
      const endAngle = cumulative * 360;

      return `
        <path d="${describeArc(cx, cy, r, startAngle, endAngle)}"
              fill="${colors[i % colors.length]}"></path>
      `;
    }).join("");

    const legend = labels.map((l, i) => `
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;">
        <span style="width:10px;height:10px;background:${colors[i % colors.length]};display:inline-block;"></span>
        ${l} (${Math.round((values[i] / total) * 100)}%)
      </div>
    `).join("");

    return `
      <div class="pea-chart">
        ${title ? `<div class="pea-chart-title">${title}</div>` : ""}
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${slices}
        </svg>
        <div class="pea-chart-legend">${legend}</div>
      </div>
    `;
  };

})();
