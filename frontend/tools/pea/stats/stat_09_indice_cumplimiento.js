/* =========================================================
   STAT 09 — ÍNDICE DE CUMPLIMIENTO
   (GANADA vs PERDIDA)

   Campus CFC LITE V41
   Nivel 3 — Comparación real (operativo)
   Estadística 9/18

   Cumplimiento = presencia de ≥1 acción
   ∈ SET_CUMPLIMIENTO durante el DURANTE

   No mide gravedad.
   No interpreta.
   Solo presencia / ausencia.
   ========================================================= */

(function () {

  window.renderStat_09_indice_cumplimiento = function () {

    const box = document.getElementById("pea-level-3");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r =>
      r?.meta?.estado === "VALIDO" || r?.meta?.estado === "CORREGIDO"
    );

    /* ===============================
       SET EXPLÍCITO DE CUMPLIMIENTO
       =============================== */
    const SET_CUMPLIMIENTO = new Set([
      "Respeté el stop",
      "Esperé señal",
      "Respeté el tamaño",
      "Operé según plan",
      "Cancelé operación inválida",
      "No operé sin señal",
      "Ejecuté sin interferencia",
      "Operé solo en horario",
      "Cerré según plan",
      "Reduje riesgo"
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
      GANADA: { total: 0, conCumplimiento: 0 },
      PERDIDA: { total: 0, conCumplimiento: 0 }
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

      const huboCumplimiento = durante.acciones_keys.some(
        a => SET_CUMPLIMIENTO.has(a)
      );

      if (huboCumplimiento) {
        resumen[resultado].conCumplimiento++;
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
            <th>Días con cumplimiento</th>
            <th>% con cumplimiento</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GANADA</td>
            <td>${g.total}</td>
            <td>${g.conCumplimiento}</td>
            <td>${pct(g.conCumplimiento, g.total)}%</td>
          </tr>
          <tr>
            <td>PERDIDA</td>
            <td>${p.total}</td>
            <td>${p.conCumplimiento}</td>
            <td>${pct(p.conCumplimiento, p.total)}%</td>
          </tr>
        </tbody>
      </table>

      <div class="pea-metricas-secundarias">
        Co-ocurrencia pura entre cumplimiento DURANTE
        y resultado final del día.<br>
        No mide gravedad ni tipo.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 3,
      indice: 9,
      titulo: "Índice de Cumplimiento (GANADA vs PERDIDA)",
      totalRegistros: fechas.length,
      universo: "Primer DURANTE por fecha con DESPUÉS = GANADA o PERDIDA",
      criterios: [
        "Cumplimiento = acción ∈ SET_CUMPLIMIENTO",
        "Resultado heredado del registro DESPUÉS",
        "Solo registros VALIDO y CORREGIDO"
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 3,
      indice: 9,
      titulo: "Índice de Cumplimiento (GANADA vs PERDIDA)",
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
