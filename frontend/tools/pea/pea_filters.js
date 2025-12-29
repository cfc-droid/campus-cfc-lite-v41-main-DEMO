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
  PEA_DIRECCION,
  PEA_MOMENTOS_ESTRUCTURALES 
} from "./pea_catalog.js";

const $ = (id) => document.getElementById(id);

/* =========================
   ESTADO ÚNICO DE FILTROS
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
  recordState: null,
  resultadoOperativo: null, 
  activoOtros: null,
  instrumentoOtros: null,
  momentoEstructural: null
 
};

/* =========================
   UI: Poblar selects
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
  fillSelect($("pea-filter-momento-estructural"), PEA_MOMENTOS_ESTRUCTURALES);

  $("pea-filter-activo").addEventListener("change", refreshInstrumentos);
  refreshInstrumentos();
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
   Leer UI -> FILTER_STATE
   ========================= */

function readFiltersFromUI() {
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
  FILTER_STATE.resultadoOperativo = $("pea-filter-resultado-operativo").value || null;
  FILTER_STATE.momentoEstructural = $("pea-filter-momento-estructural").value || null;
 
 
  FILTER_STATE.activoOtros =
    $("pea-filter-activo-otros")?.value.trim() || null;

  FILTER_STATE.instrumentoOtros =
    $("pea-filter-instrumento-otros")?.value.trim() || null;
}

/* =========================
   Filtrado puro (NO modifica)
   ========================= */

function applyFilters(records) {
  const src = Array.isArray(records) ? records : [];

  return src.filter(r => {
    const fecha = r?.fecha || null;

    if (FILTER_STATE.dateFrom && fecha && fecha < FILTER_STATE.dateFrom) return false;
    if (FILTER_STATE.dateTo && fecha && fecha > FILTER_STATE.dateTo) return false;

    if (FILTER_STATE.momento && r?.momento !== FILTER_STATE.momento) return false;
    if (FILTER_STATE.resultadoOperativo && r?.resultado_operativo !== FILTER_STATE.resultadoOperativo) return false;

    if (FILTER_STATE.momentoEstructural && r?.momento_estructural !== FILTER_STATE.momentoEstructural) return false;
 
    if (FILTER_STATE.pensamiento && r?.pensamiento_key !== FILTER_STATE.pensamiento) return false;
    if (FILTER_STATE.estado && r?.estado_key !== FILTER_STATE.estado) return false;
    if (FILTER_STATE.intensidad && String(r?.intensidad ?? "") !== FILTER_STATE.intensidad) return false;

    if (FILTER_STATE.accion) {
      const aks = Array.isArray(r?.acciones_keys) ? r.acciones_keys : [];
      if (!aks.includes(FILTER_STATE.accion)) return false;
    }

    if (FILTER_STATE.direccion && r?.direccion !== FILTER_STATE.direccion) return false;
    if (FILTER_STATE.activo && r?.activo !== FILTER_STATE.activo) return false;
    if (FILTER_STATE.instrumento && r?.instrumento !== FILTER_STATE.instrumento) return false;

    if (FILTER_STATE.activoOtros) {
      if (
        !r?.activo_otros ||
        !r.activo_otros.toLowerCase().includes(FILTER_STATE.activoOtros.toLowerCase())
      ) return false;
    }

    if (FILTER_STATE.instrumentoOtros) {
      if (
        !r?.instrumento_otros ||
        !r.instrumento_otros.toLowerCase().includes(FILTER_STATE.instrumentoOtros.toLowerCase())
      ) return false;
    }

if (FILTER_STATE.recordState) {
  const estadoRegistro = r?.meta?.estado || "VALIDO";

  // Normalización por compatibilidad histórica
  const filtro =
    FILTER_STATE.recordState === "CORRECCION"
      ? "CORREGIDO"
      : FILTER_STATE.recordState;

  if (estadoRegistro !== filtro) return false;
}
     
    return true;
  });
}

/* =========================
   UI Actions
   ========================= */

function setStatus(text) {
  const el = $("pea-filter-status");
  if (!el) return;
  el.textContent = text || "";
}

function onApply() {
  readFiltersFromUI();
  setStatus("Filtros aplicados.");
  document.dispatchEvent(new CustomEvent("PEA_FILTERS_UPDATED"));
}

function onClear() {
  document.querySelectorAll(".pea-filters select, .pea-filters input").forEach(el => {
    el.value = "";
  });

  Object.keys(FILTER_STATE).forEach(k => (FILTER_STATE[k] = null));
  refreshInstrumentos();

  setStatus("Filtros quitados.");
  document.dispatchEvent(new CustomEvent("PEA_FILTERS_UPDATED"));
}

/* =========================
   API pública (global)
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
  $("pea-filter-apply").addEventListener("click", onApply);
  $("pea-filter-clear").addEventListener("click", onClear);
});
