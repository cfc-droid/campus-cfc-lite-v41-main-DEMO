/* ============================================================
   PEA TABLE — BLOQUE 8 / 14
   Rol: Render de registros crudos
   ============================================================ */

const $ = (id) => document.getElementById(id);

/* ============================================================
   TAREA 22c — control REAL de registros visibles
   ============================================================ */

let PEA_TABLE_LIMIT = 10;

function setTableLimit(value) {
  const v = parseInt(value, 10);
  if (![10, 15, 20].includes(v)) return;

  PEA_TABLE_LIMIT = v; // ✅ guardo el valor seleccionado

  const container = document.querySelector(".pea-table-scroll");
  const table = container?.querySelector("table");
  if (!container || !table) return;

  const tbodyRows = table.querySelectorAll("tbody tr");
  if (!tbodyRows || tbodyRows.length === 0) return;

  const headerHeight = table.querySelector("thead")?.getBoundingClientRect().height || 0;

  // ✅ SUMA REAL de alturas de las primeras N filas (no aproximación)
  let rowsHeight = 0;
  const n = Math.min(v, tbodyRows.length);

  for (let i = 0; i < n; i++) {
    rowsHeight += tbodyRows[i].getBoundingClientRect().height;
  }

  const total = Math.ceil(headerHeight + rowsHeight);

  // ✅ Altura exacta para que entren N filas completas
  container.style.height = `${total}px`;
  container.style.maxHeight = `${total}px`;

  // ✅ IMPORTANTE: sin scroll interno; el scroll es el de la página
  container.style.overflow = "visible";
}

/* ============================================================
   Helpers
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

function renderRowActions(record) {
  const estado = record?.meta?.estado || "VALIDO";
  const id = record?.id;

  if (!id) return "";

  if (estado === "ANULADO") {
    return "—";
  }

  return `
    <button onclick="handleAnular('${id}')">Anular</button>
    <button onclick="handleCorregir('${id}')">Corregir</button>
  `;
}

function renderRow(record) {
  const estadoRegistro = record?.meta?.estado || "VALIDO";

  return `
    <tr>
      <td>${safeText(record?.fecha)}</td>
      <td>${safeText(record?.momento)}</td>
      <td>${safeText(record?.resultado_operativo)}</td>
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
      <td>${safeText(record?.momento_estructural)}</td>
      <td>${safeText(estadoRegistro)}</td>
      <td>${safeText(record?.id)}</td>
      <td>${renderRowActions(record)}</td>
    </tr>
  `;
}

/* ============================================================
   Render (LÍMITE REAL DE DATOS)
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

tbody.innerHTML = list.map(renderRow).join("");

// 🔑 Recalcula altura visible según límite actual
setTimeout(() => {
  setTableLimit(PEA_TABLE_LIMIT);
}, 0);
}

/* ============================================================
   Update principal
   ============================================================ */

function updateTable() {
  if (!window.PEA_STORAGE || !window.PEA_FILTERS) return;

  const all = window.PEA_STORAGE.loadPEALog();
  const filtered = window.PEA_FILTERS.apply(all);

  renderTable(filtered);
}

document.addEventListener("DOMContentLoaded", updateTable);
document.addEventListener("PEA_FILTERS_UPDATED", updateTable);

/* ============================================================
   API pública
   ============================================================ */

window.PEA_TABLE = {
  setLimit: setTableLimit
};

// ============================================================
// Exponer handlers para botones inline (HTML onclick)
// ============================================================

window.handleAnular = function (recordId) {
  if (!confirm("¿Anular este registro?")) return;
  window.PEA_STORAGE.markAsAnulado(recordId);
  updateTable();
};

window.handleCorregir = function (recordId) {
  window.location.href = `./pea_screen_register.html?correction_of=${recordId}`;
};

window.handleVerOriginal = function (originalId) {
  alert("ID original: " + originalId);
};
