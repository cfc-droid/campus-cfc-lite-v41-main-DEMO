/* =========================================================
   STAT 06 — TOP ACCIONES EN GANADAS (DURANTE)
   Campus CFC LITE V41

   Estadística 6/17

   Contrato:
   - Cuadro SIEMPRE de 5 filas fijas:
     #1, #2, #3, OTRAS, TOTAL
   - Funciona con 1 o N datos
   - Resultado heredado por fecha desde DESPUÉS
   - Usa primer registro DURANTE por fecha
   ========================================================= */

(function () {

  window.renderStat_06_top_acciones_ganadas = function () {

    const box = document.getElementById("pea-level-2");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r =>
      r?.meta?.estado === "VALIDO" || r?.meta?.estado === "CORREGIDO"
    );

    /* ===============================
       Fechas con GANADA (DESPUÉS)
       =============================== */
    const fechasGanada = new Set(
      valid
        .filter(r =>
          r.momento === "DESPUÉS" &&
          r.resultado_operativo === "GANADA" &&
          r.fecha
        )
        .map(r => r.fecha)
    );

    if (!fechasGanada.size) {
      renderEmpty(box);
      return;
    }

    /* ===============================
       Primer DURANTE por fecha
       =============================== */
    const acciones = [];
    const seen = new Set();

    valid.forEach(r => {
      if (
        r.momento === "DURANTE" &&
        fechasGanada.has(r.fecha) &&
        !seen.has(r.fecha) &&
        Array.isArray(r.acciones_keys)
      ) {
        acciones.push(...r.acciones_keys);
        seen.add(r.fecha);
      }
    });

    if (!acciones.length) {
      renderEmpty(box);
      return;
    }

    /* ===============================
       Conteo
       =============================== */
    const total = acciones.length;
    const map = {};
    acciones.forEach(a => (map[a] = (map[a] || 0) + 1));

    const ordered = Object.entries(map)
      .sort((a, b) => b[1] - a[1]);

    const top3 = ordered.slice(0, 3);
    const rest = ordered.slice(3);
    const otrasCount = rest.reduce((acc, [, c]) => acc + c, 0);

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
            <th>Acción</th>
            <th>Cantidad</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          ${filas.join("")}
        </tbody>
      </table>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 2,
      indice: 6,
      titulo: "Top Acciones en Ganadas (DURANTE)",
      totalRegistros: total,
      universo: "Primer registro DURANTE por fecha en días con DESPUÉS = GANADA",
      criterios: [
        "Resultado heredado por fecha desde DESPUÉS",
        "Solo registros VALIDO y CORREGIDO"
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 2,
      indice: 6,
      titulo: "Top Acciones en Ganadas (DURANTE)",
      totalRegistros: 0,
      universo: "Registros existentes, pero sin combinación válida",
      criterios: [
        "Existen registros PEA cargados",
        "No hay días con DESPUÉS = GANADA que tengan DURANTE válido",
        "La estadística no puede calcularse sin forzar el dato"
      ],
      contenidoHTML: `
        <div class="pea-warning">
          ⚠️ Existen datos cargados, pero no se encontró ningún día que cumpla:
          <br><br>
          <strong>DESPUÉS = GANADA + DURANTE válido</strong>
          <br><br>
          El cuadro se muestra por integridad del sistema, no como resultado estadístico.
        </div>
      `
    }));
  }

})();
