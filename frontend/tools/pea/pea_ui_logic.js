import {
  PEA_PENSAMIENTOS,
  PEA_ESTADOS_OPERATIVOS,
  PEA_ACCIONES
} from "./pea_catalog.js";

import { validatePEAForm } from "./pea_validate.js";
import { savePEARecord, clearDraft } from "./pea_storage.js";
import { runPEAEngine } from "./pea_engine.js";
import { savePEAView } from "./pea_view_storage.js";

/* =========================
   ELEMENTOS
   ========================= */

const pensamientoSelect = document.getElementById("pensamiento");
const estadoSelect = document.getElementById("estado");
const accionesDiv = document.getElementById("acciones");
const accionCostosaBlock = document.getElementById("accionCostosaBlock");
const accionCostosaSelect = document.getElementById("accionCostosa");
const momentoSelect = document.getElementById("momento");
const resultadoBlock = document.getElementById("resultadoBlock");
const planDefinido = document.getElementById("planDefinido");
const reglaBlock = document.getElementById("reglaBlock");

const btnSave = document.getElementById("btnSave");
const btnFinalize = document.getElementById("btnFinalize");
const btnCancel = document.getElementById("btnCancel");

const btnSaveBottom = document.getElementById("btnSaveBottom");
const btnFinalizeBottom = document.getElementById("btnFinalizeBottom");
const btnCancelBottom = document.getElementById("btnCancelBottom");

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

accionesDiv.addEventListener("change", actualizarEstadoFinalizar);

document.getElementById("peaForm").addEventListener("change", actualizarEstadoFinalizar);

function actualizarEstadoFinalizar() {
  const valido = validatePEAForm();
  btnFinalize.disabled = !valido;
  btnFinalizeBottom.disabled = !valido;

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
}

/* =========================
   GUARDAR (BORRADOR SIMPLE)
   ========================= */

function guardarBorrador() {
  alert("Borrador guardado localmente (no entra al historial)");
}

btnSave.addEventListener("click", guardarBorrador);
btnSaveBottom.addEventListener("click", guardarBorrador);

/* =========================
   FINALIZAR REGISTRO
   ========================= */

function finalizarRegistro() {
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

  record.computed = runPEAEngine(record);

  savePEARecord(emailHash, record);
  clearDraft(emailHash);

  savePEAView(emailHash, {
    source: "FINALIZE",
    recordIds: [record.id],
    appliedFilters: {},
    selectedId: record.id
  });

  window.location.href = "pea_screen_2.html";
}

btnFinalize.addEventListener("click", finalizarRegistro);
btnFinalizeBottom.addEventListener("click", finalizarRegistro);

/* =========================
   CANCELAR
   ========================= */

function cancelar() {
  window.location.href = "index.html";
}

btnCancel.addEventListener("click", cancelar);
btnCancelBottom.addEventListener("click", cancelar);
