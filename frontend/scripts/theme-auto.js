/* ============================================================
   Archivo: /frontend/scripts/theme-auto.js
   Versión: V37 FINAL
   Punto: 10/15 — Experiencia Premium Visual Unificada
   Paso: 3/6 — Paleta adaptable automática
   Autor: Cristian F. Choqui (CFC)
   Descripción: Adapta el tema (día/noche) según la hora local
                sin interferir con el control manual del usuario.
=============================================================== */

// Detecta la hora local del dispositivo
const horaLocal = new Date().getHours();

// Verifica si ya hay una preferencia guardada (modo manual)
const modoManual = localStorage.getItem("modoManual");

// Solo aplica modo automático si no hay selección manual
if (!modoManual) {
  if (horaLocal >= 19 || horaLocal < 6) {
    document.body.classList.add("dark-mode");
    console.log("🌙 Modo oscuro automático activado (noche).");
  } else {
    document.body.classList.remove("dark-mode");
    console.log("☀️ Modo claro automático activado (día).");
  }
}

// Transición suave al cambiar fondo o colores
document.body.style.transition = "background 1s ease-in-out, color 0.8s ease-in-out";

// Observa los cambios del sistema operativo (opcional, mejora UX)
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.body.classList.add("dark-mode");
  console.log("🌓 Detectado esquema oscuro del sistema.");
}
