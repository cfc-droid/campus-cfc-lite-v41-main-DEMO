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
  PEA_ACTIVOS,
  PEA_INSTRUMENTOS_POR_ACTIVO,
  PEA_DIRECCION
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

function generatePEAId() {
  return "pea_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

/* =========================
   ACCIONES (SLOTS)
   ========================= */

function getAccionesFromSlots() {
  return Array.from(document.querySelectorAll(".pea-accion-slot"))
    .map(s => s.value)
    .filter(Boolean);
}

function updateAccionesPreview() {
  const list = $("pea-acciones-preview-list");
  if (!list) return;

  list.innerHTML = "";
  getAccionesFromSlots().forEach(a => {
    const li = document.createElement("li");
    li.textContent = a;
    list.appendChild(li);
  });
}

/* =========================
   UI: POBLADO DE LISTAS
   ========================= */

function setupCatalogsUI() {
  fillSelect($("pea-momento"), PEA_MOMENTOS);
  fillSelect($("pea-pensamiento"), PEA_PENSAMIENTOS);
  fillSelect($("pea-estado"), PEA_ESTADOS_OPERATIVOS);

  const intensidadSel = $("pea-intensidad");
  clearSelect(intensidadSel, true);
  PEA_INTENSIDADES.forEach(n => addOption(intensidadSel, String(n)));

  document.querySelectorAll(".pea-accion-slot").forEach(slot => {
    clearSelect(slot, false);
    addOption(slot, "", "—");
    PEA_ACCIONES.forEach(a => addOption(slot, a));
    slot.addEventListener("change", updateAccionesPreview);
  });

  const activoSel = $("pea-activo");
  clearSelect(activoSel, true);
  PEA_ACTIVOS.forEach(a => addOption(activoSel, a));

  const dirSel = $("pea-direccion");
  clearSelect(dirSel, true);
  PEA_DIRECCION.forEach(d => addOption(dirSel, d));

  refreshInstrumentos();
  activoSel.addEventListener("change", refreshInstrumentos);
  setupOtrosUX();
}

function refreshInstrumentos() {
  const activo = $("pea-activo").value;
  const instSel = $("pea-instrumento");

  clearSelect(instSel, true);
  if (!activo) return;

  const list = PEA_INSTRUMENTOS_POR_ACTIVO?.[activo] || [];
  list.forEach(i => addOption(instSel, i));

  addOption(instSel, "OTROS");
}

function setupOtrosUX() {
  const activoSel = $("pea-activo");
  const activoOtros = $("pea-activo-otros");
  const instSel = $("pea-instrumento");
  const instOtros = $("pea-instrumento-otros");

  const sync = () => {
    activoOtros.disabled = activoSel.value !== "OTROS";
    instOtros.disabled = instSel.value !== "OTROS";
    if (activoSel.value !== "OTROS") activoOtros.value = "";
    if (instSel.value !== "OTROS") instOtros.value = "";
  };

  sync();
  activoSel.addEventListener("change", sync);
  instSel.addEventListener("change", sync);
}

/* =========================
   LECTURA DE FORMULARIO
   ========================= */

function readFormData() {
  return {
    id: generatePEAId(),
    fecha: $("pea-fecha").value,
    momento: $("pea-momento").value,
    pensamiento_key: $("pea-pensamiento").value,
    estado_key: $("pea-estado").value,
    intensidad: Number($("pea-intensidad").value),
    acciones_keys: getAccionesFromSlots(),
    direccion: $("pea-direccion").value,

    activo: $("pea-activo").value || null,
    activo_otros:
      $("pea-activo").value === "OTROS"
        ? $("pea-activo-otros").value.trim()
        : null,

    instrumento: $("pea-instrumento").value || null,
    instrumento_otros:
      $("pea-instrumento").value === "OTROS"
        ? $("pea-instrumento-otros").value.trim()
        : null,

    nota_factual: $("pea-nota").value.trim() || null,

    meta: {
      schema_version: "PEA_SCHEMA_V1"
    }
  };
}

/* =========================
   ACCIONES
   ========================= */

function handleGuardar() {
  try {
    const data = readFormData();

    if (!window.validatePEAForm) {
      throw new Error("validatePEAForm no disponible");
    }

    const result = window.validatePEAForm(data);
    if (!result.isValid) {
      alert(result.errors.join("\n"));
      return;
    }

    if (!window.PEA_STORAGE) {
      throw new Error("PEA_STORAGE no disponible");
    }

    window.PEA_STORAGE.savePEARecord(data);

    alert("Registro guardado correctamente.");
    window.location.href = "./pea_screen_history.html";

  } catch (e) {
    alert("ERROR AL GUARDAR:\n" + e.message);
  }
}

function handleNuevo() {
  if (!confirm("¿Estás seguro?")) return;

  document.querySelectorAll("input, textarea, select").forEach(el => {
    el.value = "";
  });

  updateAccionesPreview();
  refreshInstrumentos();

  alert("Datos borrados exitosamente");
}

function handleModificar() {
  const originalId = prompt("ID del registro a corregir:");
  if (!originalId) return;

  try {
    const data = readFormData();
    data.correction_of = originalId;

    const result = window.validatePEAForm(data);
    if (!result.isValid) {
      alert(result.errors.join("\n"));
      return;
    }

    window.PEA_STORAGE.createCorrection(originalId, data);

    alert("Corrección guardada correctamente.");
    window.location.href = "./pea_screen_history.html";

  } catch (e) {
    alert("ERROR AL CORREGIR:\n" + e.message);
  }
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
