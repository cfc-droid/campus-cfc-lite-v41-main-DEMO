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

let PEA_TABLE_LIMIT = 10; // (default general)

/**
 * Ajusta la altura visible del bloque de tabla para que entren EXACTO N filas
 * (sumando la altura REAL de cada fila, no aproximando "fila1*N").
 */
function setTableLimit(value) {
  const v = parseInt(value, 10);
  if (![5, 10, 15, 20].includes(v)) return;

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
   TAREA — agregar opción 5 registros (sin tocar HTML)
   - Detecta el select que tiene 10/15/20
   - Inyecta opción 5
   - Conecta change -> setTableLimit
   - (Opcional) En móvil arranca en 5 automáticamente
   ============================================================ */

function initTableLimitSelect() {
  // Buscamos selects dentro del bloque de registros
  const root = document.querySelector(".pea-table-wrap") || document;
  const selects = Array.from(root.querySelectorAll("select"));

  // Heurística: el select correcto suele tener exactamente {10,15,20}
  const isLimitSelect = (sel) => {
    const values = Array.from(sel.options || []).map(o => parseInt(o.value, 10)).filter(n => !Number.isNaN(n));
    if (values.length < 3) return false;
    const set = new Set(values);
    return set.has(10) && set.has(15) && set.has(20);
  };

  const sel = selects.find(isLimitSelect);
  if (!sel) return;

  // Si ya existe 5, no hacemos nada
  const has5 = Array.from(sel.options).some(o => String(o.value) === "5");
  if (!has5) {
    const opt5 = document.createElement("option");
    opt5.value = "5";
    opt5.textContent = "5";

    // Insertar 5 al principio (queda 5/10/15/20)
    sel.insertBefore(opt5, sel.firstChild);
  }

  // Enganchar change (por si no estaba)
  sel.addEventListener("change", (e) => {
    setTableLimit(e.target.value);
  });

  // ✅ OPCIONAL: en móvil arrancar con 5 (solo si el usuario no eligió otra cosa)
  const isMobile = window.matchMedia && window.matchMedia("(max-width: 640px)").matches;
  if (isMobile) {
    // Si el select está en 10/15/20, lo pasamos a 5 por comodidad
    // (si ya está en 5 o el usuario lo cambió, queda como está)
    const current = parseInt(sel.value, 10);
    if (![5, 10, 15, 20].includes(current) || current === 10) {
      sel.value = "5";
      setTableLimit(5);
      PEA_TABLE_LIMIT = 5;
    }
  } else {
    // Desktop: respetamos lo que esté seleccionado, y aplicamos limit
    const current = parseInt(sel.value, 10);
    if ([5, 10, 15, 20].includes(current)) {
      setTableLimit(current);
      PEA_TABLE_LIMIT = current;
   }
  }
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

document.addEventListener("DOMContentLoaded", () => {
  initTableLimitSelect();
  updateTable();
});

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
