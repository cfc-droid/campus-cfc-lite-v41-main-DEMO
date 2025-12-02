/* ==========================================================
Archivo: /frontend/template_config/branding.js
Versión: V37 FINAL
Punto: 12/15 — Clonado Multi-Nicho y Plantilla Base LITE
Autor: Cristian F. Choqui (CFC)
Descripción:
Define variables globales de identidad visual y texto del clon.
=========================================================== */

export const branding = {
  nombreCampus: "Campus CFC Trading LITE",
  nicho: "Trading Psicológico",
  autor: "Cristian F. Choqui (CFC)",
  logo: "/frontend/assets/img/logo-cfc.png",
  colorPrimario: "#FFD700",
  colorSecundario: "#FF8C00",
  version: "V37 FINAL",
  dominio: "https://campus-cfc-lite-v37.pages.dev"
};

/* Mostrar branding activo en consola */
console.log(`🎓 Campus activo: ${branding.nombreCampus} — Nicho: ${branding.nicho}`);
