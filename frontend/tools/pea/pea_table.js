/* ============================================================
   PEA TABLE — BLOQUE 8 / 14
   Rol: Render de registros crudos (1 fila = 1 evidencia)
   ============================================================ */

const $ = (id) => document.getElementById(id);

/* ===== TAREA 22c — control de filas visibles ===== */
let PEA_TABLE_LIMIT = 10;

function setTableLimit(value) {
  const v = parseInt(value, 10);
  if ([10, 15, 20].includes(v)) {
    PEA_TABLE_LIMIT = v;
    updateTable();
  }
}

function safeText(v) {
  if (v == null) return "";
  return String(v);
}

function renderAcciones(record) {
  const aks = Array.isArray(record?.acciones_keys) ? record.acciones_keys : [];
  return aks.length ? aks.join(", ") : "";
}

function renderEstadoE(record) {
  const e = record?.estado_key ? safeText(record.estado_key) : "";
  return e;
}

function renderIntensidad(record) {
  return record?.intensidad == null ? "" : safeText(record.intensidad);
}

function renderRow(record) {
  const estadoRegistro = record?.meta?.estado || "VALIDO";

  return `
    <tr>
      <td>${safeText(record?.fecha)}</td>
      <td>${safeText(record?.momento)}</td>
      <td>${safeText(record?.pensamiento_key)}</td>
      <td>${renderEstadoE(record)}</td>
      <td>${renderIntensidad(record)}</td>
      <td>${safeText(renderAcciones(record))}</td>
      <td>${safeText(record?.direccion)}</td>
      <td>${safeText(record?.activo)}</td>
      <td>${safeText(record?.activo_otros)}</td>
      <td>${safeText(record?.instrumento)}</td>
      <td>${safeText(record?.instrumento_otros)}</td>
      <td>${safeText(record?.nota_factual)}</td>
      <td>${safeText(estadoRegistro)}</td>
      <td>${safeText(record?.id)}</td>
    </tr>
  `;
}

function renderTable(records) {
  const tbody = $("pea-table-body");
  const empty = $("pea-table-empty");

  if (!tbody) return;

  const list = Array.isArray(records) ? records : [];
  tbody.innerHTML = "";

  if (list.length === 0) {
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";

  /* ===== aplicar límite visual ===== */
  const limited = list.slice(0, PEA_TABLE_LIMIT);

  const html = limited.map(r => renderRow(r)).join("");
  tbody.innerHTML = html;
}

function updateTable() {
  if (!window.PEA_STORAGE || !window.PEA_FILTERS) return;

  const all = window.PEA_STORAGE.loadPEALog();
  const filtered = window.PEA_FILTERS.apply(all);

  renderTable(filtered);
}

document.addEventListener("DOMContentLoaded", updateTable);
document.addEventListener("PEA_FILTERS_UPDATED", updateTable);

/* ===== expuesto para selector ===== */
window.PEA_TABLE = {
  setLimit: setTableLimit
};
