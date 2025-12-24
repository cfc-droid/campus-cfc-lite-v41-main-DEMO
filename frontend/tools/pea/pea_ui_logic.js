import {
  PEA_PENSAMIENTOS,
  PEA_ESTADOS_OPERATIVOS,
  PEA_ACCIONES
} from "./pea_catalog.js";

import { validatePEAForm } from "./pea_validate.js";
import { savePEARecord, clearDraft } from "./pea_storage.js";
import { runPEAEngine } from "./pea_engine.js";

const pensamientoSelect = document.getElementById("pensamiento");
const estadoSelect = document.getElementById("estado");
const accionesDiv = document.getElementById("acciones");
const accionCostosaBlock = document.getElementById("accionCostosaBlock");
const accionCostosaSelect = document.getElementById("accionCostosa");
const momentoSelect = document.getElementById("momento");
const resultadoBlock = document.getElementById("resultadoBlock");
const planDefinido = document.getElementById("planDefinido");
const reglaBlock = document.getElementById("reglaBlock");
const btnFinalize = document.getElementById("btnFinalize");
const btnCancel = document.getElementById("btnCancel");

/* Placeholder explícito */
document.getElementById("btnSave").addEventListener("click", () => {
  alert("Borrador no conectado (BLOQUE 5/14)");
});

/* =========================
   CARGA DE CATÁLOGOS
   ========================= */

PEA_PENSAMIENTOS.forEach(p =>
  pensamientoSelect.add(new Option(p, p))
);

PEA_ESTADOS_OPERATIVOS.forEach(e =>
  estadoSelect.add(new Option(e, e))
);

PEA_ACCIONES.forEach(a => {
  const label = document.createElement("label");
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.value = a;
  label.append(cb, a);
  accionesDiv.appendChild(label);
});

/* =========================
   REGLAS UI
   ========================= */

momentoSelect.addEventListener("change", () => {
  resultadoBlock.hidden = momentoSelect.value !== "DESPUÉS";
});

planDefinido.addEventListener("change", () => {
  reglaBlock.hidden = !planDefinido.checked;
});

accionesDiv.addEventListener("change", () => {
  const checked = [...accionesDiv.querySelectorAll("input:checked")]
    .map(c => c.value);

  if (checked.length > 0 && !checked.includes("Cumplí plan")) {
    accionCostosaBlock.hidden = false;
    accionCostosaSelect.innerHTML = "";
    checked.forEach(a => accionCostosaSelect.add(new Option(a, a)));
  } else {
    accionCostosaBlock.hidden = true;
    accionCostosaSelect.innerHTML = "";
  }

  btnFinalize.disabled = !validatePEAForm();
});

/* =========================
   FINALIZAR REGISTRO
   ========================= */

btnFinalize.addEventListener("click", () => {
  if (!validatePEAForm()) return;

  const emailHash = localStorage.getItem("CFC_EMAIL_HASH");
  if (!emailHash) return;

  const accionesSeleccionadas = [
    ...accionesDiv.querySelectorAll("input:checked")
  ].map(i => i.value);

  const record = {
    schemaVersion: "PEA_SCHEMA_V1",

    id: new Date().toISOString(),
    createdAtISO: new Date().toISOString(),

    momento: momentoSelect.value,
    instrumento: document.getElementById("instrumento").value.trim(),
    direccion: document.querySelector("input[name='direccion']:checked")?.value || "",

    resultado: document.getElementById("resultado")?.value || "",
    riesgoPlanificado: "",

    P: {
      pensamientoKey: pensamientoSelect.value,
      planDefinido: planDefinido.checked,
      reglaAplicada: document.getElementById("reglaAplicada")?.value || ""
    },

    E: {
      estadoKey: estadoSelect.value,
      intensidad: Number(
        document.querySelector("input[name='intensidad']:checked")?.value || 0
      )
    },

    A: {
      accionesKeys: accionesSeleccionadas,
      accionMasCostosa: accionCostosaSelect.value || ""
    },

    nota180: document.getElementById("nota")?.value || "",

    computed: {}
  };

  // Ejecutar motor determinista
  record.computed = runPEAEngine(record);

  // Persistir (append-only)
  savePEARecord(emailHash, record);

  // Limpiar borrador
  clearDraft(emailHash);

  // Navegar a historial
  window.location.href = "pea_screen_3.html";
});

/* =========================
   VALIDACIÓN CONTINUA
   ========================= */

document.getElementById("peaForm").addEventListener("change", () => {
  btnFinalize.disabled = !validatePEAForm();
});

/* =========================
   CANCELAR
   ========================= */

btnCancel.addEventListener("click", () => {
  window.location.href = "index.html";
});
