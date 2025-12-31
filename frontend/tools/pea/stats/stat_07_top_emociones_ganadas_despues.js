/* =========================================================
   STAT 07 — TOP EMOCIONES EN GANADAS (DESPUÉS)
   Campus CFC LITE V41

   Estadística 7/17

   Contrato:
   - Cuadro SIEMPRE de 5 filas fijas:
     #1, #2, #3, OTRAS, TOTAL
   - Funciona con 1 o N datos
   - Resultado y emoción del mismo registro DESPUÉS
   ========================================================= */

(function () {

  window.renderStat_07_top_emociones_ganadas_despues = function () {

    const box = document.getElementById("pea-level-2");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r =>
      r?.meta?.estado === "VALIDO" || r?.meta?.estado === "CORREGIDO"
    );

    /* ===============================
       Registros DESPUÉS con GANADA
       =============================== */
    const registros = valid.filter(r =>
      r.momento === "DESPUÉS" &&
      r.resultado_operativo === "GANADA" &&
      r.estado_key &&
      Number.isInteger(r.intensidad)
    );

    const emociones = registros.map(r => r.estado_key);

    if (!emociones.length) {
      renderEmpty(box);
      return;
    }

    /* ===============================
       Conteo
       =============================== */
    const total = emociones.length;
    const map = {};
    emociones.forEach(e => (map[e] = (map[e] || 0) + 1));

    const ordered = Object.entries(map)
      .sort((a, b) => b[1] - a[1]);

    const top3 = ordered.slice(0, 3);
    const rest = ordered.slice(3);
    const otrasCount = rest.reduce((acc, [, c]) => acc + c, 0);

    /* ===============================
       Intensidad promedio y picos
       =============================== */
    const intensidades = registros.map(r => r.intensidad);

    const intensidadPromedio = intensidades.length
      ? (intensidades.reduce((a, b) => a + b, 0) / intensidades.length).toFixed(1)
      : null;

    const picosAltos = intensidades.filter(i => i >= 4).length;

    const porcentajePicos = intensidades.length
      ? Math.round((picosAltos / intensidades.length) * 100)
      : null;

    /* ===============================
       Construcción de filas FIJAS
       =============================== */
    const filas = [];

    for (let i = 0; i < 3; i++) {
      if (top3[i]) {
        const [key, count] = top3[i];
        filas.push(`
          <tr>
            <td>#${i + 1}</td>
            <td>${key}</td>
            <td>${count}</td>
            <td>${Math.round((count / total) * 100)}%</td>
          </tr>
        `);
      } else {
        filas.push(`
          <tr>
            <td>#${i + 1}</td>
            <td>—</td>
            <td>0</td>
            <td>0%</td>
          </tr>
        `);
      }
    }

    filas.push(`
      <tr>
        <td>OTRAS</td>
        <td>—</td>
        <td>${otrasCount}</td>
        <td>${Math.round((otrasCount / total) * 100)}%</td>
      </tr>
    `);

    filas.push(`
      <tr>
        <td>TOTAL</td>
        <td>—</td>
        <td>${total}</td>
        <td>100%</td>
      </tr>
    `);

    const contenidoHTML = `
      <table class="pea-table">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Emoción</th>
            <th>Cantidad</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          ${filas.join("")}
        </tbody>
      </table>

      <div class="pea-metricas-secundarias">
        <div><strong>Intensidad promedio:</strong> ${intensidadPromedio ?? "—"}</div>
        <div><strong>Picos de intensidad (4–5):</strong> ${porcentajePicos !== null ? porcentajePicos + "%" : "—"}</div>
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 2,
      indice: 7,
      titulo: "Top Emociones en Ganadas (DESPUÉS)",
      totalRegistros: total,
      universo: "Registros DESPUÉS con resultado = GANADA",
      criterios: [
        "Emoción tomada del mismo registro DESPUÉS",
        "Solo registros VALIDO y CORREGIDO"
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 2,
      indice: 7,
      titulo: "Top Emociones en Ganadas (DESPUÉS)",
      totalRegistros: 0,
      universo: "Registros DESPUÉS con resultado = GANADA",
      criterios: [
        "Existen registros PEA cargados",
        "No hay emociones válidas en DESPUÉS con GANADA"
      ],
      contenidoHTML: `
        <div class="pea-warning">
          ⚠️ Existen datos cargados, pero no hay registros
          <strong>DESPUÉS = GANADA</strong> con emoción válida.
          <br><br>
          El cuadro se muestra por integridad del sistema.
        </div>
      `
    }));
  }

})();
