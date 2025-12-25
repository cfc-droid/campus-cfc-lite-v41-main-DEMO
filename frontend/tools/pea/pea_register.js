/* ============================================================
   PEA REGISTER — BLOQUE 6 / 14
   Sistema: Análisis (PEA)
   Rol: Guardar / Nuevo / Modificar (corrección)
   ============================================================ */

/* =========================
   UTILIDADES
   ========================= */

function $(id) {
  return document.getElementById(id);
}

function getSelectedOptions(selectEl) {
  return Array.from(selectEl.selectedOptions).map(o => o.value);
}

function generatePEAId() {
  return "pea_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function getStorageKey() {
  // ASUNCIÓN segura: emailHash ya existe en el Campus
  const emailHash = localStorage.getItem("emailHash") || "anonymous";
  return `PEA_RECORDS_${emailHash}`;
}

function loadRecords() {
  const raw = localStorage.getItem(getStorageKey());
  return raw ? JSON.parse(raw) : [];
}

function saveRecords(records) {
  localStorage.setItem(getStorageKey(), JSON.stringify(records));
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

    acciones_keys: getSelectedOptions($("pea-accion")),

    activo: $("pea-activo").value || null,
    activo_otros: $("pea-activo-otros").value || null,

    instrumento: $("pea-instrumento").value || null,
    instrumento_otros: $("pea-instrumento-otros").value || null,

    direccion: $("pea-direccion").value,

    nota_factual: $("pea-nota").value || null,

    created_at: Date.now(),
    correction_of: null
  };
}

/* =========================
   ACCIONES
   ========================= */

function handleGuardar() {
  const formData = readFormData();
  const validation = validatePEAForm(formData);

  if (!validation.isValid) {
    alert(validation.errors.join("\n"));
    return;
  }

  const records = loadRecords();
  records.push(formData);
  saveRecords(records);

  // Redirección a historial (ruta sellada por índice)
  window.location.href = "./pea_screen_history.html";
}

function handleNuevo() {
  const confirm1 = confirm("¿Estás seguro?");
  if (!confirm1) return;

  // Reset formulario
  document.querySelector("form")?.reset();

  alert("Datos borrados exitosamente");
}

function handleModificar() {
  const originalId = prompt("ID del registro a corregir:");
  if (!originalId) return;

  const formData = readFormData();
  const validation = validatePEAForm(formData);

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
   EVENTOS
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  $("pea-guardar").addEventListener("click", handleGuardar);
  $("pea-nuevo").addEventListener("click", handleNuevo);
  $("pea-modificar").addEventListener("click", handleModificar);
});
