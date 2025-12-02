/* ============================================================
   Archivo: /frontend/scripts/showroom.js
   Versión: V37 FINAL
   Punto: 9/15 – Roles y Planes (Demo / Premium)
   Sub-sección: PASO 4/5 – Ver Demo Pública (Showroom)
   Autor: Cristian F. Choqui
   Descripción: Navegación automática entre módulos del Campus 
   para demostraciones, marketing o vista previa pública.
=============================================================== */

/* =========================================
   VARIABLES GLOBALES
========================================= */
const modulos = document.querySelectorAll(".modulo");
let index = 0;
let showroomActivo = false;
let intervaloShowroom;
let bloqueoStorage = false;

/* =========================================
   BLOQUEO TEMPORAL DEL LOCALSTORAGE
========================================= */
(function bloquearLocalStorage() {
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;

  localStorage.setItem = function (key, value) {
    if (bloqueoStorage) {
      console.warn(`⚠️ Guardado bloqueado (${key}) durante modo showroom.`);
      return;
    }
    originalSetItem.apply(this, arguments);
  };

  localStorage.removeItem = function (key) {
    if (bloqueoStorage) {
      console.warn(`⚠️ Eliminación bloqueada (${key}) durante modo showroom.`);
      return;
    }
    originalRemoveItem.apply(this, arguments);
  };

  localStorage.clear = function () {
    if (bloqueoStorage) {
      console.warn("⚠️ Limpieza de storage bloqueada durante modo showroom.");
      return;
    }
    originalClear.apply(this, arguments);
  };
})();

/* =========================================
   FUNCIÓN PRINCIPAL: recorrer()
========================================= */
function recorrer() {
  if (!modulos.length) {
    console.warn("⚠️ No se encontraron módulos para el modo Showroom.");
    return;
  }

  showroomActivo = true;
  bloqueoStorage = true;
  mostrarAvisoShowroom();

  intervaloShowroom = setInterval(() => {
    modulos.forEach((m) => m.classList.remove("active"));
    modulos[index].classList.add("active");
    modulos[index].scrollIntoView({ behavior: "smooth", block: "center" });
    index = (index + 1) % modulos.length;
  }, 5000);
}

/* =========================================
   FUNCIÓN: mostrarAvisoShowroom()
========================================= */
function mostrarAvisoShowroom() {
  const aviso = document.createElement("div");
  aviso.id = "overlayShowroom";
  aviso.textContent = "🔸 Modo Exhibición: Navegación automática activa";
  Object.assign(aviso.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(90deg, gold, orange)",
    color: "#111",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "bold",
    zIndex: "9999",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    animation: "pulse 1.5s infinite alternate",
  });
  document.body.appendChild(aviso);

  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0% { transform: translateX(-50%) scale(1); opacity: 1; }
      100% { transform: translateX(-50%) scale(1.05); opacity: 0.8; }
    }
  `;
  document.head.appendChild(style);
}

/* =========================================
   FUNCIÓN: detenerShowroom()
========================================= */
function detenerShowroom() {
  if (intervaloShowroom) clearInterval(intervaloShowroom);
  showroomActivo = false;
  bloqueoStorage = false;

  const aviso = document.getElementById("overlayShowroom");
  if (aviso) aviso.remove();

  console.log("🟡 Modo Showroom detenido por interacción del usuario.");
}

/* =========================================
   EVENTOS DE CONTROL: click o teclado
========================================= */
document.addEventListener("click", detenerShowroom);
document.addEventListener("keydown", detenerShowroom);

/* =========================================
   FUNCIÓN: iniciarShowroom()
========================================= */
function iniciarShowroom() {
  if (!showroomActivo) recorrer();
}

/* =========================================
   AUTOEJECUCIÓN DESDE DEMO PÚBLICA
========================================= */
if (localStorage.getItem("modoDemo") === "true") {
  window.addEventListener("DOMContentLoaded", () => {
    iniciarShowroom();
    alert("👁️ Estás viendo la DEMO pública del Campus CFC Trading LITE.");
    localStorage.removeItem("modoDemo");
  });
}

/* =========================================
   BOTÓN “Ver demo pública”
========================================= */
const botonDemo = document.getElementById("btnDemoPublica");
if (botonDemo) {
  botonDemo.addEventListener("click", () => {
    localStorage.setItem("modoDemo", "true");
    window.location.href = "/frontend/modules/index.html";
  });
}

console.log("✅ showroom.js cargado correctamente — V37 FINAL");
