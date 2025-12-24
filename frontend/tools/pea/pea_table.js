/* ============================================================
   PEA TABLE — HISTORIAL PURO
   Sistema: Análisis (PEA)
   Bloque: 8/14 — Pantalla 3
   Rol: Renderizar registros (NO filtra, NO calcula)
   ============================================================ */

/**
 * Renderiza una tabla simple de registros PEA
 * @param {HTMLElement} container
 * @param {Array} records - Array de PEARecord
 */
export function renderPEATable(container, records) {
  if (!container) return;

  container.innerHTML = "";

  if (!Array.isArray(records) || records.length === 0) {
    container.innerHTML = `<p style="opacity:.6">Sin registros para mostrar</p>`;
    return;
  }

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "10px";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Momento</th>
        <th>Pensamiento</th>
        <th>Estado</th>
        <th>Acciones</th>
        <th>Riesgo</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  records.forEach(record => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatDate(record.createdAtISO)}</td>
      <td>${record.momento || "—"}</td>
      <td>${record.P?.pensamientoKey || "—"}</td>
      <td>${record.E?.estadoKey || "—"} (${record.E?.intensidad ?? "—"})</td>
      <td>${(record.A?.accionesKeys || []).join(", ")}</td>
      <td>${record.computed?.riesgoLabel || "—"}</td>
    `;

    tr.style.borderBottom = "1px solid #333";
    tbody.appendChild(tr);
  });

  table.querySelectorAll("th, td").forEach(cell => {
    cell.style.padding = "8px";
    cell.style.fontSize = "0.9rem";
    cell.style.textAlign = "left";
  });

  container.appendChild(table);
}

/* =========================
   HELPERS
   ========================= */

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  } catch {
    return "—";
  }
}
