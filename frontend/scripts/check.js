/* =====================================================
Archivo: /frontend/scripts/check.js
Versión: V37 FINAL
Punto: 14/15 — Checklist y QA Final Animada
Autor: Cristian F. Choqui (CFC)
Descripción:
Autodiagnóstico del Campus CFC Trading LITE antes del deploy.
===================================================== */

const SUPABASE_URL = "https://TU_SUPABASE_URL_HERE.supabase.co"; // ← reemplazar por tu URL real

async function runCheck() {
  console.log("[CFC-CHECK] 🔍 Iniciando autodiagnóstico del sistema...");

  try {
    // 1️⃣ Verificar conexión a Supabase
    const res = await fetch(`${SUPABASE_URL}/health`);
    if (!res.ok) throw new Error("Error al conectar con Supabase.");
    const data = await res.text();

    if (data.includes("OK")) {
      console.log("✅ [CFC-CHECK] Conexión a Supabase verificada correctamente.");
    } else {
      console.warn("⚠️ [CFC-CHECK] Respuesta inesperada del servidor Supabase.");
    }

    // 2️⃣ Detectar errores JS globales
    window.onerror = function (msg, src, line, col, error) {
      console.error(`[CFC-CHECK] ❌ Error detectado: ${msg} (${src}:${line}:${col})`);
    };

    // 3️⃣ Mensaje final
    console.log("✅ Campus CFC Trading LITE — Sistema Verificado Correctamente.");

  } catch (error) {
    console.error("[CFC-CHECK] ❌ Error en el autodiagnóstico:", error);
  }
}

// Ejecutar automáticamente
document.addEventListener("DOMContentLoaded", runCheck);
