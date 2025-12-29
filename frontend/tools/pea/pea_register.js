/* ============================================================
   PEA REGISTER — BLOQUE 6 / 14
   Sistema: Análisis (PEA)
   Rol: Guardar / Nuevo / Corrección guiada
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

/* =========================
   MODO CORRECCIÓN (URL)
   ========================= */

const urlParams = new URLSearchParams(window.location.search);
const CORRECTION_OF_ID = urlParams.get("correction_of");
const IS_CORRECTION_MODE = Boolean(CORRECTION_OF_ID);

/* =========================
   UTILIDADES
   ========================= */

function $(id) {
  return document.getElementById(id);
}

function clearSelect(selectEl, keepFirst = false) {
  const opts = Array.from(selectEl.options);
  selectEl.innerHTML = "";
  if (keepFirst && opts.length) selectEl.appendChild(opts[0]);
}

function addOption(selectEl, value, label = value) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = label;
  selectEl.appendChild(opt);
}

function fillSelect(selectEl, values, { keepFirst = true } = {}) {
  clearSelect(selectEl, keepFirst);
  values.forEach(v => addOption(selectEl, v));
}

function generatePEAId() {
  return "pea_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

/* =========================
   RESULTADO OPERATIVO — VISIBILIDAD POR MOMENTO (PASO B)
   ========================= */

function updateResultadoOperativoUI() {
  const momentoSel = $("pea-momento");
  const resultadoSel = $("pea-resultado-operativo");

  if (!momentoSel || !resultadoSel) return;

  const isDespues = momentoSel.value === "DESPUÉS";

  // Mostrar / ocultar
  resultadoSel.style.display = isDespues ? "" : "none";
  resultadoSel.disabled = !isDespues;

  // Limpiar valor si NO es DESPUÉS
  if (!isDespues) {
    resultadoSel.value = "";
  }
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
   UI — CATALOGOS
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

 // =========================
// MOMENTO ESTRUCTURAL (UI)
// =========================
const estructuralSel = $("pea-momento-estructural");
if (estructuralSel) {
  clearSelect(estructuralSel, false);
  PEA_MOMENTOS_ESTRUCTURALES.forEach(v => {
    const label =
      v === "SIN_MARCAR"
        ? "— Sin marcar —"
        : v.replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());

    addOption(estructuralSel, v, label);
  });
}

  refreshInstrumentos();
  activoSel.addEventListener("change", refreshInstrumentos);
  setupOtrosUX();
}

  // PASO B — Resultado operativo depende de Momento
  const momentoSel = $("pea-momento");
  if (momentoSel) {
    momentoSel.addEventListener("change", updateResultadoOperativoUI);
  }

  // Estado inicial
  updateResultadoOperativoUI();

function refreshInstrumentos() {
  const activo = $("pea-activo").value;
  const instSel = $("pea-instrumento");
  clearSelect(instSel, true);
  if (!activo) return;
  (PEA_INSTRUMENTOS_POR_ACTIVO?.[activo] || []).forEach(i => addOption(instSel, i));
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
   MOMENTO ESTRUCTURAL — PRECARGA POR HERENCIA
   ========================= */

function preloadInheritedMomentoEstructural() {
  // ❌ No aplicar en modo corrección
  if (IS_CORRECTION_MODE) return;

  const estructuralSel = $("pea-momento-estructural");
  if (!estructuralSel) return;

  const log = window.PEA_STORAGE.loadPEALog();

  const lastValid = log.find(
    r =>
      r?.meta?.estado !== "ANULADO" &&
      r?.momento_estructural &&
      r.momento_estructural !== "SIN_MARCAR"
  );

  if (lastValid) {
    estructuralSel.value = lastValid.momento_estructural;
  }
}

/* =========================
   LECTURA FORM
   ========================= */

function readFormData() {
  return {
    id: generatePEAId(),
    fecha: $("pea-fecha").value,
    momento: $("pea-momento").value,
    resultado_operativo: $("pea-resultado-operativo")?.value || null, // ← NUEVO 
    pensamiento_key: $("pea-pensamiento").value,
    estado_key: $("pea-estado").value,
    intensidad: Number($("pea-intensidad").value),
    acciones_keys: getAccionesFromSlots(),
    direccion: $("pea-direccion").value,
    activo: $("pea-activo").value || null,
    activo_otros: $("pea-activo").value === "OTROS" ? $("pea-activo-otros").value.trim() : null,
    instrumento: $("pea-instrumento").value || null,
    instrumento_otros: $("pea-instrumento").value === "OTROS" ? $("pea-instrumento-otros").value.trim() : null,
    nota_factual: $("pea-nota").value.trim() || null,
    momento_estructural: $("pea-momento-estructural")?.value || "SIN_MARCAR", 
    meta: { schema_version: "PEA_SCHEMA_V1" }
  };
}

/* =========================
   PRECARGA CORRECCIÓN
   ========================= */

function preloadCorrectionData(id) {
  const original = window.PEA_STORAGE.loadPEALog().find(r => r.id === id);
  if (!original) return alert("Registro original no encontrado.");

  $("pea-fecha").value = original.fecha;
  $("pea-momento").value = original.momento;
  $("pea-pensamiento").value = original.pensamiento_key;
  $("pea-estado").value = original.estado_key;
  $("pea-intensidad").value = original.intensidad ?? "";

  document.querySelectorAll(".pea-accion-slot").forEach((slot, i) => {
    slot.value = original.acciones_keys?.[i] || "";
  });
  updateAccionesPreview();

  $("pea-direccion").value = original.direccion || "";
  $("pea-activo").value = original.activo || "";
  refreshInstrumentos();
  $("pea-instrumento").value = original.instrumento || "";
  $("pea-activo-otros").value = original.activo_otros || "";
  $("pea-instrumento-otros").value = original.instrumento_otros || "";
  $("pea-nota").value = original.nota_factual || "";

const estructuralSel = $("pea-momento-estructural");
if (estructuralSel) {
  estructuralSel.value = original.momento_estructural || "SIN_MARCAR";
}

  // 🔧 CARGAR resultado operativo al corregir
$("pea-resultado-operativo").value = original.resultado_operativo || ""; 

    // Ajustar visibilidad de Resultado operativo al precargar
  updateResultadoOperativoUI(); 
}

/* =========================
   GUARDAR
   ========================= */

function handleGuardar() {
  const data = readFormData();

  if (!window.validatePEAForm) {
    return alert("Validación no disponible.");
  }

  const result = window.validatePEAForm(data);
  if (!result.isValid) return alert(result.errors.join("\n"));

  if (!confirm("¿Confirmás guardar este registro?")) return;

if (IS_CORRECTION_MODE) {
  window.PEA_STORAGE.markAsCorregido(
    CORRECTION_OF_ID,
    {
      // Campos editables reales
      fecha: data.fecha,
      momento: data.momento,
      resultado_operativo: data.resultado_operativo, 
      pensamiento_key: data.pensamiento_key,
      estado_key: data.estado_key,
      intensidad: data.intensidad,
      acciones_keys: data.acciones_keys,
      direccion: data.direccion,
      activo: data.activo,
      activo_otros: data.activo_otros,
      instrumento: data.instrumento,
      instrumento_otros: data.instrumento_otros,
      nota_factual: data.nota_factual,
      momento_estructural: data.momento_estructural 
    }
  );

  alert("Registro corregido correctamente.");
  window.location.href = "./pea_screen_history.html";
  return;
}

window.PEA_STORAGE.savePEARecord(data);
alert("Registro guardado correctamente.");
location.reload(true);
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  setupCatalogsUI();

 preloadInheritedMomentoEstructural(); // 👈 PEGAR ESTA LÍNEA  

if (IS_CORRECTION_MODE) {
  preloadCorrectionData(CORRECTION_OF_ID);
  // ⚠️ NO deshabilitar fecha ni momento
  if ($("pea-modificar")) $("pea-modificar").style.display = "none";
}

  $("pea-guardar").addEventListener("click", handleGuardar);
  $("pea-nuevo").addEventListener("click", () => location.reload());
});
