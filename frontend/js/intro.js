/* =========================================================
   ✅ CFC_FUNC_7_3E_V43_PREMIUM_REDIRECT — Overlay + Flash + Loader dorado
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("videoOverlay");
  const video = document.getElementById("welcomeVideo");
  const closeBtn = document.getElementById("closeOverlay");
  const flash = document.getElementById("goldenFlash");

  if (!overlay || !video || !closeBtn || !flash) {
    console.warn("⚠️ Elementos no encontrados en intro.html");
    return;
  }

  // 🧠 Mostrar solo primer acceso (o modo test)
  if (true) { // 🔁 QA MODE: siempre mostrar el video guía
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    try {
      video.play();
    } catch (e) {
      console.warn("🔇 Autoplay bloqueado:", e);
    }
    localStorage.setItem("firstVisit", "true");
  } else {
    console.log("👀 Primer acceso ya registrado, no mostrar overlay.");
  }

  // 🎵 Efecto sonoro dorado
  const goldSound = new Audio("../audio/bell-gold.wav");
  goldSound.volume = 0.7;

  // 🎬 Cerrar con efecto + loader + redirección
  closeBtn.addEventListener("click", () => {
    flash.classList.add("active");
    goldSound.play().catch(() => console.warn("🔇 Audio bloqueado por política del navegador."));
    closeBtn.disabled = true;
    closeBtn.innerHTML = "Ingresando... ⚡";

    // 🟡 Mostrar pantalla de transición dorada
    const loader = document.createElement("div");
    loader.id = "goldenLoader";
    loader.innerHTML = `<div class="loaderText">Cargando el Campus...</div>`;
    document.body.appendChild(loader);

    setTimeout(() => {
      overlay.classList.add("fade-out");
    }, 150);

    setTimeout(() => {
      flash.classList.remove("active");
      loader.classList.add("visible");
    }, 400);

    // 💫 Redirección final al Campus
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  });
});

console.log("🧩 CFC_SYNC checkpoint:", "intro.js — CFC_FUNC_7_3E_V43_PREMIUM_REDIRECT activo", new Date().toLocaleString());

/* ============================================================
   CFC-SYNC — HEARTBEAT DOMINIO (B)
   ============================================================ */
setInterval(() => {
  if (!window.CFC_DOMAIN_OK) {
    window.location.href = "/frontend/blocked.html";
  }
}, 10000);

/* ============================================================
   CFC-SYNC — ROOT GUARD + IDENTITY (C)(F)
   ============================================================ */
import "/frontend/js/core/cfc_lock_identity.js";

/* ============================================================
   CFC-SYNC — HEARTCORE MONITOR (G)
   ============================================================ */
import "/frontend/js/cfc_lock_core.js?v=70";
