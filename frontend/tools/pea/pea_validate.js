/* ============================================================
   PEA VALIDATE — BLOQUE 6 / 14
   Validaciones duras, NO interpretativas
   ============================================================ */

const PEA_NOTA_MAX_CHARS = 180;

function isEmpty(v) {
  return v === null || v === undefined || v === "";
}

function isValidDateFormat(v) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function validatePEAForm(formData) {
  const errors = [];

  // Fecha
  if (isEmpty(formData.fecha)) {
    errors.push("Falta fecha.");
  } else if (!isValidDateFormat(formData.fecha)) {
    errors.push("Formato de fecha inválido.");
  }

  // Momento
  if (isEmpty(formData.momento)) {
    errors.push("Momento operativo faltante.");
  }

  // Resultado operativo (OBLIGATORIO solo si Momento = DESPUÉS)
 if (
  formData.momento?.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "DESPUES" &&
  isEmpty(formData.resultado_operativo)
) {
    errors.push(
      "Resultado operativo obligatorio cuando el momento es DESPUÉS."
    );
  }
   
  // Pensamiento
  if (isEmpty(formData.pensamiento_key)) {
    errors.push("Pensamiento faltante.");
  }

  // Estado
  if (isEmpty(formData.estado_key)) {
    errors.push("Estado operativo faltante.");
  }

  // Intensidad
  if (
    typeof formData.intensidad !== "number" ||
    formData.intensidad < 1 ||
    formData.intensidad > 5
  ) {
    errors.push("Intensidad inválida.");
  }

  // Acciones (2 a 5)
  if (
    !Array.isArray(formData.acciones_keys) ||
    formData.acciones_keys.length < 2 ||
    formData.acciones_keys.length > 5
  ) {
    errors.push("Debe seleccionar entre 2 y 5 acciones.");
  }

  // Dirección
  if (isEmpty(formData.direccion)) {
    errors.push("Dirección faltante.");
  }

  // Nota factual
  if (
    formData.nota_factual &&
    formData.nota_factual.length > PEA_NOTA_MAX_CHARS
  ) {
    errors.push("Nota factual excede el máximo permitido.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Exponer global
window.validatePEAForm = validatePEAForm;
