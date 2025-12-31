/* =========================================================
   STAT 13 — SALUD DEL DATO
   Campus CFC LITE V41
   ========================================================= */

(function () {

  window.renderStat_13_salud_del_dato = function () {

    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];

    // -------------------------------------------------
    // 🔍 Aplicar TODOS los filtros EXCEPTO estado_registro
    // (auditoría real de salud del dataset)
    // -------------------------------------------------
    const activeFilters = window.PEA_FILTERS.getActiveFilters
      ? window.PEA_FILTERS.getActiveFilters()
      : {};

    const filtered = all.filter(r => {
      for (const key in activeFilters) {
        if (key === "estado_registro") continue;
        if (activeFilters[key] == null || activeFilters[key] === "") continue;
        if (r[key] !== activeFilters[key]) return false;
      }
      return true;
    });

    if (!filtered.length) {
      renderEmpty(box);
      return;
    }

    // -------------------------------------------------
    // CONTADORES REALES (alineados al dataset)
    // -------------------------------------------------
    const counters = {
      VALIDO: 0,
      CORREGIDO: 0,
      ANULADO: 0
    };

    filtered.forEach(r => {
      const estado = (r.estado_registro || "VALIDO").toUpperCase();

      if (estado === "VALIDO") counters.VALIDO++;
      else if (estado === "CORREGIDO") counters.CORREGIDO++;
      else if (estado === "ANULADO") counters.ANULADO++;
    });

    const total = counters.VALIDO + counters.CORREGIDO + counters.ANULADO;

    if (!total) {
      renderEmpty(box);
      return;
    }

    const pct = v => Math.round((v / total) * 100);

    const contenidoHTML = `
      <table class="pea-table">
        <thead>
          <tr>
            <th>Estado</th>
            <th>Cantidad</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>VALIDO</td>
            <td>${counters.VALIDO}</td>
            <td>${pct(counters.VALIDO)}%</td>
          </tr>
          <tr>
            <td>CORREGIDO</td>
            <td>${counters.CORREGIDO}</td>
            <td>${pct(counters.CORREGIDO)}%</td>
          </tr>
          <tr>
            <td>ANULADO</td>
            <td>${counters.ANULADO}</td>
            <td>${pct(counters.ANULADO)}%</td>
          </tr>
          <tr>
            <td><strong>TOTAL</strong></td>
            <td><strong>${total}</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tbody>
      </table>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 13,
      titulo: "Salud del dato",
      totalRegistros: total,
      universo: "Registros visibles (auditoría estructural)",
      criterios: [
        "Distribución real por estado del registro",
        "Ignora filtro estado_registro",
        "Evalúa confiabilidad del dataset"
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 13,
      titulo: "Salud del dato",
      totalRegistros: 0,
      universo: "—",
      criterios: null,
      contenidoHTML: `
        <div class="pea-empty">
          No hay registros visibles para evaluar la salud del dato.
        </div>
      `
    }));
  }

})();
