/* =========================================================
   STAT 10 — BALANZA CUMPLIMIENTO vs INTERFERENCIA
   (GANADA vs PERDIDA)

   Campus CFC LITE V41
   Nivel 3 — Comparación real (operativo)
   Estadística 10/18

   Derivación visual:
   - Usa MISMO universo que 8/18 y 9/18
   - Usa MISMOS SETS
   - No introduce nueva semántica
   - No interpreta
   ========================================================= */

(function () {

  window.renderStat_10_balanza_cumplimiento_interferencia = function () {

    const box = document.getElementById("pea-level-3");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r =>
      r?.meta?.estado === "VALIDO" || r?.meta?.estado === "CORREGIDO"
    );

    /* ===============================
       SETS (idénticos a 8/18 y 9/18)
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
       Acumuladores
       =============================== */

    const resumen = {
      GANADA: { total: 0, cumplimiento: 0, interferencia: 0 },
      PERDIDA: { total: 0, cumplimiento: 0, interferencia: 0 }
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

      const acciones = durante.acciones_keys;

      if (acciones.some(a => SET_CUMPLIMIENTO.has(a))) {
        resumen[resultado].cumplimiento++;
      }

      if (acciones.some(a => SET_INTERFERENCIA.has(a))) {
        resumen[resultado].interferencia++;
      }
    });

    function pct(v, t) {
      return t ? Math.round((v / t) * 100) : 0;
    }

    const g = resumen.GANADA;
    const p = resumen.PERDIDA;

    /* ===============================
       Render visual tipo balanza
       =============================== */

    const contenidoHTML = `
      <table class="pea-table">
        <thead>
          <tr>
            <th>Resultado</th>
            <th>Cumplimiento</th>
            <th>Interferencia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GANADA</td>
            <td>${pct(g.cumplimiento, g.total)}%</td>
            <td>${pct(g.interferencia, g.total)}%</td>
          </tr>
          <tr>
            <td>PERDIDA</td>
            <td>${pct(p.cumplimiento, p.total)}%</td>
            <td>${pct(p.interferencia, p.total)}%</td>
          </tr>
        </tbody>
      </table>

      <div class="pea-metricas-secundarias">
        Comparación visual entre acciones alineadas
        y acciones interferentes por resultado.<br>
        No interpreta ni mide gravedad.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 3,
      indice: 10,
      titulo: "Balanza Cumplimiento vs Interferencia",
      totalRegistros: fechas.length,
      universo: "Primer DURANTE por fecha con DESPUÉS = GANADA o PERDIDA",
      criterios: [
        "Cumplimiento = acción ∈ SET_CUMPLIMIENTO",
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
      indice: 10,
      titulo: "Balanza Cumplimiento vs Interferencia",
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
