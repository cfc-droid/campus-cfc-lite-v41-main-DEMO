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
    // 🔑 FILTRADO CORRECTO PARA STAT 13
    // Aplica todos los filtros EXCEPTO estado_registro
    // -------------------------------------------------
    const activeFilters = window.PEA_FILTERS.getActiveFilters
      ? window.PEA_FILTERS.getActiveFilters()
      : {};

    const filtered = all.filter(r => {
      for (const key in activeFilters) {
        if (key === "estado_registro") continue; // 👈 CLAVE
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
    // CONTADORES REALES
    // -------------------------------------------------
    const counters = {
      VALIDO: 0,
      CORRECCION: 0,
      ANULADO: 0
    };

    filtered.forEach(r => {
      const estado = r.estado_registro || "VALIDO";
      if (counters.hasOwnProperty(estado)) {
        counters[estado]++;
      }
    });

    const total = counters.VALIDO + counters.CORRECCION + counters.ANULADO;
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
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>VALIDO</td>
            <td>${counters.VALIDO}</td>
            <td>${pct(counters.VALIDO)}%</td>
          </tr>
          <tr>
            <td>CORRECCION</td>
            <td>${counters.CORRECCION}</td>
            <td>${pct(counters.CORRECCION)}%</td>
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
      universo: "Registros visibles (auditoría real, sin filtrar por estado)",
      criterios: [
        "Distribución REAL por estado del registro",
        "Ignora filtro estado_registro (auditoría)",
        "Respeta el resto de los filtros"
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
