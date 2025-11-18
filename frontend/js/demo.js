/* ============================================================
Archivo: /frontend/js/demo.js
Versión: V37 FINAL
Punto: 9/15 — Roles y Planes (Demo / Premium)
Autor: Cristian F. Choqui
Descripción: Alternancia entre modos Demo y Premium del Campus CFC Trading LITE.
============================================================ */

/* ============================================================
 FUNCIÓN: Alternar entre demo/premium
============================================================ */

function toggleMode(mode) {
  if (mode === "demo") {
    localStorage.setItem("plan_type", "demo");
    alert("🔒 Activado MODO DEMO: Algunas funciones estarán limitadas.");
  } else if (mode === "premium") {
    localStorage.setItem("plan_type", "premium");
    alert("🚀 Activado MODO PREMIUM: Acceso completo al Campus.");
  }
  location.reload(); // Refresca para aplicar los cambios visuales
}

/* ============================================================
 EVENTO: Botón para cambiar entre modos
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const switchDemoBtn = document.getElementById("switchDemo");
  if (!switchDemoBtn) return; // Seguridad por si no existe el botón

  switchDemoBtn.addEventListener("click", () => {
    const currentPlan = localStorage.getItem("plan_type") || "demo";
    const nextMode = currentPlan === "demo" ? "premium" : "demo";
    toggleMode(nextMode);
  });

  // Mostrar modo actual en consola
  console.log(`🧠 Modo actual: ${localStorage.getItem("plan_type") || "demo"}`);
});
