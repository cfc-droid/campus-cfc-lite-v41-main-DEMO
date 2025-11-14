/* ============================================================
Archivo: /frontend/js/security.js
Versión: V37 FINAL
Punto: 8/15 — Seguridad y Bloqueo Post-Venta
Autor: Cristian F. Choqui
Descripción: Sistema completo de bloqueo + verificación de hash
============================================================ */

// ============================================================
// 🔒 VARIABLE GLOBAL DE BLOQUEO
// ============================================================

let isLocked = true; // Estado inicial del campus: bloqueado


// ============================================================
// 🧠 VERIFICACIÓN DE LICENCIA (ANTI-COPIA)
// ============================================================

fetch("./config/config.json")
  .then(res => res.json())
  .then(data => {
    if (data.hash_validation !== "CFC2025X-LITE-V1.4") {
      alert("⚠️ Licencia inválida. Este Campus no está autorizado.");
      document.body.innerHTML =
        '<h1 style="color:red;text-align:center;margin-top:40vh;">Licencia inválida ❌</h1>';
      throw new Error("Licencia inválida — ejecución detenida.");
    }
    console.log("✅ Licencia verificada correctamente");
    iniciarBloqueo(); // continuar flujo normal si el hash es correcto
  })
  .catch(err => {
    console.error("Error de verificación de licencia:", err);
  });


// ============================================================
// 🚫 FUNCIÓN PRINCIPAL DE BLOQUEO
// ============================================================

function iniciarBloqueo() {
  // Comprobación inicial
  if (localStorage.getItem("campus_unlocked") === "true") {
    isLocked = false;
    console.log("✅ Campus desbloqueado — acceso permitido.");
  } else {
    console.log("🔒 Campus bloqueado — acceso restringido.");
  }

  // Mostrar overlay solo si está bloqueado
  if (isLocked) {
    const overlay = document.createElement("div");
    overlay.id = "lock-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.92)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";
    overlay.style.fontFamily = "Arial, sans-serif";
    overlay.innerHTML = `
      <div style="text-align:center;max-width:400px;">
        <h1 style="font-size:2rem;margin-bottom:10px;">🔒 ACCESO BLOQUEADO</h1>
        <p style="margin-bottom:20px;">Este Campus requiere activación.<br>Ingrese su código de desbloqueo:</p>
        <input id="unlockInput" type="password" placeholder="Código admin"
          style="padding:10px;border-radius:6px;border:none;width:100%;text-align:center;font-size:1rem;">
        <button id="unlockBtn"
          style="margin-top:15px;padding:10px 20px;border:none;border-radius:6px;background-color:gold;
          color:black;font-weight:bold;cursor:pointer;">Desbloquear</button>
        <p id="unlockMsg" style="margin-top:10px;color:#ff7777;font-size:0.9rem;"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    // Desactivar toda interacción del DOM
    const allElements = document.querySelectorAll("button, a, input, select, textarea");
    allElements.forEach(el => {
      el.disabled = true;
      el.style.pointerEvents = "none";
    });

    // ------------------------------------------------------------
    // 🔓 FUNCIÓN DE DESBLOQUEO MANUAL
    // ------------------------------------------------------------
    function unlockCampus(code) {
      const msg = document.getElementById("unlockMsg");
      if (code === "CFC-ADMIN-2025") {
        localStorage.setItem("campus_unlocked", "true");
        isLocked = false;
        msg.style.color = "#00ff88";
        msg.textContent = "✅ Campus desbloqueado correctamente.";
        setTimeout(() => {
          document.getElementById("lock-overlay").remove();
          location.reload();
        }, 1200);
      } else {
        msg.textContent = "❌ Código inválido. Inténtelo nuevamente.";
      }
    }

    // Asignar evento
    document.getElementById("unlockBtn").addEventListener("click", () => {
      const code = document.getElementById("unlockInput").value.trim();
      unlockCampus(code);
    });
  }
}

/* =========================================================
   🔒 CFC-SYNC — ROOT GUARD + IDENTITY (C)(F)
========================================================= */
import "/frontend/js/core/cfc_lock_identity.js";

/* =========================================================
   🔒 CFC-SYNC — HEARTCORE MONITOR (G)
========================================================= */
import "/frontend/js/cfc_lock_core.js?v=70";
