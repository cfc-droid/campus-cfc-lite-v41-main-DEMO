/* ================================================================
   🔵 CFC-SYNC BOOT V1 — SUBPASO 5/5-E (FINAL)
   Archivo: /frontend/js/cfc_sync_boot.js
   Autor: CFC-Droid + Cristian F. Choqui
   Objetivo: Restauración automática del progreso al iniciar sesión.
   Fecha: 2025-11-30
   ================================================================ */

console.log("🟦 CFC_SYNC_BOOT_READY — Archivo cargado", new Date().toLocaleString());

/* ================================================================
   🟦 ACCIÓN 5/5-E.1 — Declaración de funciones base
   ================================================================ */

function CFC_syncBoot_start(email) {
  console.log("🔵 [BOOT] CFC_syncBoot_start() iniciado para:", email);

  if (!email || typeof email !== "string") {
    console.error("❌ [BOOT] Email inválido. Cancelado.");
    return;
  }

  // Ejecutar proceso interno
  CFC_syncBoot_process(email);
}

async function CFC_syncBoot_process(email) {
  try {
    console.log("🔄 [BOOT] Restauración automática iniciada…", email);

    /* ============================================================
       1) IMPORTAR REMOTO
       ============================================================ */
    const remoteData = await CFC_syncRemote_import(email);
    console.log("⬇️ [BOOT] REMOTE IMPORT DONE → claves:", Object.keys(remoteData).length);

    /* ============================================================
       2) LEER LOCAL (LO ACTUAL)
       ============================================================ */
    const localData = CFC_syncReader_collect();
    console.log("📘 [BOOT] LOCAL READER DONE → claves:", Object.keys(localData).length);

    /* ============================================================
       3) MERGE REMOTO + LOCAL
       ============================================================ */
    const finalData = CFC_syncRemote_merge(localData, remoteData);
    console.log("🟩 [BOOT] MERGE DONE → claves finales:", Object.keys(finalData).length);

    /* ============================================================
       4) APLICAR CLAVES FINALES
       ============================================================ */
    CFC_syncBoot_apply(finalData);

  } catch (err) {
    console.error("❌ [BOOT] Error en proceso:", err);
  }
}

/* ================================================================
   🟦 ACCIÓN 5/5-E.3 — Aplicación del Writer + Verificación
   ================================================================ */

function CFC_syncBoot_apply(finalData) {
  console.log("🛠 [BOOT] Aplicando claves restauradas…");

  if (!finalData || typeof finalData !== "object") {
    console.error("❌ [BOOT] finalData inválido. Cancelado.");
    return;
  }

  const claves = Object.keys(finalData);
  if (claves.length === 0) {
    console.warn("⚠️ [BOOT] No hay claves para restaurar.");
    return;
  }

  // Aplicar con seguridad (sin sobrescribir claves válidas)
  const result = CFC_syncWriter_run(finalData);

  console.log("🟢 [BOOT] Restauración automática completada.");
  console.log("🟨 [BOOT] Claves totales recibidas:", claves.length);
  console.log("🟦 [BOOT] Restauradas:", result?.restored?.length || 0);
  console.log("⬜ [BOOT] Preservadas:", result?.preserved?.length || 0);

  console.log("📌 [BOOT] Prefijos detectados:", {
    CFC_: claves.filter(k => k.startsWith("CFC_")).length,
    progress: claves.filter(k => k.startsWith("progress")).length,
    exam: claves.filter(k => k.startsWith("exam")).length,
    bitacora: claves.filter(k => k.startsWith("bitacora")).length,
    activity: claves.filter(k => k.startsWith("activity")).length
  });
}

/* ================================================================
   🟦 ACCIÓN 5/5-E — AUTO-EJECUCIÓN AL CARGAR EL CAMPUS
   - Sin loops
   - No interfiere con Login
   - Solo se ejecuta si hay email cargado
   ================================================================ */

window.addEventListener("load", () => {
  try {
    const email = localStorage.getItem("CFC_EMAIL");

    if (!email) {
      console.log("ℹ️ [BOOT] No hay email — usuario no logueado. Boot inactivo.");
      return;
    }

    console.log("🟦 [BOOT] Auto-start habilitado →", email);
    CFC_syncBoot_start(email);

  } catch (err) {
    console.error("❌ [BOOT] Error en auto-start:", err);
  }
});

/* ================================================================
   FIN DEL ARCHIVO CFC-SYNC BOOT
   ================================================================ */
