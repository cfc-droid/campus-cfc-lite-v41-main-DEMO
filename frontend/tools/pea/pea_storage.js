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

  return [...parsed].sort((a, b) => {
    const ta = a?.meta?.created_at_iso || "";
    const tb = b?.meta?.created_at_iso || "";
    return tb.localeCompare(ta);
  });
}

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

    // =========================
  // MOMENTO ESTRUCTURAL — HERENCIA AUTOMÁTICA
  // =========================
  let inheritedMomentoEstructural = "SIN_MARCAR";

  const lastValid = log.find(
    r =>
      r?.meta?.estado !== "ANULADO" &&
      r?.momento_estructural &&
      r.momento_estructural !== "SIN_MARCAR"
  );

  if (lastValid) {
    inheritedMomentoEstructural = lastValid.momento_estructural;
  } 

  // Regla absoluta: NO sobrescribir
  const exists = log.some(r => r.id === record.id);
  if (exists) {
    throw new Error("PEA STORAGE: intento de sobrescritura bloqueado.");
  }

const recordToSave = {
  ...record,

  // 🔒 Congelado automático
  momento_estructural:
    record.momento_estructural && record.momento_estructural !== "SIN_MARCAR"
      ? record.momento_estructural
      : inheritedMomentoEstructural,

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
   MARK AS CORREGIDO (SIN CREAR REGISTRO)
   ========================= */

function markAsCorregido(recordId, extraMeta = {}) {
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

  // ⬇️ Campos permitidos a corregir
  fecha: extraMeta.fecha ?? record.fecha,
  momento: extraMeta.momento ?? record.momento, 

  // 🔑 FIX RESULTADO OPERATIVO
  resultado_operativo:
    extraMeta.resultado_operativo ?? record.resultado_operativo,
   
  pensamiento_key: extraMeta.pensamiento_key ?? record.pensamiento_key,
  estado_key: extraMeta.estado_key ?? record.estado_key,
  intensidad: extraMeta.intensidad ?? record.intensidad,
  acciones_keys: Array.isArray(extraMeta.acciones_keys)
    ? extraMeta.acciones_keys
    : record.acciones_keys,
  direccion: extraMeta.direccion ?? record.direccion,
  activo: extraMeta.activo ?? record.activo,
  activo_otros: extraMeta.activo_otros ?? record.activo_otros,
  instrumento: extraMeta.instrumento ?? record.instrumento,
  instrumento_otros: extraMeta.instrumento_otros ?? record.instrumento_otros,
  nota_factual: extraMeta.nota_factual ?? record.nota_factual,
  momento_estructural: extraMeta.momento_estructural ?? record.momento_estructural,

  meta: {
    ...(record.meta || {}),
    estado: "CORREGIDO",
    corregido_at_iso: nowISO()
  }
};
  });

  localStorage.setItem(key, JSON.stringify(newLog));
}

/* =========================
   CREATE CORRECTION RECORD (DESACTIVADO)
   ========================= */

function createCorrection(originalId) {
  // Se mantiene por compatibilidad histórica,
  // pero NO crea nuevos registros.
  markAsCorregido(originalId);
}

/* =========================
   EXPORT API PÚBLICA
   ========================= */

window.PEA_STORAGE = Object.freeze({
  loadPEALog,
  savePEARecord,
  markAsAnulado,
  markAsCorregido
});
