/* =========================================================
   STAT 11 — TOP INTERFERENCIAS POR RESULTADO
   (DURANTE)

   Campus CFC LITE V41
   Nivel 4 — Salud, estructura y cambios
   Estadística 11/18

   Desglose descriptivo de interferencias
   Agrupado por resultado final (GANADA / PERDIDA)

   No compara.
   No interpreta.
   No mide intensidad.
   ========================================================= */

(function () {

  window.renderStat_11_top_interferencias_por_resultado = function () {

    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r =>
      r?.meta?.estado === "VALIDO" || r?.meta?.estado === "CORREGIDO"
    );

    /* ===============================
       MISMO SET_INTERFERENCIA (8/18)
       =============================== */
    const SET_INTERFERENCIA = new Set([
      "Entré tarde",
      "Entré antes",
      "Entré sin señal",
      "Moví stop",
      "Aumenté tamaño",
      "No respeté tamaño",
      "Cerré antes",
      "Cerré tarde",
      "Dejé correr pérdida",
      "Re-entré sin señal",
      "Sobreoperé",
      "Operé fuera de horario"
    ]);

    /* ===============================
       Resultado final por fecha
       =============================== */
    const resultadoPorFecha = {};

    valid.forEach(r => {
      if (
        r.momento === "DESPUÉS" &&
        (r.resultado_operativo === "GANADA" ||
         r.resultado_operativo === "PERDIDA") &&
        r.fecha
      ) {
        resultadoPorFecha[r.fecha] = r.resultado_operativo;
      }
    });

    const fechas = Object.keys(resultadoPorFecha);
    if (!fechas.length) {
      renderEmpty(box);
      return;
    }

    /* ===============================
       Conteo de interferencias
       =============================== */
    const conteo = {
      GANADA: {},
      PERDIDA: {}
    };

    fechas.forEach(fecha => {
      const resultado = resultadoPorFecha[fecha];

      const durante = valid.find(r =>
        r.fecha === fecha &&
        r.momento === "DURANTE" &&
        Array.isArray(r.acciones_keys)
      );

      if (!durante) return;

      durante.acciones_keys.forEach(a => {
        if (!SET_INTERFERENCIA.has(a)) return;

        conteo[resultado][a] = (conteo[resultado][a] || 0) + 1;
      });
    });

    function buildList(obj) {
      const total = Object.values(obj).reduce((a, b) => a + b, 0);
      if (!total) return "<em>Sin interferencias registradas</em>";

      return Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => {
          const pct = Math.round((v / total) * 100);
          return `<li>${k} — ${pct}%</li>`;
        })
        .join("");
    }

    const contenidoHTML = `
      <div class="pea-columns">
        <div>
          <h4>PERDIDAS</h4>
          <ul>${buildList(conteo.PERDIDA)}</ul>
        </div>
        <div>
          <h4>GANADAS</h4>
          <ul>${buildList(conteo.GANADA)}</ul>
        </div>
      </div>

      <div class="pea-metricas-secundarias">
        Desglose descriptivo de interferencias DURANTE.<br>
        No compara, no interpreta, no establece causalidad.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 11,
      titulo: "Top Interferencias por Resultado (DURANTE)",
      totalRegistros: fechas.length,
      universo: "DURANTE con DESPUÉS = GANADA o PERDIDA",
      criterios: [
        "Acción ∈ SET_INTERFERENCIA",
        "Resultado heredado del registro DESPUÉS",
        "Solo registros VALIDO y CORREGIDO"
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 11,
      titulo: "Top Interferencias por Resultado (DURANTE)",
      totalRegistros: 0,
      universo: "—",
      criterios: null,
      contenidoHTML: `
        <div class="pea-empty">
          Evidencia insuficiente para esta estadística.
        </div>
      `
    }));
  }

})();
