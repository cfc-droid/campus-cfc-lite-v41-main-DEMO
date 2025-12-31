/* =========================================================
   STAT 12 — INTENSIDAD PROMEDIO + PICOS POR RESULTADO
   (GANADA vs PERDIDA)

   Campus CFC LITE V41
   Nivel 4 — Salud, estructura y cambios
   Estadística 12/18

   Contrato:
   - Usa SOLO registros DESPUÉS
   - Agrupa por resultado operativo (GANADA / PERDIDA)
   - Mide:
     • Intensidad promedio
     • % de picos (4–5)
   - No ranking
   - No acciones
   - No interpretación
   ========================================================= */

(function () {

  window.renderStat_12_intensidad_por_resultado = function () {

    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r =>
      (r?.meta?.estado === "VALIDO" || r?.meta?.estado === "CORREGIDO") &&
      r.momento === "DESPUÉS" &&
      Number.isInteger(r.intensidad) &&
      (r.resultado_operativo === "GANADA" || r.resultado_operativo === "PERDIDA")
    );

    if (!valid.length) {
      renderEmpty(box);
      return;
    }

    function calcularMetricas(resultado) {
      const regs = valid.filter(r => r.resultado_operativo === resultado);
      if (!regs.length) return { avg: "—", picos: "—", total: 0 };

      const intensidades = regs.map(r => r.intensidad);
      const avg = (intensidades.reduce((a, b) => a + b, 0) / intensidades.length).toFixed(1);
      const picos = Math.round(
        (intensidades.filter(i => i >= 4).length / intensidades.length) * 100
      );

      return { avg, picos, total: intensidades.length };
    }

    const ganadas = calcularMetricas("GANADA");
    const perdidas = calcularMetricas("PERDIDA");

    const contenidoHTML = `
      <table class="pea-table">
        <thead>
          <tr>
            <th>Resultado</th>
            <th>Registros</th>
            <th>Intensidad promedio</th>
            <th>% picos (4–5)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GANADA</td>
            <td>${ganadas.total}</td>
            <td>${ganadas.avg}</td>
            <td>${ganadas.picos}%</td>
          </tr>
          <tr>
            <td>PERDIDA</td>
            <td>${perdidas.total}</td>
            <td>${perdidas.avg}</td>
            <td>${perdidas.picos}%</td>
          </tr>
        </tbody>
      </table>

      <div class="pea-metricas-secundarias">
        Comparación emocional posterior al resultado.<br>
        No evalúa calidad operativa ni causalidad.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 12,
      titulo: "Intensidad promedio + picos por resultado",
      totalRegistros: ganadas.total + perdidas.total,
      universo: "Registros DESPUÉS con resultado GANADA o PERDIDA",
      criterios: [
        "Solo registros DESPUÉS",
        "Intensidad válida (1–5)",
        "Solo VALIDO y CORREGIDO"
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 12,
      titulo: "Intensidad promedio + picos por resultado",
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
