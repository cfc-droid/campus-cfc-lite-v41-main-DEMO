/* ============================================================
   PEA TABLE — BLOQUE 8 / 14
   Rol: Render de registros crudos (1 fila = 1 evidencia)
   ============================================================ */

const $ = (id) => document.getElementById(id);

/* ===== TAREA 22c — control VISUAL del alto del cuadro ===== */
let PEA_TABLE_LIMIT = 10;

function setTableLimit(value) {
  const v = parseInt(value, 10);
  if ([10, 15, 20].includes(v)) {
    PEA_TABLE_LIMIT = v;
    applyTableHeight();
  }
}

function applyTableHeight() {
  const box = document.querySelector(".pea-table-scroll");
  if (!box) return;

  const ROW_HEIGHT = 32;    // altura aproximada por fila (px)
  const HEADER_HEIGHT = 40; // header tabla

  box.style.maxHeight =
    (PEA_TABLE_LIMIT * ROW_HEIGHT + HEADER_HEIGHT) + "px";
}

/* ============================================================
   Helpers de render (SIN CAMBIOS LÓGICOS)
   ============================================================ */

function safeText(v) {
  if (v == null) return "";
  return String(v);
}

function renderAcciones(record) {
  const aks = Array.isArray(record?.acciones_keys)
    ? record.acciones_keys
    : [];
  return aks.length ? aks.join(", ") : "";
}

function renderEstadoE(record) {
  return record?.estado_key ? safeText(record.estado_key) : "";
}

function renderIntensidad(record) {
  return record?.intensidad == null
    ? ""
    : safeText(record.intensidad);
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

/* ============================================================
   Render de tabla (🔑 SIN LIMITE DE DATOS)
   ============================================================ */

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

  /* 🔑 Renderiza TODOS los registros filtrados */
  tbody.innerHTML = list.map(r => renderRow(r)).join("");
}

/* ============================================================
   Update principal
   ============================================================ */

function updateTable() {
  if (!window.PEA_STORAGE || !window.PEA_FILTERS) return;

  const all = window.PEA_STORAGE.loadPEALog();
  const filtered = window.PEA_FILTERS.apply(all);

  renderTable(filtered);
  applyTableHeight();
}

document.addEventListener("DOMContentLoaded", updateTable);
document.addEventListener("PEA_FILTERS_UPDATED", updateTable);

/* ============================================================
   API pública (selector 10 / 15 / 20)
   ============================================================ */

window.PEA_TABLE = {
  setLimit: setTableLimit
};
