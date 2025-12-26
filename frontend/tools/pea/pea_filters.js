/* ============================================================
   PEA FILTERS — BLOQUE 8 / 14
   Rol: Reducir universo de registros SIN modificar datos
   ============================================================ */

import {
  PEA_MOMENTOS,
  PEA_PENSAMIENTOS,
  PEA_ESTADOS_OPERATIVOS,
  PEA_INTENSIDADES,
  PEA_ACCIONES,
  PEA_ACTIVOS,
  PEA_INSTRUMENTOS_POR_ACTIVO,
  PEA_DIRECCION
} from "./pea_catalog.js";

/* =========================
   SELECTORES
   ========================= */

const $ = (id) => document.getElementById(id);

/* =========================
   ESTADO DE FILTROS (ÚNICO)
   ========================= */

const FILTER_STATE = {
  dateFrom: null,
  dateTo: null,
  momento: null,
  pensamiento: null,
  estado: null,
  intensidad: null,
  accion: null,
  direccion: null,
  activo: null,
  instrumento: null,
  recordState: null
};

/* =========================
   POBLADO DE SELECTS
   ========================= */

function fillSelect(select, values) {
  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function setupFilterCatalogs() {
  fillSelect($("pea-filter-momento"), PEA_MOMENTOS);
  fillSelect($("pea-filter-pensamiento"), PEA_PENSAMIENTOS);
  fillSelect($("pea-filter-estado"), PEA_ESTADOS_OPERATIVOS);
  fillSelect($("pea-filter-intensidad"), PEA_INTENSIDADES.map(String));
  fillSelect($("pea-filter-accion"), PEA_ACCIONES);
  fillSelect($("pea-filter-direccion"), PEA_DIRECCION);
  fillSelect($("pea-filter-activo"), PEA_ACTIVOS);

  $("pea-filter-activo").addEventListener("change", refreshInstrumentos);
}

function refreshInstrumentos() {
  const activo = $("pea-filter-activo").value;
  const sel = $("pea-filter-instrumento");

  sel.innerHTML = `<option value="">—</option>`;
  if (!activo) return;

  const list = PEA_INSTRUMENTOS_POR_ACTIVO[activo] || [];
  fillSelect(sel, list);

  if (activo === "OTROS") {
    const opt = document.createElement("option");
    opt.value = "OTROS";
    opt.textContent = "OTROS";
    sel.appendChild(opt);
  }
}

/* =========================
   LECTURA DE FILTROS
   ========================= */

function readFilters() {
  FILTER_STATE.dateFrom = $("pea-filter-date-from").value || null;
  FILTER_STATE.dateTo = $("pea-filter-date-to").value || null;
  FILTER_STATE.momento = $("pea-filter-momento").value || null;
  FILTER_STATE.pensamiento = $("pea-filter-pensamiento").value || null;
  FILTER_STATE.estado = $("pea-filter-estado").value || null;
  FILTER_STATE.intensidad = $("pea-filter-intensidad").value || null;
  FILTER_STATE.accion = $("pea-filter-accion").value || null;
  FILTER_STATE.direccion = $("pea-filter-direccion").value || null;
  FILTER_STATE.activo = $("pea-filter-activo").value || null;
  FILTER_STATE.instrumento = $("pea-filter-instrumento").value || null;
  FILTER_STATE.recordState = $("pea-filter-record-state").value || null;
}

/* =========================
   FILTRADO PURO
   ========================= */

function applyFilters(records) {
  return records.filter(r => {

    if (FILTER_STATE.dateFrom && r.fecha < FILTER_STATE.dateFrom) return false;
    if (FILTER_STATE.dateTo && r.fecha > FILTER_STATE.dateTo) return false;

    if (FILTER_STATE.momento && r.momento !== FILTER_STATE.momento) return false;
    if (FILTER_STATE.pensamiento && r.pensamiento_key !== FILTER_STATE.pensamiento) return false;
    if (FILTER_STATE.estado && r.estado_key !== FILTER_STATE.estado) return false;
    if (FILTER_STATE.intensidad && String(r.intensidad) !== FILTER_STATE.intensidad) return false;

    if (FILTER_STATE.accion && !r.acciones_keys.includes(FILTER_STATE.accion)) return false;

    if (FILTER_STATE.direccion && r.direccion !== FILTER_STATE.direccion) return false;
    if (FILTER_STATE.activo && r.activo !== FILTER_STATE.activo) return false;
    if (FILTER_STATE.instrumento && r.instrumento !== FILTER_STATE.instrumento) return false;

    if (FILTER_STATE.recordState && r.meta?.estado !== FILTER_STATE.recordState) return false;

    return true;
  });
}

/* =========================
   ACCIONES UI
   ========================= */

function applyButton() {
  readFilters();
  document.dispatchEvent(new CustomEvent("PEA_FILTERS_UPDATED"));
}

function clearButton() {
  document.querySelectorAll(".pea-filters select, .pea-filters input").forEach(el => {
    el.value = "";
  });

  Object.keys(FILTER_STATE).forEach(k => FILTER_STATE[k] = null);

  document.dispatchEvent(new CustomEvent("PEA_FILTERS_UPDATED"));
}

/* =========================
   API PÚBLICA
   ========================= */

window.PEA_FILTERS = {
  apply(records) {
    return applyFilters(records);
  }
};

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  setupFilterCatalogs();
  $("pea-filter-apply").addEventListener("click", applyButton);
  $("pea-filter-clear").addEventListener("click", clearButton);
});
