/* =========================================================
   STAT 13 — SALUD DEL DATO
   Campus CFC LITE V41

   Rol:
   Auditoría estructural del dataset.
   No interpreta, no evalúa conducta, no infiere causalidad.

   Estadística 13/17
   NIVEL 0 — INFORMACIÓN A CORROBORRAR / COMPLETAR
   ========================================================= */

(function () {

  window.renderStat_13_salud_del_dato = function () {

    const box = document.getElementById("pea-level-0");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    if (!filtered.length) {
      renderEmpty(box);
      return;
    }

    /* ===============================
       Conteo por estado del registro
       =============================== */

    const counters = {
      VALIDO: 0,
      CORREGIDO: 0,
      ANULADO: 0
    };

    filtered.forEach(r => {
      const estado = r?.meta?.estado || "VALIDO";
      if (counters.hasOwnProperty(estado)) {
        counters[estado]++;
      }
    });

    const total = counters.VALIDO + counters.CORREGIDO + counters.ANULADO;

    if (!total) {
      renderEmpty(box);
      return;
    }

    function pct(v) {
      return Math.round((v / total) * 100);
    }

    /* ===============================
       Tabla estructural (sin ranking)
       =============================== */

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
      nivel: 0,
      indice: 13,
      titulo: "Salud del dato",
      totalRegistros: total,
      universo: "Registros visibles según filtros activos",
      criterios: [
        "Incluye todos los estados del registro",
        "Respeta filtros activos",
        "No interpreta resultados"
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 0,
      indice: 13,
      titulo: "Salud del dato",
      totalRegistros: 0,
      universo: "—",
      criterios: null,
      contenidoHTML: `
        <div class="pea-empty">
          No hay registros suficientes para evaluar la salud del dato.
        </div>
      `
    }));
  }

})();
