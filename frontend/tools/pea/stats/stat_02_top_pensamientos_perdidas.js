/* =========================================================
   STAT 02 — TOP PENSAMIENTOS EN PÉRDIDAS (ANTES)
   Campus CFC LITE V41

   Estadística 2/17
   ========================================================= */

(function () {

  window.renderStat_02_top_pensamientos_perdidas = function () {

    const box = document.getElementById("pea-level-1");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r =>
      r?.meta?.estado === "VALIDO" || r?.meta?.estado === "CORREGIDO"
    );

    const fechasPerdida = new Set(
      valid
        .filter(r =>
          r.momento === "DESPUÉS" &&
          r.resultado_operativo === "PERDIDA" &&
          r.fecha
        )
        .map(r => r.fecha)
    );

    if (!fechasPerdida.size) {
      renderEmpty(box);
      return;
    }

    const pensamientos = [];
    const seen = new Set();

    valid.forEach(r => {
      if (
        r.momento === "ANTES" &&
        fechasPerdida.has(r.fecha) &&
        !seen.has(r.fecha) &&
        r.pensamiento_key
      ) {
        pensamientos.push(r.pensamiento_key);
        seen.add(r.fecha);
      }
    });

    if (!pensamientos.length) {
      renderEmpty(box);
      return;
    }

    const total = pensamientos.length;
    const map = {};
    pensamientos.forEach(p => (map[p] = (map[p] || 0) + 1));

    const ordered = Object.entries(map)
      .sort((a, b) => b[1] - a[1]);

    const top3 = ordered.slice(0, 3);
    const rest = ordered.slice(3);
    const otrasCount = rest.reduce((acc, [, c]) => acc + c, 0);

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
            <th>Pensamiento</th>
            <th>Cantidad</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          ${filas.join("")}
        </tbody>
      </table>
    `;

    // ✅ CLAVE: cierre correcto })); (si no, el script MUERE)
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 1,
      indice: 2,
      titulo: "Top Pensamientos en Pérdidas (ANTES)",
      totalRegistros: total,
      universo: "Primer registro ANTES por fecha en días con DESPUÉS = PERDIDA",
      criterios: [
        "Resultado heredado por fecha desde DESPUÉS",
        "Solo registros VALIDO y CORREGIDO"
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box) {
    // ✅ Siempre muestra cuadro (tu “opción B”), pero SIN romper sintaxis
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 1,
      indice: 2,
      titulo: "Top Pensamientos en Pérdidas (ANTES)",
      totalRegistros: 0,
      universo: "Registros existentes, pero sin combinación válida",
      criterios: [
        "Existen registros PEA cargados",
        "No hay días con DESPUÉS = PERDIDA que tengan ANTES válido",
        "La estadística no puede calcularse sin forzar el dato"
      ],
      contenidoHTML: `
        <div class="pea-warning">
          ⚠️ Existen datos cargados, pero no se encontró ningún día que cumpla:
          <br><br>
          <strong>DESPUÉS = PERDIDA + ANTES válido</strong>
          <br><br>
          El cuadro se muestra por integridad del sistema, no como resultado estadístico.
        </div>
      `
    }));
  }

})();
