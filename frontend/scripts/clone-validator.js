/* ==========================================================
Archivo: /frontend/scripts/clone-validator.js
Versión: V37 FINAL
Punto: 12/15 — Clonado Multi-Nicho y Control de Licencias
Autor: Cristian F. Choqui (CFC)
Descripción:
Valida que el clon del Campus tenga licencia, branding y colores correctos.
=========================================================== */

import { branding } from "/frontend/template_config/branding.js";

async function validarClone() {
  try {
    // Cargar licencia
    const resLicense = await fetch("/frontend/template_config/license.json");
    const licencia = await resLicense.json();

    // Cargar meta del clon
    const resMeta = await fetch("/frontend/template_config/meta.json");
    const meta = await resMeta.json();

    console.log(`🔐 Licencia detectada — Cliente: ${licencia.cliente} | Hash: ${licencia.hash}`);

    // Validación visual básica
    const rootStyles = getComputedStyle(document.documentElement);
    const colorPrimario = rootStyles.getPropertyValue("--color-primario").trim();
    const logo = branding.logo;

    // Comprobaciones
    if (colorPrimario === "#FFD700" && logo.includes("logo-cfc.png")) {
      console.warn("⚠️ Atención: el clon aún usa branding genérico. Personaliza antes de distribuir.");
      mostrarAlerta("Clon incompleto: reemplace logo o colores antes de entrega final.");
    } else {
      console.log("✅ Branding verificado correctamente.");
    }

    // Mostrar datos básicos del clon en consola
    console.log(`📦 Campus: ${meta.nombre} | Versión: ${meta.version} | Cliente: ${licencia.cliente}`);

  } catch (error) {
    console.error("❌ Error al validar el clon:", error);
  }
}

// Alerta visual simple en caso de error de branding
function mostrarAlerta(msg) {
  const alerta = document.createElement("div");
  alerta.textContent = msg;
  alerta.style.position = "fixed";
  alerta.style.bottom = "20px";
  alerta.style.right = "20px";
  alerta.style.background = "rgba(255,0,0,0.85)";
  alerta.style.color = "#fff";
  alerta.style.padding = "12px 18px";
  alerta.style.borderRadius = "8px";
  alerta.style.fontSize = "0.9rem";
  alerta.style.zIndex = "9999";
  alerta.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 6000);
}

// Ejecutar validación
validarClone();
