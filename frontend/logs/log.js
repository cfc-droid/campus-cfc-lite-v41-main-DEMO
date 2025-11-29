/*
============================================
Archivo: /frontend/logs/log.js
Versión: V37 FINAL
Autor: Cristian F. Choqui (CFC)
Descripción:
Sistema de registro automático de eventos,
fallos y métricas internas del Campus.
============================================
*/

export function logEvent(mensaje) {
  const timestamp = new Date().toISOString();
  console.log(`[CFC-LOG] ${timestamp} — ${mensaje}`);
}

// --- Ejemplos de uso automáticos ---

// 1️⃣ Registrar apertura inicial del campus
window.addEventListener("DOMContentLoaded", () => {
  logEvent("Primera apertura del Campus detectada.");
});

// 2️⃣ Registrar errores de carga de módulos
window.addEventListener("error", (e) => {
  logEvent(`⚠️ Fallo detectado en módulo o script: ${e.filename}`);
});

// 3️⃣ Registrar conexión a Supabase fallida (si aplica)
window.addEventListener("supabaseError", () => {
  logEvent("❌ Error de conexión a Supabase detectado.");
});

// 4️⃣ Registrar examen aprobado (simulación futura)
window.addEventListener("examPassed", (e) => {
  logEvent(`✅ Examen aprobado — ID: ${e.detail?.examId || "desconocido"}`);
});

// 5️⃣ Mensaje final de activación
logEvent("CFC-LOG activo ✅");
