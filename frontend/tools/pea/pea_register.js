/* ============================================================
   PEA REGISTER — BLOQUE 6 / 14
   Sistema: Análisis (PEA)
   Rol: Guardar / Nuevo / Modificar (corrección)
   ============================================================ */

import {
  PEA_MOMENTOS,
  PEA_PENSAMIENTOS,
  PEA_ESTADOS_OPERATIVOS,
  PEA_INTENSIDADES,
  PEA_ACCIONES,
  PEA_RESULTADOS, // (no se usa en registro hoy, pero queda disponible)
  PEA_ACTIVOS,
  PEA_INSTRUMENTOS_POR_ACTIVO,
  PEA_DIRECCION,
  PEA_RIESGO_PLANIFICADO // (no se usa en registro hoy, pero queda disponible)
} from "./pea_catalog.js";

/* =========================
   UTILIDADES
   ========================= */

function $(id) {
  return document.getElementById(id);
}

function clearSelect(selectEl, keepFirst = false) {
  const opts = Array.from(selectEl.options);
  selectEl.innerHTML = "";
  if (keepFirst && opts.length) {
    selectEl.appendChild(opts[0]);
  }
}

function addOption(selectEl, value, label = value) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = label;
  selectEl.appendChild(opt);
}

function fillSelect(selectEl, values, { keepFirst = true } = {}) {
  clearSelect(selectEl, keepFirst);
  values.forEach(v => addOption(selectEl, v, v));
}

function getSelectedOptions(selectEl) {
  return Array.from(selectEl.selectedOptions).map(o => o.value).filter(Boolean);
}

function generatePEAId() {
  return "pea_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function getStorageKey() {
  const emailHash = localStorage.getItem("emailHash") || "anonymous";
  return `PEA_RECORDS_${emailHash}`;
}

function loadRecords() {
  const raw = localStorage.getItem(getStorageKey());
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(getStorageKey(), JSON.stringify(records));
}

/* =========================
   UI: POBLADO DE LISTAS
   ========================= */

function setupCatalogsUI() {
  // Momento
  fillSelect($("pea-momento"), PEA_MOMENTOS, { keepFirst: true });

  // Pensamiento
  fillSelect($("pea-pensamiento"), PEA_PENSAMIENTOS, { keepFirst: true });

  // Estado
  fillSelect($("pea-estado"), PEA_ESTADOS_OPERATIVOS, { keepFirst: true });

  // Intensidad (1..5)
  const intensidadSel = $("pea-intensidad");
  clearSelect(intensidadSel, true); // mantiene "—"
  PEA_INTENSIDADES.forEach(n => addOption(intensidadSel, String(n), String(n)));

  // Acciones (multiple) -> sin placeholder
  const accionesSel = $("pea-accion");
  clearSelect(accionesSel, false);
  PEA_ACCIONES.forEach(a => addOption(accionesSel, a, a));

  // Activos (incluye OTROS)
  const activoSel = $("pea-activo");
  clearSelect(activoSel, true); // mantiene "—"
  PEA_ACTIVOS.forEach(a => addOption(activoSel, a, a));

  // Dirección
  const dirSel = $("pea-direccion");
  clearSelect(dirSel, true); // mantiene "—"
  PEA_DIRECCION.forEach(d => addOption(dirSel, d, d));

  // Instrumento (depende de activo)
  refreshInstrumentos();
  activoSel.addEventListener("change", refreshInstrumentos);

  // OTROS helpers (solo UX, no motor)
  setupOtrosUX();
}

function refreshInstrumentos() {
  const activo = $("pea-activo").value;
  const instSel = $("pea-instrumento");

  clearSelect(instSel, true); // mantiene "—"

  if (!activo) return;

  const list = (PEA_INSTRUMENTOS_POR_ACTIVO && PEA_INSTRUMENTOS_POR_ACTIVO[activo]) || [];
  list.forEach(i => addOption(instSel, i, i));

  // Si el activo es OTROS, permitimos también OTROS en instrumento
  // (tu índice lo permite: instrumento depende del activo + OTROS)
  if (activo === "OTROS") {
    addOption(instSel, "OTROS", "OTROS");
  } else {
    // aunque no sea OTROS, el índice permite OTROS como opción adicional en instrumento
    addOption(instSel, "OTROS", "OTROS");
  }
}

function setupOtrosUX() {
  const activoSel = $("pea-activo");
  const activoOtros = $("pea-activo-otros");
  const instSel = $("pea-instrumento");
  const instOtros = $("pea-instrumento-otros");

  function syncActivoOtros() {
    const v = activoSel.value;
    const isOtros = v === "OTROS";
    activoOtros.disabled = !isOtros;
    if (!isOtros) activoOtros.value = "";
  }

  function syncInstOtros() {
    const v = instSel.value;
    const isOtros = v === "OTROS";
    instOtros.disabled = !isOtros;
    if (!isOtros) instOtros.value = "";
  }

  syncActivoOtros();
  syncInstOtros();

  activoSel.addEventListener("change", () => {
    syncActivoOtros();
    // al cambiar activo, también reseteamos instrumento y OTROS de instrumento
    instSel.value = "";
    syncInstOtros();
  });

  instSel.addEventListener("change", syncInstOtros);
}

/* =========================
   LECTURA DE FORMULARIO
   ========================= */

function readFormData() {
  const activo = $("pea-activo").value || null;
  const activo_otros = $("pea-activo-otros").value?.trim() || null;

  const instrumento = $("pea-instrumento").value || null;
  const instrumento_otros = $("pea-instrumento-otros").value?.trim() || null;

  return {
    id: generatePEAId(),

    // obligatorios
    fecha: $("pea-fecha").value,                // "YYYY-MM-DD"
    momento: $("pea-momento").value,            // "ANTES"|"DURANTE"|"DESPUÉS"
    pensamiento_key: $("pea-pensamiento").value,
    estado_key: $("pea-estado").value,
    intensidad: Number($("pea-intensidad").value),
    acciones_keys: getSelectedOptions($("pea-accion")),
    direccion: $("pea-direccion").value,        // "COMPRA"|"VENTA"

    // opcionales controlados + OTROS
    activo,
    activo_otros: activo === "OTROS" ? activo_otros : null,
    instrumento,
    instrumento_otros: instrumento === "OTROS" ? instrumento_otros : null,

    // opcional factual
    nota_factual: $("pea-nota").value?.trim() || null,

    // evidencia técnica
    created_at: Date.now(),

    // corrección (no edición)
    correction_of: null
  };
}

/* =========================
   ACCIONES
   ========================= */

function handleGuardar() {
  const formData = readFormData();

  // validatePEAForm viene de pea_validate.js (global)
  const validator = window.validatePEAForm;
  if (typeof validator !== "function") {
    alert("ERROR: validatePEAForm no está disponible. Revisar pea_validate.js.");
    return;
  }

  const validation = validator(formData);
  if (!validation.isValid) {
    alert(validation.errors.join("\n"));
    return;
  }

  const records = loadRecords();
  records.push(formData);
  saveRecords(records);

  window.location.href = "./pea_screen_history.html";
}

function handleNuevo() {
  const confirm1 = confirm("¿Estás seguro?");
  if (!confirm1) return;

  // Reset manual (no usamos <form>)
  $("pea-fecha").value = "";
  $("pea-momento").value = "";
  $("pea-pensamiento").value = "";
  $("pea-estado").value = "";
  $("pea-intensidad").value = "";

  // multi-select: deseleccionar todo
  Array.from($("pea-accion").options).forEach(o => (o.selected = false));

  $("pea-activo").value = "";
  $("pea-activo-otros").value = "";
  $("pea-instrumento").value = "";
  $("pea-instrumento-otros").value = "";
  $("pea-direccion").value = "";
  $("pea-nota").value = "";

  // refrescar instrumentos + UX OTROS
  refreshInstrumentos();
  // fuerza update disabled/enabled
  $("pea-activo").dispatchEvent(new Event("change"));

  alert("Datos borrados exitosamente");
}

function handleModificar() {
  const originalId = prompt("ID del registro a corregir:");
  if (!originalId) return;

  const formData = readFormData();

  const validator = window.validatePEAForm;
  if (typeof validator !== "function") {
    alert("ERROR: validatePEAForm no está disponible. Revisar pea_validate.js.");
    return;
  }

  const validation = validator(formData);
  if (!validation.isValid) {
    alert(validation.errors.join("\n"));
    return;
  }

  formData.correction_of = originalId;

  const records = loadRecords();
  records.push(formData);
  saveRecords(records);

  window.location.href = "./pea_screen_history.html";
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  setupCatalogsUI();

  $("pea-guardar").addEventListener("click", handleGuardar);
  $("pea-nuevo").addEventListener("click", handleNuevo);
  $("pea-modificar").addEventListener("click", handleModificar);
});
