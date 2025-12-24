/* ============================================================
   PEA STORAGE — OFFLINE / LOCAL
   Sistema: Análisis (PEA)
   Bloque: 5/14 — STORAGE OFFLINE + BORRADORES
   Naturaleza: Persistencia pura (no lógica)

   REGLAS:
   - Offline only
   - Sin backend
   - Sin mezcla de usuarios
   - Sin edición de registros
   - Sin interpretación
   ============================================================ */

/* =========================
   HELPERS INTERNOS
   ========================= */

/**
 * Genera clave única por usuario
 * @param {string} emailHash
 */
function getLogKey(emailHash) {
  return `CFC_PEA_LOG_${emailHash}`;
}

function getDraftKey(emailHash) {
  return `CFC_PEA_DRAFT_${emailHash}`;
}

/* =========================
   LOG — HISTORIAL (SOLO CRECE)
   ========================= */

/**
 * Carga el historial completo del usuario
 * @param {string} emailHash
 * @returns {Array}
 */
export function loadPEALog(emailHash) {
  const raw = localStorage.getItem(getLogKey(emailHash));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Guarda un nuevo registro PEA (append-only)
 * @param {string} emailHash
 * @param {Object} record (PEARecord completo)
 */
export function savePEARecord(emailHash, record) {
  const log = loadPEALog(emailHash);
  log.push(record);
  localStorage.setItem(getLogKey(emailHash), JSON.stringify(log));
}

/* =========================
   DRAFT — BORRADOR ÚNICO
   ========================= */

/**
 * Carga borrador activo (si existe)
 * @param {string} emailHash
 * @returns {Object|null}
 */
export function loadDraft(emailHash) {
  const raw = localStorage.getItem(getDraftKey(emailHash));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Guarda borrador (sobrescribe el anterior)
 * @param {string} emailHash
 * @param {Object} record (PEARecord incompleto)
 */
export function saveDraft(emailHash, record) {
  localStorage.setItem(getDraftKey(emailHash), JSON.stringify(record));
}

/**
 * Elimina el borrador activo
 * @param {string} emailHash
 */
export function clearDraft(emailHash) {
  localStorage.removeItem(getDraftKey(emailHash));
}

/* ============================================================
   REGLAS DEL STORAGE
   - LOG: append-only, nunca se edita
   - DRAFT: máximo 1, reemplazable
   - No validaciones
   - No interpretación
   ============================================================ */
