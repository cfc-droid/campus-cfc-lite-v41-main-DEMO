/* ============================================================
   PEA TABLE — BLOQUE 8 / 14
   Rol: Render de registros crudos
   ============================================================ */

const $ = (id) => document.getElementById(id);

/* ============================================================
   TAREA 22c — control REAL de registros visibles
   Objetivo:
   - Renderizar TODOS los registros (sin recortar datos)
   - Ajustar la "ventana" visible para que entren EXACTO 10/15/20 filas
   - SIN scroll interno: el scroll es el de la página (vertical)
   ============================================================ */

let PEA_TABLE_LIMIT = 10;

/**
 * Ajusta la altura visible del bloque de tabla para que entren EXACTO N filas
 * (sumando la altura REAL de cada fila, no aproximando "fila1*N").
 */
function setTableLimit(value) {
  const v = parseInt(value, 10);
  if (![10, 15, 20].includes(v)) return;

  PEA_TABLE_LIMIT = v;

  const container = document.querySelector(".pea-table-scroll");
  const table = container?.querySelector("table");
  if (!container || !table) return;

  const rows = table.querySelectorAll("tbody tr");
  if (!rows || rows.length === 0) return;

  const thead = table.querySelector("thead");
  const headerHeight = thead ? thead.getBoundingClientRect().height : 0;

  // Sumar alturas reales de las primeras N filas
  const n = Math.min(v, rows.length);
  let rowsHeight = 0;
  for (let i = 0; i < n; i++) {
    rowsHeight += rows[i].getBoundingClientRect().height;
  }

  const total = Math.ceil(headerHeight + rowsHeight);

  // "Ventana" visible exacta
  container.style.height = `${total}px`;
  container.style.maxHeight = `${total}px`;

  // Muy importante: que NO haya scroll interno vertical (la página scrollea)
  container.style.overflowY = "visible";

  // Mantener scroll horizontal si existe (por columnas)
  // Si tu CSS ya maneja esto, no molesta:
  container.style.overflowX = container.style.overflowX || "auto";
}

/* ============================================================
   Helpers
   ============================================================ */

function safeText(v) {
  if (v == null) return "";
  return String(v);
}

function renderAcciones(record) {
  const aks = Array.isArray(record?.acciones_keys) ? record.acciones_keys : [];
  return aks.length ? aks.join(", ") : "";
}

function renderEstadoE(record) {
  return record?.estado_key ? safeText(record.estado_key) : "";
}

function renderIntensidad(record) {
  return record?.intensidad == null ? "" : safeText(record.intensidad);
}

function renderRowActions(record) {
  const estado = record?.meta?.estado || "VALIDO";
  const id = record?.id;

  if (!id) return "";
  if (estado === "ANULADO") return "—";

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
   Render (NO recorta datos; ajusta solo la "ventana" visible)
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

  // ✅ Renderiza TODOS los registros (sin slice)
  tbody.innerHTML = list.map(renderRow).join("");

  // ✅ Recalcular altura visible (2 veces por fuentes / layout tardío)
  setTimeout(() => setTableLimit(PEA_TABLE_LIMIT), 0);
  setTimeout(() => setTableLimit(PEA_TABLE_LIMIT), 200);
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

// Recalcular si cambia el tamaño de pantalla (PC/celular/rotación)
window.addEventListener("resize", () => {
  setTimeout(() => setTableLimit(PEA_TABLE_LIMIT), 0);
});

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
