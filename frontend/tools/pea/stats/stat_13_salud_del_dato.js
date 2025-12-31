/* =========================================================
   STAT 13 — SALUD DEL DATO
   Campus CFC LITE V41
   ========================================================= */

(function () {

  window.renderStat_13_salud_del_dato = function () {

    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    if (!filtered.length) {
      renderEmpty(box);
      return;
    }

    const counters = {
      VALIDO: 0,
      CORREGIDO: 0,
      ANULADO: 0
    };

    filtered.forEach(r => {

      // 🔑 LECTURA ROBUSTA DEL ESTADO REAL
      const estado =
        r?.meta?.estado ||
        r?.estado_registro ||
        "VALIDO";

      if (counters.hasOwnProperty(estado)) {
        counters[estado]++;
      }
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
      nivel: 4,
      indice: 13,
      titulo: "Salud del dato",
      totalRegistros: total,
      universo: "Registros visibles según filtros activos",
      criterios: [
        "Distribución por estado del registro",
        "Respeta filtros activos",
        "Auditoría estructural del dataset"
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
