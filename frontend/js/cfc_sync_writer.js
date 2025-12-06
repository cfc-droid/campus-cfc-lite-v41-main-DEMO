/* ============================================================
   🔵 CFC-SYNC WRITER — Restauración segura V1.0
   CFC_FUNC_5_5_B — Campus CFC LITE V41
   Autor: Cristian F. Choqui (CFC)
   Fecha: 2025-11-29
   ============================================================ */

console.log(
  "🟦 [CFC-SYNC-WRITER] Cargado — listo para restaurar progreso sin borrar nada.",
  new Date().toLocaleString()
);

/* ============================================================
   🟦 5/5-B.3 — VALIDACIÓN DEL PAYLOAD
   ============================================================ */
function CFC_syncWriter_validatePayload(jsonData) {
  console.log("🔍 [WRITER] Validando payload recibido…");

  if (!jsonData || typeof jsonData !== "object") {
    console.error("❌ [WRITER] Payload inválido: no es un objeto.");
    return false;
  }

  const claves = Object.keys(jsonData);
  if (claves.length === 0) {
    console.error("❌ [WRITER] Payload vacío — no hay nada para restaurar.");
    return false;
  }

  // Prefijos NO permitidos (seguridad)
  const prefijosProhibidos = [
    "CFC_SESSION",
    "CFC_DEVICE",
    "CFC_HEART",
    "CFC_LOCK"
  ];

  for (let key of claves) {
    for (let block of prefijosProhibidos) {
      if (key.startsWith(block)) {
        console.warn(
          `⚠️ [WRITER] Clave prohibida detectada y omitida: ${key}`
        );
        return false;
      }
    }
  }

  console.log("✅ [WRITER] Payload válido.");
  return true;
}

/* ============================================================
   🟦 5/5-B.2 — RESTAURACIÓN SEGURA
   ============================================================ */
function CFC_syncWriter_apply(jsonData) {
  console.log("🛠 [WRITER] Iniciando restauración segura…");

  const restored = [];
  const preserved = [];

  for (let key in jsonData) {
    const exists = localStorage.getItem(key);

    if (exists === null) {
      // Crear nueva clave
      localStorage.setItem(key, jsonData[key]);
      restored.push(key);
    } else {
      // No sobrescribir ni borrar
      preserved.push(key);
    }
  }

  console.log("🔵 [WRITER] FIN de apply()");
  console.log("🟩 Restauradas:", restored);
  console.log("⬜ Preservadas:", preserved);

  return { restored, preserved };
}

/* ============================================================
   🟦 5/5-B.4 — ORQUESTADOR PRINCIPAL
   ============================================================ */
function CFC_syncWriter_run(jsonData) {
  console.log("🚀 [WRITER] Ejecutando Writer…");

  const valid = CFC_syncWriter_validatePayload(jsonData);
  if (!valid) {
    console.warn("⛔ [WRITER] Restauración cancelada por payload inválido.");
    return null;
  }

  const result = CFC_syncWriter_apply(jsonData);

  console.log("✅ [WRITER] Restauración completada.");
  console.log(result);

  return result;
}

/* ============================================================
   FIN DEL CFC-SYNC WRITER
   ============================================================ */
