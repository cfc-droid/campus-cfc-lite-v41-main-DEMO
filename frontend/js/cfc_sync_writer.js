/* ==========================================================
   CFC-SYNC WRITER — SUBPASO 5/5-B (COMPLETO)
   Versión: CFC_SYNC_WRITER_V1.0
   Objetivo:
     - Restaurar progreso local desde JSON generado por el READER
     - NO borrar nada
     - NO pisar claves existentes
     - Restauración segura para multi-dispositivo
     - Logs Premium CFC-SYNC
   ========================================================== */

console.log("🟩 CFC_SYNC_WRITER_READY — Archivo cargado (SUBPASO 5/5-B COMPLETO)");

/* ----------------------------------------------------------
   Espacio de nombres
----------------------------------------------------------- */
const CFC_SYNC_WRITER = {};

/* ----------------------------------------------------------
   5/5-B.3 — Validación del payload
----------------------------------------------------------- */
CFC_SYNC_WRITER.validatePayload = function (jsonData) {
  console.log("🧪 CFC_SYNC_WRITER.validatePayload() — Validando payload...");

  if (!jsonData || typeof jsonData !== "object") {
    console.error("⛔ Payload inválido: no es un objeto");
    return false;
  }

  const keys = Object.keys(jsonData);
  if (keys.length === 0) {
    console.error("⛔ Payload vacío: no contiene claves");
    return false;
  }

  const banned = ["http", "<script", "{", "}"]; // seguridad mínima
  for (const key of keys) {
    if (banned.some((b) => key.includes(b))) {
      console.error("⛔ Prefijo o clave prohibida detectada:", key);
      return false;
    }
  }

  console.log("✅ Payload válido —", keys.length, "claves detectadas");
  return true;
};

/* ----------------------------------------------------------
   5/5-B.2 — Lógica de restauración segura (apply)
----------------------------------------------------------- */
CFC_SYNC_WRITER.apply = function (jsonData) {
  console.log("🚚 CFC_SYNC_WRITER.apply() — Iniciando restauración...");

  const restored = [];
  const preserved = [];

  for (const key in jsonData) {
    const value = jsonData[key];

    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, value);
      restored.push(key);
    } else {
      preserved.push(key);
    }
  }

  console.group("📦 CFC-SYNC WRITER — RESULTADO");
  console.log("🔹 Restauradas:", restored.length, restored);
  console.log("🔸 Preservadas:", preserved.length, preserved);
  console.groupEnd();

  return { restored, preserved };
};

/* ----------------------------------------------------------
   5/5-B.4 — Orquestador (run)
----------------------------------------------------------- */
CFC_SYNC_WRITER.run = function (jsonData) {
  try {
    console.log("▶️ CFC_SYNC_WRITER.run() — Ejecutando...");

    const ok = CFC_SYNC_WRITER.validatePayload(jsonData);
    if (!ok) {
      console.error("⛔ Restauración cancelada por payload inválido");
      return null;
    }

    const result = CFC_SYNC_WRITER.apply(jsonData);

    console.log("✅ Restauración CFC-SYNC completada correctamente");
    return result;
  } catch (err) {
    console.error("⛔ ERROR en CFC_SYNC_WRITER.run()", err);
    return null;
  }
};
