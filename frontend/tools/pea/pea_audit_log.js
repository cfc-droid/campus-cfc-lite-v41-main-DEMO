/* =========================================================
   PEA — AUDITORÍA DE USO (NO CONDUCTUAL)
   Archivo: pea_audit_log.js
   ========================================================= */

const PEA_AUDIT_KEY_PREFIX = "PEA_AUDIT_LOG_";

const ALLOWED_EVENTS = new Set([
  "REGISTER_CREATE",
  "REGISTER_UPDATE",
  "REGISTER_DELETE",
  "FILTER_APPLY",
  "FILTER_CLEAR",
  "EXPORT_EXCEL",
  "EXPORT_PDF",
  "EXPORT_WORD",
  "EXPORT_AUDIT"
]);

function getUserAuditKey() {
  const emailHash = localStorage.getItem("emailHash");
  if (!emailHash) {
    throw new Error("emailHash no disponible");
  }
  return `${PEA_AUDIT_KEY_PREFIX}${emailHash}`;
}

/**
 * @param {string} eventType
 */
export function logPEAEvent(eventType) {
  if (!ALLOWED_EVENTS.has(eventType)) {
    throw new Error("Evento de auditoría no permitido");
  }

  const key = getUserAuditKey();
  const raw = localStorage.getItem(key);
  const log = raw ? JSON.parse(raw) : [];

  log.push({
    type: eventType,
    ts: new Date().toISOString()
  });

  localStorage.setItem(key, JSON.stringify(log));
}

/**
 * SOLO LECTURA — PARA EXPORT / AUDITORÍA
 */
export function readPEAAuditLog() {
  const key = getUserAuditKey();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
