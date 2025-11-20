/*
============================================
Archivo: /frontend/scripts/screenshot.js
Versión: V37 FINAL
Autor: Cristian F. Choqui (CFC)
Descripción:
Captura automática del Campus con html2canvas
al finalizar QA o validación del sistema.
============================================
*/

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[CFC-SCREENSHOT] Inicializando módulo de captura...");

  // 1️⃣ Cargar librería html2canvas si no existe
  if (typeof html2canvas === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
    document.head.appendChild(script);
    await new Promise(res => (script.onload = res));
    console.log("[CFC-SCREENSHOT] Librería html2canvas cargada correctamente.");
  }

  // 2️⃣ Esperar unos segundos para que cargue todo el DOM
  setTimeout(async () => {
    try {
      const element = document.body;
      const canvas = await html2canvas(element, { scale: 1 });
      const image = canvas.toDataURL("image/png");

      // 3️⃣ Descargar automáticamente la captura
      const link = document.createElement("a");
      link.href = image;
      link.download = "campus_final.png";
      link.click();

      console.log("✅ [CFC-SCREENSHOT] Captura automática generada correctamente: campus_final.png");
    } catch (error) {
      console.error("❌ [CFC-SCREENSHOT] Error al generar la captura:", error);
    }
  }, 5000); // Espera 5 segundos antes de capturar
});
