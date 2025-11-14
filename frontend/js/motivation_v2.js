/* =========================================================
   ✅ CFC_FUNC_4_1_20251031 — Motivador diario creado
   ✅ CFC_FUNC_4_6–4_7_20251101 — Logros simbólicos “Foco Mental”
   📄 Archivo: /frontend/js/motivation_v2.js
   🔒 CFC-SYNC V7.6 | QA-SYNC V10.0 REAL | Build V41-REAL
   ========================================================= */

// 🌟 MOTIVADOR DIARIO
const frases = [
  "Sigue adelante 💪",
  "Cada fallo te acerca al éxito 🌟",
  "Disciplina es libertad 🔥",
  "Tu progreso no se mide en días, sino en constancia 📈",
  "Haz hoy lo que te acerca al mañana que deseas ⚡"
];

const lastDate = localStorage.getItem("lastDate");
const today = new Date().toDateString();

if (lastDate !== today) {
  const frase = frases[Math.floor(Math.random() * frases.length)];
  localStorage.setItem("lastDate", today);
  localStorage.setItem("lastFrase", frase);
  const el = document.getElementById("dailyMotivation");
  if (el) el.textContent = frase;
} else {
  const saved = localStorage.getItem("lastFrase") || frases[0];
  const el = document.getElementById("dailyMotivation");
  if (el) el.textContent = saved;
}

// =====================================================
// ✅ CFC_FUNC_4_6_20251101 — Detección de logro “Foco Mental”
// =====================================================
function checkAchievements() {
  const examResults = JSON.parse(localStorage.getItem("examResults")) || [];
  const recent = examResults.slice(-3);
  if (recent.length === 3 && recent.every(r => r.score >= 70)) {
    localStorage.setItem("achievement", "🏆 Foco Mental");
    console.log("🌟 Logro desbloqueado: Foco Mental");
  }
}

// =====================================================
// ✅ CFC_FUNC_4_7_20251101 — Mostrar logro en dashboard
// =====================================================
function showAchievement() {
  const box = document.getElementById("achievement");
  if (box) box.textContent = localStorage.getItem("achievement") || "—";
}

// Ejecución automática
window.addEventListener("DOMContentLoaded", () => {
  checkAchievements();
  showAchievement();
  console.log(
    "🧩 CFC_SYNC checkpoint:",
    "motivation_v2.js",
    "P4.6–P4.7 activos",
    new Date().toLocaleString()
  );
});

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
