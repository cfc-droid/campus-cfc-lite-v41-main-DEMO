import {
  PEA_PENSAMIENTOS,
  PEA_ESTADOS_OPERATIVOS,
  PEA_ACCIONES
} from "./pea_catalog.js";

import { validatePEAForm } from "./pea_validate.js";

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

/* Placeholder explícito */
document.getElementById("btnSave").addEventListener("click", () => {
  alert("Borrador no conectado (BLOQUE 5/14)");
});

/* Cargar catálogos */
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

/* Reglas UI */
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

/* Validación continua */
document.getElementById("peaForm").addEventListener("change", () => {
  btnFinalize.disabled = !validatePEAForm();
});
