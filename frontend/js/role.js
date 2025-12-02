/* ============================================================
Archivo: /frontend/js/role.js
Versión: V37 FINAL
Punto: 9/15 — Roles y Planes (Demo / Premium)
Autor: Cristian F. Choqui
Descripción: Control de roles de usuario, accesos limitados y mejoras visuales.
============================================================ */

/* ==========================
   VARIABLE GLOBAL DE ROL
   ========================== */

let plan_type = localStorage.getItem("plan_type") || "demo"; // Valor por defecto

console.log(`🔹 Plan actual: ${plan_type.toUpperCase()}`);

/* ============================================================
   FUNCIÓN: activarModo(plan)
   Cambia el tipo de plan y actualiza localStorage.
============================================================ */

function activarModo(plan) {
  plan_type = plan;
  localStorage.setItem("plan_type", plan);
  console.log(`🔁 Cambiado a modo: ${plan.toUpperCase()}`);
  location.reload(); // Refresca para aplicar cambios visuales
}

/* ============================================================
   FUNCIÓN: verificarModoDemo()
   Desactiva botones bloqueados si el usuario está en modo demo.
   Aplica efectos visuales y tooltip animado.
============================================================ */

function verificarModoDemo() {
  if (plan_type === "demo") {
    const elementosBloqueados = document.querySelectorAll(".bloqueado, [data-premium='true']");
    elementosBloqueados.forEach((el) => {
      // Desactivar interacción
      el.style.opacity = "0.5";
      el.style.pointerEvents = "none";
      el.style.position = "relative";
      el.title = "Función disponible solo en versión PREMIUM 🚀";

      // Efecto visual parpadeante
      el.animate(
        [
          { boxShadow: "0 0 0px gold" },
          { boxShadow: "0 0 10px gold" },
          { boxShadow: "0 0 0px gold" },
        ],
        {
          duration: 2000,
          iterations: Infinity,
        }
      );

      // Tooltip visual adicional (hover manual)
      const tooltip = document.createElement("span");
      tooltip.textContent = "🚀 PREMIUM";
      tooltip.style.position = "absolute";
      tooltip.style.bottom = "110%";
      tooltip.style.left = "50%";
      tooltip.style.transform = "translateX(-50%)";
      tooltip.style.background = "gold";
      tooltip.style.color = "#111";
      tooltip.style.padding = "3px 8px";
      tooltip.style.borderRadius = "6px";
      tooltip.style.fontSize = "0.75rem";
      tooltip.style.fontWeight = "bold";
      tooltip.style.opacity = "0";
      tooltip.style.transition = "opacity 0.3s ease";
      tooltip.style.pointerEvents = "none";

      el.appendChild(tooltip);

      el.addEventListener("mouseenter", () => {
        tooltip.style.opacity = "1";
      });

      el.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
      });
    });

    // Banner inferior
    const aviso = document.createElement("div");
    aviso.id = "banner-demo";
    aviso.textContent = "🔒 Estás en modo DEMO - Algunas funciones están bloqueadas";
    aviso.style.position = "fixed";
    aviso.style.bottom = "10px";
    aviso.style.left = "50%";
    aviso.style.transform = "translateX(-50%)";
    aviso.style.background = "gold";
    aviso.style.color = "#111";
    aviso.style.padding = "8px 16px";
    aviso.style.borderRadius = "8px";
    aviso.style.fontWeight = "bold";
    aviso.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
    aviso.style.zIndex = "9999";
    document.body.appendChild(aviso);
  }
}

// Ejecutar al cargar la página
window.addEventListener("DOMContentLoaded", verificarModoDemo);
