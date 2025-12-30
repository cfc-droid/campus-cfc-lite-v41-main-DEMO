/* =========================================================
   STAT 02 — TOP PENSAMIENTOS EN PÉRDIDAS (ANTES)
   Campus CFC LITE V41

   Estadística 2/17

   Contrato:
   - Usa renderCuadroBasePEA REAL (pea_metrics.js)
   - Inserta manualmente en #pea-level-1
   - Resultado heredado por fecha desde DESPUÉS
   ========================================================= */

(function () {

  window.renderStat_02_top_pensamientos_perdidas = function () {

    const box = document.getElementById("pea-level-1");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r =>
      r?.meta?.estado === "VALIDO" || r?.meta?.estado === "CORREGIDO"
    );

    // ===============================
    // Fechas con PÉRDIDA (DESPUÉS)
    // ===============================
    const fechasPerdida = new Set(
      valid
        .filter(r =>
          r.momento === "DESPUÉS" &&
          r.resultado_operativo === "PERDIDA" &&
          r.fecha
        )
        .map(r => r.fecha)
    );

    if (fechasPerdida.size === 0) {
      renderEmpty(box);
      return;
    }

    // ===============================
    // Primer ANTES por fecha
    // ===============================
    const pensamientos = [];

    const seen = new Set();
    valid.forEach(r => {
      if (
        r.momento === "ANTES" &&
        fechasPerdida.has(r.fecha) &&
        !seen.has(r.fecha) &&
        r.pensamiento_key
      ) {
        pensamientos.push(r.pensamiento_key);
        seen.add(r.fecha);
      }
    });

    if (!pensamientos.length) {
      renderEmpty(box);
      return;
    }

    // ===============================
    // Conteo
    // ===============================
    const total = pensamientos.length;
    const map = {};
    pensamientos.forEach(p => (map[p] = (map[p] || 0) + 1));

    const rows = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count], i) => `
        <tr>
          <td>#${i + 1}</td>
          <td>${key}</td>
          <td>${count}</td>
          <td>${Math.round((count / total) * 100)}%</td>
        </tr>
      `)
      .join("");

    const contenidoHTML = `
      <table class="pea-table">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Pensamiento</th>
            <th>Cantidad</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    box.innerHTML = window.renderCuadroBasePEA({
      nivel: 1,
      indice: 2,
      titulo: "Top Pensamientos en Pérdidas (ANTES)",
      totalRegistros: total,
      universo: "Primer registro ANTES por fecha en días con DESPUÉS = PERDIDA",
      criterios: [
        "Resultado heredado por fecha desde DESPUÉS",
        "Solo registros VALIDO y CORREGIDO"
      ],
      contenidoHTML
    });
  };

  function renderEmpty(box) {
    box.innerHTML = window.renderCuadroBasePEA({
      nivel: 1,
      indice: 2,
      titulo: "Top Pensamientos en Pérdidas (ANTES)",
      totalRegistros: 0,
      universo: "—",
      criterios: null,
      contenidoHTML: `<div class="pea-empty">No hay evidencia suficiente para esta estadística.</div>`
    });
  }

})();
