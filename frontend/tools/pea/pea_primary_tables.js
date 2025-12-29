/* ============================================================
   PEA PRIMARY TABLES — BLOQUE 8.5 / 14
   Rol: Render TABLAS de lectura primaria (frío / Excel)
   ============================================================ */

const $ = (id) => document.getElementById(id);

function renderSection(title, data) {
  if (!data || !data.total) {
    return `<div class="pea-empty">Evidencia insuficiente</div>`;
  }

  const rows = data.top.map(t => `
    <tr>
      <td>${t.key}</td>
      <td>${t.count}</td>
      <td>${t.pct}%</td>
    </tr>
  `).join("");

  return `
    <h4>${title}</h4>
    <table class="pea-table">
      <thead>
        <tr>
          <th>Clave</th>
          <th>Frecuencia</th>
          <th>%</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function renderPrimaryTables(result) {
  if (!result) {
    return `<div class="pea-empty">Evidencia insuficiente para lectura primaria.</div>`;
  }

  return `
    <div class="pea-primary-block">

      <h3>🔴 PERDEDORAS</h3>
      ${renderSection("ANTES — Pensamiento", result.PERDEDORAS.ANTES)}
      ${renderSection("DURANTE — Acción", result.PERDEDORAS.DURANTE)}
      ${renderSection("DESPUÉS — Estado", result.PERDEDORAS.DESPUES)}

      <h3>🟢 GANADORAS</h3>
      ${renderSection("ANTES — Pensamiento", result.GANADORAS.ANTES)}
      ${renderSection("DURANTE — Acción", result.GANADORAS.DURANTE)}
      ${renderSection("DESPUÉS — Estado", result.GANADORAS.DESPUES)}

    </div>
  `;
}

/* =========================
   API
   ========================= */

window.PEA_PRIMARY_TABLES = {
  render(result) {
    return renderPrimaryTables(result);
  }
};
