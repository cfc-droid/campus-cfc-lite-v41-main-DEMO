// ===========================================================
// ✅ CFC_FUNC_10_1_10_2_20251101 — Autoevaluación emocional semanal
// Descripción: Script ligero para registro diario de estado mental.
// Trazabilidad: PUNTO 5/10 — PASO 5/5 — CFC-SYNC V7.5 — QA-SYNC V41
// ===========================================================

function checkEmotion() {
  const last = localStorage.getItem('lastEmotion');
  const today = new Date().toLocaleDateString();

  if (last !== today) {
    const val = prompt("🧭 ¿Cómo evaluás tu enfoque mental (1-10)?");
    if (val !== null && val.trim() !== "") {
      localStorage.setItem('lastEmotion', today);
      localStorage.setItem('emotionScore', val);
      console.log(`🧠 Registro emocional guardado: ${val}/10 — ${today}`);
    } else {
      console.log("⚠️ No se ingresó valor emocional — se mantiene registro anterior.");
    }
  } else {
    console.log("📅 Registro emocional ya realizado hoy — sin cambios.");
  }
}

window.addEventListener('load', checkEmotion);

// ===========================================================
// 🔒 CFC_LOCK: V41.10-emotional_check-20251101-0330
// ===========================================================



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
