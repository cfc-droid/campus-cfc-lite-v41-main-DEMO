/* ============================================================
   PEA VALIDATE — BLOQUE 6 / 14
   Sistema: Análisis (PEA)
   Rol: Validaciones duras, no interpretativas
   ============================================================ */

/* =========================
   UTILIDADES BÁSICAS
   ========================= */

function isEmpty(value) {
  return value === null || value === undefined || value === "";
}

function isValidDateFormat(value) {
  // YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isInCatalog(value, catalogArray) {
  return catalogArray.includes(value);
}

/* =========================
   VALIDACIÓN PRINCIPAL
   ========================= */

function validatePEAForm(formData) {
  const errors = [];

  // 1. Fecha
  if (isEmpty(formData.fecha)) {
    errors.push("Falta fecha.");
  } else if (!isValidDateFormat(formData.fecha)) {
    errors.push("Formato de fecha inválido.");
  }

  // 2. Momento operativo
  if (
    isEmpty(formData.momento) ||
    !isInCatalog(formData.momento, PEA_MOMENTOS)
  ) {
    errors.push("Momento operativo inválido.");
  }

  // 3. Pensamiento
  if (
    isEmpty(formData.pensamiento_key) ||
    !isInCatalog(formData.pensamiento_key, PEA_PENSAMIENTOS)
  ) {
    errors.push("Pensamiento inválido.");
  }

  // 4. Estado operativo
  if (
    isEmpty(formData.estado_key) ||
    !isInCatalog(formData.estado_key, PEA_ESTADOS_OPERATIVOS)
  ) {
    errors.push("Estado operativo inválido.");
  }

  // 5. Intensidad
  if (
    isEmpty(formData.intensidad) ||
    !PEA_INTENSIDADES.includes(formData.intensidad)
  ) {
    errors.push("Intensidad inválida.");
  }

  // 6. Acciones (mínimo 1)
  if (
    !Array.isArray(formData.acciones_keys) ||
    formData.acciones_keys.length === 0
  ) {
    errors.push("Debe existir al menos una acción.");
  } else {
    formData.acciones_keys.forEach((accion) => {
      if (!isInCatalog(accion, PEA_ACCIONES)) {
        errors.push("Acción inválida detectada.");
      }
    });
  }

  // 7. Dirección
  if (
    isEmpty(formData.direccion) ||
    !isInCatalog(formData.direccion, PEA_DIRECCION)
  ) {
    errors.push("Dirección inválida.");
  }

  // 8. Nota factual (si existe)
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
