/* ==========================================================
   🟡 BUNDLE CORE JS — REBUILD LIMPIO (2025-11-20)
   Reconstrucción oficial para Campus CFC LITE V41
   Contenido: progress_v2 + overlay_block + motivation_v2
              + motivation + guide + theme_chapter_v2
   ========================================================== */

/* ==========================================================
   PROGRESS V2  —  (from progress_v2.js)
   ========================================================== */
console.log("🧩 BUNDLE → progress_v2.js cargado");

function ensureProgressData() {
  try {
    const data = localStorage.getItem("progressData");
    if (!data) {
      const base = { completed: [], lastModule: null };
      localStorage.setItem("progressData", JSON.stringify(base));
      return base;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed.completed)) parsed.completed = [];
    if (!("lastModule" in parsed)) parsed.lastModule = null;
    return parsed;
  } catch (err) {
    const reset = { completed: [], lastModule: null };
    localStorage.setItem("progressData", JSON.stringify(reset));
    return reset;
  }
}
let progressData = ensureProgressData();

function markModuleComplete(moduleNumber) {
  const nextModule = Math.min(moduleNumber + 1, 20);
  const currentPath = `/modules/${moduleNumber}/index.html`;
  const nextPath = `/modules/${nextModule}/index.html`;

  if (!progressData.completed.includes(currentPath)) {
    progressData.completed.push(currentPath);
  }
  progressData.lastModule = moduleNumber >= 20 ? currentPath : nextPath;
  localStorage.setItem("progressData", JSON.stringify(progressData));

  updateProgressDisplay();
  if (moduleNumber < 20) showUnlockOverlay(nextModule);
}

function updateProgressDisplay() {
  const el = document.getElementById("cfc-progress-text");
  const bar = document.getElementById("cfc-progress-bar");
  const total = 20;
  const done = progressData.completed.length;
  const percent = Math.floor((done / total) * 100);
  if (el) el.textContent = `${percent}% completado`;
  if (bar) bar.style.width = `${percent}%`;
  localStorage.setItem("progressPercent", percent);
  document.cookie = `progressPercent=${percent}; path=/; max-age=31536000`;
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    try {
      const stored = localStorage.getItem("examResult");
      if (stored) {
        const data = JSON.parse(stored);
        if (data && data.passed) markModuleComplete(data.moduleNumber);
        localStorage.removeItem("examResult");
      }
    } catch (err) {}

    const continueBtn = document.getElementById("continueBtn");
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        const storedData = JSON.parse(localStorage.getItem("progressData") || "{}");
        const target = storedData.lastModule || progressData.lastModule;
        if (target) window.location.href = target;
      });
    }

    updateProgressDisplay();
  }, 250);
});

window.addEventListener("examCompleted", (e) => {
  const { moduleNumber, passed } = e.detail || {};
  if (passed) markModuleComplete(moduleNumber);
  updateProgressDisplay();
});

function showUnlockOverlay(nextModule) {
  try {
    const existing = document.getElementById("cfcUnlockOverlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      color: "#FFD700",
      fontFamily: "'Poppins', sans-serif",
      fontSize: "1.6rem",
      fontWeight: "700",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999,
      opacity: 0,
      transition: "opacity 0.8s ease-in-out"
    });

    overlay.innerHTML = `
      <p>✨ ¡Nuevo módulo desbloqueado!<br><br>
      Módulo ${nextModule} ahora está disponible.<br>⚡</p>
      <button id="goToNextModuleBtn"
        style="margin-top:20px;padding:10px 22px;
        background:linear-gradient(90deg,#FFD700,#FFEC8B);
        border:none;border-radius:10px;font-weight:700;
        color:#000;cursor:pointer;box-shadow:0 0 12px rgba(255,215,0,0.45);">
        Ir al nuevo módulo →
      </button>`;
    document.body.appendChild(overlay);

    const bell = new Audio("../../audio/bell-gold.wav");
    bell.volume = 0.7;
    setTimeout(() => bell.play().catch(() => {}), 400);

    const btn = overlay.querySelector("#goToNextModuleBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        window.location.href = `/modules/${nextModule}/index.html`;
      });
    }

    setTimeout(() => (overlay.style.opacity = 1), 100);
    setTimeout(() => (overlay.style.opacity = 0), 4500);
    setTimeout(() => overlay.remove(), 5200);
  } catch (err) {}
}

/* ==========================================================
   OVERLAY BLOCK  — (from overlay_block.js)
   ========================================================== */
console.log("🧩 BUNDLE → overlay_block.js cargado");

function CFC_showBlockOverlay(reason = "Sesión no autorizada") {
  const existing = document.getElementById("cfc_overlay_block");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "cfc_overlay_block";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.96)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "999999",
    color: "#FFD700",
    textAlign: "center"
  });

  overlay.innerHTML = `
    <div style="max-width:420px;padding:30px;border:1px solid #FFD700;
      border-radius:20px;">
      <h2 style="font-size:22px;margin-bottom:10px;">🔒 Acceso bloqueado</h2>
      <p style="font-size:14px;opacity:0.9;margin-bottom:20px;">
        ${reason}<br>Por seguridad, debes volver a iniciar sesión.
      </p>
      <button id="cfc_btn_reload"
        style="background:#FFD700;color:#000;font-weight:bold;
        padding:10px 25px;border:none;border-radius:10px;">
        Reingresar
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById("cfc_btn_reload").addEventListener("click", () => {
    window.location.href = "../html/login.html";
  });
}

window.CFC_showBlockOverlay = CFC_showBlockOverlay;

/* ==========================================================
   MOTIVATION V2  — (from motivation_v2.js)
   ========================================================== */
console.log("🧩 BUNDLE → motivation_v2.js cargado");

const frasesDaily = [
  "Sigue adelante 💪",
  "Cada fallo te acerca al éxito 🌟",
  "Disciplina es libertad 🔥",
  "Tu progreso no se mide en días, sino en constancia 📈",
  "Haz hoy lo que te acerca al mañana que deseas ⚡"
];

const lastDate = localStorage.getItem("lastDate");
const today = new Date().toDateString();

if (lastDate !== today) {
  const frase = frasesDaily[Math.floor(Math.random() * frasesDaily.length)];
  localStorage.setItem("lastDate", today);
  localStorage.setItem("lastFrase", frase);
  const el = document.getElementById("dailyMotivation");
  if (el) el.textContent = frase;
} else {
  const saved = localStorage.getItem("lastFrase") || frasesDaily[0];
  const el = document.getElementById("dailyMotivation");
  if (el) el.textContent = saved;
}

function checkAchievements() {
  const examResults = JSON.parse(localStorage.getItem("examResults")) || [];
  const recent = examResults.slice(-3);
  if (recent.length === 3 && recent.every(r => r.score >= 70)) {
    localStorage.setItem("achievement", "🏆 Foco Mental");
  }
}

function showAchievement() {
  const box = document.getElementById("achievement");
  if (box) box.textContent = localStorage.getItem("achievement") || "—";
}

window.addEventListener("DOMContentLoaded", () => {
  checkAchievements();
  showAchievement();
});

/* ==========================================================
   MOTIVATION (placeholder)
   ========================================================== */
console.log("🧩 BUNDLE → motivation.js cargado");

/* ==========================================================
   GUIDE — from guide.js
   ========================================================== */
console.log("🧩 BUNDLE → guide.js cargado");

function playGoldBell() {
  try {
    const audio = new Audio("../audio/guide-gold.wav");
    audio.volume = 0.35;
    audio.play().catch(() => {});
  } catch (e) {}
}

function showGuide(auto = false) {
  if (document.querySelector(".guide-overlay")) return;

  const guide = document.createElement("div");
  guide.className = "guide-overlay";
  guide.innerHTML = `
    <div class="guide-box">
      <h2>🧭 Cómo usar el Campus</h2>
      <ul>
        <li>📘 Completá 1 módulo por día.</li>
        <li>🧠 Revisá tu emocionalidad diaria.</li>
        <li>🏆 Controlá tu progreso.</li>
      </ul>
      <button class="btn-guide">Entendido ✅</button>
    </div>
  `;
  document.body.appendChild(guide);

  guide.querySelector(".btn-guide").addEventListener("click", () => {
    guide.remove();
  });

  playGoldBell();

  if (auto) localStorage.setItem("guide_seen", "true");
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    const seen = localStorage.getItem("guide_seen");
    if (!seen) {
      setTimeout(() => showGuide(true), 1200);
    }
  } catch (e) {}
});

/* ==========================================================
   THEME — from theme_chapter_v2.js
   ========================================================== */
console.log("🧩 BUNDLE → theme_chapter_v2.js cargado");

(function () {
  const CFC_ID = "theme-toggle";
  const THEME_KEY = "CFC_THEME_STATE";

  function applyTheme(theme, toggle) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    document.body.classList.toggle("light-mode", theme === "light");
    document.body.classList.toggle("dark-mode", theme === "dark");

    if (toggle) {
      toggle.textContent = theme === "dark" ? "🌙" : "🌞";
    }
  }

  function injectButton() {
    if (document.getElementById(CFC_ID)) return;
    const toggle = document.createElement("button");
    toggle.id = CFC_ID;
    toggle.style.position = "fixed";
    toggle.style.top = "15px";
    toggle.style.right = "15px";
    toggle.style.zIndex = 9999;
    document.body.appendChild(toggle);

    let currentTheme = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(currentTheme, toggle);

    toggle.addEventListener("click", () => {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(currentTheme, toggle);
    });
  }

  function ensureBody() {
    if (document.body) injectButton();
    else setTimeout(ensureBody, 100);
  }

  ensureBody();
})();

/* ==========================================================
   🔥 FIN DEL BUNDLE CORE
   ========================================================== */
console.log("🔥 BUNDLE CORE reconstruido correctamente");
