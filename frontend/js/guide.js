/* ==========================================================
   ✅ CFC_FUNC_7_3BIS_20251104 — Mini Guía Visual + Adaptación Automática (Claro/Oscuro)
   ========================================================== */

function playGoldBell() {
  try {
    const audio = new Audio("../audio/guide-gold.wav");
    audio.volume = 0.35;

    // 🔊 Fade-out suave (0.6 s)
    audio.addEventListener("timeupdate", () => {
      if (audio.currentTime > audio.duration - 0.6) {
        audio.volume = Math.max(0, audio.volume - 0.015);
      }
    });

    audio.play().catch(err => console.warn("⚠️ No se pudo reproducir el sonido dorado:", err));
  } catch (e) {
    console.warn("⚠️ Error al reproducir audio guía:", e);
  }
}

function showGuide(auto = false) {
  // Evitar múltiples instancias
  if (document.querySelector(".guide-overlay")) return;

  // Detectar modo activo según body o localStorage
  const isDarkMode =
    document.body.classList.contains("dark-mode") ||
    localStorage.getItem("theme") === "dark";

  // Colores dinámicos
  const bgColor = isDarkMode
    ? "rgba(20,20,20,0.95)"
    : "rgba(255,255,255,0.95)";
  const textColor = isDarkMode ? "#eee" : "#222";
  const titleColor = isDarkMode ? "#FFD700" : "#000";
  const borderColor = isDarkMode
    ? "rgba(255,215,0,0.5)"
    : "rgba(0,0,0,0.15)";
  const buttonBg = isDarkMode ? "#FFD700" : "#000";
  const buttonText = isDarkMode ? "#000" : "#FFD700";

  // Crear estructura
  const guide = document.createElement("div");
  guide.className = "guide-overlay";
  guide.innerHTML = `
    <div class="guide-box" style="
      background:${bgColor};
      color:${textColor};
      border:2px solid ${borderColor};
      box-shadow:0 0 25px rgba(255,215,0,0.4);
      border-radius:16px;
      padding:24px 26px;
      max-width:460px;
      margin:auto;
      text-align:center;
      font-family:'Poppins',sans-serif;">
      <h2 style="color:${titleColor};margin-bottom:12px;">🧭 Cómo usar el Campus</h2>
      <ul style="text-align:left;list-style:none;padding:0;margin:0;font-size:0.95rem;line-height:1.6em;">
        <li>📘 Completá <b>1 módulo por día</b> para avanzar de forma constante.</li>
        <li>🧠 Revisá tu <b>emocionalidad diaria</b> antes de estudiar.</li>
        <li>🏆 Guardá y revisá tu <b>progreso regularmente</b>.</li>
      </ul>
      <button class="btn-guide" style="
        margin-top:20px;
        background:${buttonBg};
        color:${buttonText};
        border:none;
        border-radius:10px;
        padding:8px 18px;
        font-weight:600;
        cursor:pointer;
        transition:0.3s;">Entendido ✅</button>
    </div>
  `;

  document.body.appendChild(guide);

  // Cerrar overlay
  guide.querySelector(".btn-guide").addEventListener("click", () => {
    guide.remove();
  });

  // Reproducir sonido dorado
  playGoldBell();

  // Registrar primera vez si es automático
  if (auto) localStorage.setItem("guide_seen", "true");
}

/* ==========================================================
   ✅ AUTO-MOSTRAR EN PRIMER INGRESO (una sola vez)
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  try {
    const seen = localStorage.getItem("guide_seen");
    if (!seen) {
      setTimeout(() => showGuide(true), 1200); // espera para no solaparse con splash
    }
  } catch (e) {
    console.warn("⚠️ guide.js: no se pudo acceder a localStorage:", e);
  }
});

// 🔒 QA-SYNC — Registro de control
console.log(
  "🧩 CFC_SYNC checkpoint: Mini Guía Visual Adaptativa V7_3BIS_OK",
  new Date().toLocaleString()
);
