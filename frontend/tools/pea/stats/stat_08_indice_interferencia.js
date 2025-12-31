/* =========================================================
   STAT 08 — ÍNDICE DE INTERFERENCIA
   (GANADA vs PERDIDA)

   Campus CFC LITE V41
   Nivel 3 — Comparación real (operativo)
   Estadística 8/17

   Pregunta:
   ¿Cuántos días con interferencia terminan en GANADA
   vs cuántos terminan en PERDIDA?

   Definición de interferencia:
   - Presencia de ≥1 acción DURANTE
     que NO sea de cumplimiento del plan

   No mide gravedad.
   No interpreta.
   Solo presencia / ausencia.
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
       Acciones consideradas LIMPIAS
       =============================== */
    const ACCIONES_SIN_INTERFERENCIA = new Set([
      "Cumplí plan",
      "Respeté el stop",
      "Respeté el tamaño",
      "Esperé confirmación",
      "Cancelé operación inválida",
      "Ejecuté sin interferencia",
      "No operé sin señal",
      "Operé solo en horario",
      "Cerré según plan",
      "Reduí riesgo"
    ]);

    /* ===============================
       Fechas con resultado final
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
       Detectar interferencia DURANTE
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
        a => !ACCIONES_SIN_INTERFERENCIA.has(a)
      );

      if (huboInterferencia) {
        resumen[resultado].conInterferencia++;
      }
    });

    /* ===============================
       Cálculo porcentajes
       =============================== */
    function pct(parte, total) {
      return total ? Math.round((parte / total) * 100) : 0;
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
        <strong>Interpretación operativa:</strong><br>
        Comparación directa entre presencia de interferencia DURANTE
        y resultado final del día.<br>
        No mide intensidad ni tipo, solo co-ocurrencia.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 3,
      indice: 8,
      titulo: "Índice de Interferencia (GANADA vs PERDIDA)",
      totalRegistros: fechas.length,
      universo: "Primer DURANTE por fecha con DESPUÉS = GANADA o PERDIDA",
      criterios: [
        "Interferencia = ≥1 acción DURANTE no alineada al plan",
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
          No hay días con resultado GANADA o PERDIDA
          y registro DURANTE válido.
        </div>
      `
    }));
  }

})();
