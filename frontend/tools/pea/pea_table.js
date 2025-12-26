/* ============================================================
   PEA TABLE — BLOQUE 8 / 14
   Rol: Render de registros crudos (1 fila = 1 evidencia)
   ============================================================ */

const $ = (id) => document.getElementById(id);

/* =========================
   RENDER PRINCIPAL
   ========================= */

function renderTable(records) {
  const tbody = $("pea-history-tbody");
  tbody.innerHTML = "";

  if (!records || records.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="8" class="pea-empty">
        Evidencia insuficiente
      </td>
    `;
    tbody.appendChild(tr);
    return;
  }

  records.forEach(record => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${record.fecha || ""}</td>
      <td>${record.momento || ""}</td>
      <td>${record.pensamiento_key || ""}</td>
      <td>${renderEstado(record)}</td>
      <td>${renderAcciones(record)}</td>
      <td>${record.direccion || ""}</td>
      <td>${record.nota_factual || ""}</td>
      <td>${record.meta?.estado || "VALIDO"}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* =========================
   HELPERS DE RENDER
   ========================= */

function renderEstado(record) {
  if (!record.estado_key) return "";
  if (record.intensidad == null) return record.estado_key;
  return `${record.estado_key} (${record.intensidad})`;
}

function renderAcciones(record) {
  if (!Array.isArray(record.acciones_keys)) return "";
  return record.acciones_keys.join(", ");
}

/* =========================
   ORQUESTADOR
   ========================= */

function updateTable() {
  if (!window.PEA_STORAGE || !window.PEA_FILTERS) return;

  const allRecords = window.PEA_STORAGE.loadPEALog();
  const filtered = window.PEA_FILTERS.apply(allRecords);

  renderTable(filtered);
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", updateTable);
document.addEventListener("PEA_FILTERS_UPDATED", updateTable);
