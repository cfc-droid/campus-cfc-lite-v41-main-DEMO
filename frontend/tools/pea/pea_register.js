/* ============================================================
   PEA REGISTER — BLOQUE 6 / 14 (COMPLETO)
   Rol:
   - Poblar UI desde catálogos
   - Validar
   - Guardar / Nuevo / Modificar (corrección)
   ============================================================ */

/* =========================
   UTILIDADES
   ========================= */

function $(id) {
  return document.getElementById(id);
}

function generatePEAId() {
  return "pea_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function getSelectedOptions(selectEl) {
  return Array.from(selectEl.selectedOptions).map(o => o.value);
}

function getStorageKey() {
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
   POBLADO DE SELECTS
   ========================= */

function fillSelect(selectEl, values, withEmpty = true) {
  if (withEmpty) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "— Seleccionar —";
    selectEl.appendChild(opt);
  }

  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  });
}

function initCatalogs() {
  fillSelect($("pea-momento"), PEA_MOMENTOS);
  fillSelect($("pea-pensamiento"), PEA_PENSAMIENTOS);
  fillSelect($("pea-estado"), PEA_ESTADOS_OPERATIVOS);
  fillSelect($("pea-direccion"), PEA_DIRECCION);

  // Acciones (multi-select)
  const accionesSelect = $("pea-accion");
  PEA_ACCIONES.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    accionesSelect.appendChild(opt);
  });

  // Activos
  fillSelect($("pea-activo"), PEA_ACTIVOS);

  // Instrumentos dependientes
  $("pea-activo").addEventListener("change", handleActivoChange);
}

function handleActivoChange() {
  const activo = $("pea-activo").value;
  const instSelect = $("pea-instrumento");
  instSelect.innerHTML = "";

  const list = PEA_INSTRUMENTOS_POR_ACTIVO[activo] || [];
  fillSelect(instSelect, list);
}

/* =========================
   LECTURA FORMULARIO
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
  const data = readFormData();
  const validation = validatePEAForm(data);

  if (!validation.isValid) {
    alert(validation.errors.join("\n"));
    return;
  }

  const records = loadRecords();
  records.push(data);
  saveRecords(records);

  window.location.href = "./pea_screen_history.html";
}

function handleNuevo() {
  if (!confirm("¿Estás seguro?")) return;
  document.querySelector("main").querySelectorAll("input, select, textarea")
    .forEach(el => el.value = "");
  alert("Datos borrados exitosamente");
}

function handleModificar() {
  const originalId = prompt("ID del registro a corregir:");
  if (!originalId) return;

  const data = readFormData();
  const validation = validatePEAForm(data);

  if (!validation.isValid) {
    alert(validation.errors.join("\n"));
    return;
  }

  data.correction_of = originalId;

  const records = loadRecords();
  records.push(data);
  saveRecords(records);

  window.location.href = "./pea_screen_history.html";
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  initCatalogs();

  $("pea-guardar").addEventListener("click", handleGuardar);
  $("pea-nuevo").addEventListener("click", handleNuevo);
  $("pea-modificar").addEventListener("click", handleModificar);
});
