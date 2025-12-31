/* =========================================================
   STAT 08 — ÍNDICE DE INTERFERENCIA
   (GANADA vs PERDIDA)

   Campus CFC LITE V41
   Nivel 3 — Comparación real (operativo)
   Estadística 8/17

   Interferencia = presencia de ≥1 acción
   ∈ SET_INTERFERENCIA durante el DURANTE
   ========================================================= */

(function () {

  window.renderStat_08_indice_interferencia = function () {

    const box = document.getElementById("pea-level-3");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r =>
      r?.meta?.estado === "VALIDO" || r?.meta?.estado === "CORREGIDO"
    );

    /* ===============================
       SET EXPLÍCITO DE INTERFERENCIA
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
       Co-ocurrencia DURANTE
       =============================== */
    const resumen = {
      GANADA: { total: 0, conInterferencia: 0 },
      PERDIDA: { total: 0, conInterferencia: 0 }
    };

    fechas.forEach(fecha => {
      const resultado = resultadoPorFecha[fecha];
      resumen[resultado].total++;

      const durante = valid.find(r =>
        r.fecha === fecha &&
        r.momento === "DURANTE" &&
        Array.isArray(r.acciones_keys)
      );

      if (!durante) return;

      const huboInterferencia = durante.acciones_keys.some(
        a => SET_INTERFERENCIA.has(a)
      );

      if (huboInterferencia) {
        resumen[resultado].conInterferencia++;
      }
    });

    function pct(p, t) {
      return t ? Math.round((p / t) * 100) : 0;
    }

    const g = resumen.GANADA;
    const p = resumen.PERDIDA;

    const contenidoHTML = `
      <table class="pea-table">
        <thead>
          <tr>
            <th>Resultado</th>
            <th>Días totales</th>
            <th>Días con interferencia</th>
            <th>% con interferencia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GANADA</td>
            <td>${g.total}</td>
            <td>${g.conInterferencia}</td>
            <td>${pct(g.conInterferencia, g.total)}%</td>
          </tr>
          <tr>
            <td>PERDIDA</td>
            <td>${p.total}</td>
            <td>${p.conInterferencia}</td>
            <td>${pct(p.conInterferencia, p.total)}%</td>
          </tr>
        </tbody>
      </table>

      <div class="pea-metricas-secundarias">
        Co-ocurrencia pura entre interferencia DURANTE
        y resultado final del día.<br>
        No mide gravedad ni tipo.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 3,
      indice: 8,
      titulo: "Índice de Interferencia (GANADA vs PERDIDA)",
      totalRegistros: fechas.length,
      universo: "Primer DURANTE por fecha con DESPUÉS = GANADA o PERDIDA",
      criterios: [
        "Interferencia = acción ∈ SET_INTERFERENCIA",
        "Resultado heredado del registro DESPUÉS",
        "Solo registros VALIDO y CORREGIDO"
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 3,
      indice: 8,
      titulo: "Índice de Interferencia (GANADA vs PERDIDA)",
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
