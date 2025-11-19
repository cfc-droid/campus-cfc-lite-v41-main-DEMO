/*
============================================
Archivo: /frontend/logs/support.js
Versión: V37 FINAL
Autor: Cristian F. Choqui (CFC)
Descripción:
Sistema de soporte y exportación ligera de logs.
Compatible con log.js (registro principal).
============================================
*/

// Importar la función logEvent si el entorno lo soporta
import { logEvent } from "./log.js";

// Almacenamiento temporal de logs en memoria
const CFC_LOGS = [];

// Sobrescribir la función original para guardar también en memoria
const originalConsoleLog = console.log;
console.log = function (...args) {
  originalConsoleLog.apply(console, args);
  const msg = args.join(" ");
  if (msg.includes("[CFC-LOG]")) {
    CFC_LOGS.push({ timestamp: new Date().toISOString(), message: msg });
  }
};

// Función para exportar los logs en formato CSV
function exportLogsCSV() {
  if (CFC_LOGS.length === 0) {
    alert("⚠️ No hay logs registrados aún.");
    return;
  }

  const header = "timestamp,message\n";
  const rows = CFC_LOGS.map(
    (log) => `${log.timestamp},"${log.message.replace(/"/g, "'")}"`
  );
  const csv = header + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cfc_logs.csv";
  link.click();

  logEvent("📤 Logs exportados correctamente a cfc_logs.csv");
}

// Botón flotante para exportar los logs visualmente
function createExportButton() {
  const btn = document.createElement("button");
  btn.innerText = "📤 Exportar Logs";
  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.right = "20px";
  btn.style.background = "#ffcc00";
  btn.style.border = "none";
  btn.style.padding = "10px 16px";
  btn.style.borderRadius = "12px";
  btn.style.cursor = "pointer";
  btn.style.fontWeight = "600";
  btn.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  btn.onclick = exportLogsCSV;
  document.body.appendChild(btn);
}

// Activación automática
window.addEventListener("DOMContentLoaded", () => {
  logEvent("🩺 Sistema de soporte visual CFC activo ✅");
  createExportButton();
});
