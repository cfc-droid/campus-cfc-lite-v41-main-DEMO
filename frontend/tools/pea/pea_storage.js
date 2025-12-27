/* ============================================================
   PEA STORAGE — BLOQUE 7 / 14
   Persistencia OFFLINE · Inmutable · Por usuario
   ============================================================ */

/*
 REGLAS FUNDAMENTALES
 ------------------------------------------------------------
 - Offline first
 - Sin backend
 - Sin sincronización externa
 - Un usuario ≠ otro usuario
 - No sobrescritura
 - No edición
 - El log solo CRECE
*/

/* =========================
   CONSTANTES INMUTABLES
   ========================= */

const STORAGE_KEYS = {
  LOG: (hash) => `CFC_PEA_LOG_${hash}`,
  PREFERENCES: (hash) => `CFC_PEA_PREFERENCES_${hash}`,
  SNAPSHOTS: (hash) => `CFC_PEA_SNAPSHOTS_${hash}`
};

/* =========================
   UTILIDADES INTERNAS
   ========================= */

function getPEAEmailHash() {
  const hash = localStorage.getItem("PEA_EMAIL_HASH");

  if (!hash) {
    throw new Error("PEA STORAGE: PEA_EMAIL_HASH no disponible.");
  }

  return hash;
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function nowISO() {
  return new Date().toISOString();
}

/* =========================
   LOAD LOG (SOLO LECTURA)
   ========================= */

function loadPEALog() {
  const hash = getPEAEmailHash();
  const key = STORAGE_KEYS.LOG(hash);

  const raw = localStorage.getItem(key);
  if (!raw) return [];

  const parsed = safeParse(raw);
  if (!Array.isArray(parsed)) return [];

  -  return parsed;
+  return [...parsed].sort((a, b) => {
+    const ta = a?.meta?.created_at_iso || "";
+    const tb = b?.meta?.created_at_iso || "";
+    return tb.localeCompare(ta); // más reciente primero
+  });

/* =========================
   SAVE RECORD (APPEND ONLY)
   ========================= */

function savePEARecord(record) {
  if (!record || typeof record !== "object") {
    throw new Error("PEA STORAGE: registro inválido.");
  }

  const hash = getPEAEmailHash();
  const key = STORAGE_KEYS.LOG(hash);

  const log = loadPEALog();

  // Regla absoluta: NO sobrescribir
  const exists = log.some(r => r.id === record.id);
  if (exists) {
    throw new Error("PEA STORAGE: intento de sobrescritura bloqueado.");
  }

  const recordToSave = {
    ...record,
    meta: {
      ...(record.meta || {}),
      estado: "VALIDO",
      created_at_iso: nowISO()
    }
  };

  const newLog = [...log, recordToSave];
  localStorage.setItem(key, JSON.stringify(newLog));

  return recordToSave;
}

/* =========================
   MARK AS ANULADO (NO BORRA)
   ========================= */

function markAsAnulado(recordId) {
  if (!recordId) {
    throw new Error("PEA STORAGE: recordId requerido.");
  }

  const hash = getPEAEmailHash();
  const key = STORAGE_KEYS.LOG(hash);

  const log = loadPEALog();

  const newLog = log.map(record => {
    if (record.id !== recordId) return record;

    return {
      ...record,
      meta: {
        ...(record.meta || {}),
        estado: "ANULADO",
        anulled_at_iso: nowISO()
      }
    };
  });

  localStorage.setItem(key, JSON.stringify(newLog));
}

/* =========================
   CREATE CORRECTION RECORD
   ========================= */

function createCorrection(originalId, newRecord) {
  if (!originalId) {
    throw new Error("PEA STORAGE: originalId requerido.");
  }
  if (!newRecord || typeof newRecord !== "object") {
    throw new Error("PEA STORAGE: newRecord inválido.");
  }

  const correctedRecord = {
    ...newRecord,
    correction_of: originalId,
    meta: {
      ...(newRecord.meta || {}),
      estado: "CORRECCION",
      created_at_iso: nowISO()
    }
  };

  return savePEARecord(correctedRecord);
}

/* =========================
   EXPORT API PÚBLICA
   ========================= */

window.PEA_STORAGE = Object.freeze({
  loadPEALog,
  savePEARecord,
  markAsAnulado,
  createCorrection
});
