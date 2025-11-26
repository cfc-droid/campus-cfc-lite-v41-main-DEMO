/* ==========================================================
   🔐 CFC_LOCK_CORE_V72_ENFORCE_REAL
   Sistema: Campus CFC LITE V41
   Subpaso: 6.7 — Expulsión REAL con overlay
   Función: Heartbeat + Update + Check + Expulsión real
   Auditor: CFC-SYNC
   ========================================================== */

import { CFC_showBlockOverlay } from "./core/../js/core/overlay_block.js"; 
// Ruta corregida automáticamente por CFC-SYNC si es necesario.

/* ==========================================================
   🔥 MODO ENFORCE REAL — expulsión inmediata
   ========================================================== */
const CFC_LOCK_ENFORCE = true;

/* ==========================================================
   API Render
   ========================================================== */
const API = "https://cfc-lock-proxy.onrender.com";

/* ==========================================================
   Obtener MSCU local
   ========================================================== */
function getLocalSession() {
  const email = localStorage.getItem("CFC_EMAIL");
  const device_id = localStorage.getItem("CFC_DEVICE_ID");
  const session_id = localStorage.getItem("CFC_SESSION_ID");

  return email && device_id && session_id
    ? { email, device_id, session_id }
    : null;
}

/* ==========================================================
   Limpiar MSCU local — anti-revivir
   ========================================================== */
function clearMSCU() {
  console.log("🧹 [CFC-LOCK] Limpiando MSCU local…");

  const preserve = ["CFC_PROGRESS", "CFC_TIMER", "CFC_LAST_MODULE", "CFC_HISTORY"];

  const todo = Object.keys(localStorage);
  for (const k of todo) {
    if (!preserve.includes(k)) localStorage.removeItem(k);
  }

  sessionStorage.clear();
}

/* ==========================================================
   Expulsión REAL — overlay + limpieza + redirect
   ========================================================== */
async function forceLogout(reason, email, device_id) {
  if (window.__CFC_FORCELOGOUT_ACTIVE__) {
    console.warn("⛔ FORCED LOGOUT ya activo — anti-loop");
    return;
  }
  window.__CFC_FORCELOGOUT_ACTIVE__ = true;

  console.warn("🔒 [CFC-LOCK] Expulsando dispositivo…", { email, device_id, reason });

  CFC_showBlockOverlay(email, device_id, reason);

  clearMSCU();

  // Bloqueo total
  document.body.style.pointerEvents = "none";
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    window.location.href = "/frontend/html/login.html";
  }, 1800);
}

/* ==========================================================
   Heartbeat
   ========================================================== */
async function sendHeartbeat(s) {
  try {
    const res = await fetch(`${API}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: s.email,
        device_id: s.device_id
      })
    });
    const json = await res.json();
    console.log("❤️ [HEARTBEAT]", json);
  } catch (err) {
    console.warn("⚠️ Heartbeat Error:", err);
  }
}

/* ==========================================================
   Update-session
   ========================================================== */
async function sendUpdate(s) {
  try {
    const res = await fetch(`${API}/update-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: s.email,
        device_id: s.device_id,
        session_id: s.session_id
      })
    });

    const json = await res.json();
    console.log("🟡 [UPDATE-SESSION]", json);

    if (CFC_LOCK_ENFORCE && json.status === "invalid") {
      await forceLogout("Sesión iniciada en otro dispositivo (UPDATE)", s.email, s.device_id);
    }

  } catch (err) {
    console.warn("⚠️ update-session error:", err);
  }
}

/* ==========================================================
   Check-session (Render)
   ========================================================== */
async function checkRemote(s) {
  try {
    const res = await fetch(
      `${API}/check-session?email=${s.email}&device_id=${s.device_id}`
    );
    const json = await res.json();

    console.log("🌐 [CHECK-SESSION]", json);

    if (!CFC_LOCK_ENFORCE) return;

    if (json.status === "invalid" || json.status === "expired") {
      await forceLogout("Sesión iniciada en otro dispositivo (CHECK)", s.email, s.device_id);
    }

  } catch (err) {
    console.warn("⚠️ check-session error:", err);
  }
}

/* ==========================================================
   Loop HEARTCORE ENFORCE
   ========================================================== */
async function heartcoreLoop() {
  const s = getLocalSession();

  if (!s) {
    console.warn("⚠️ Heartcore: no hay MSCU local");
    return;
  }

  if (window.location.pathname.includes("login")) return;

  await sendHeartbeat(s);
  await sendUpdate(s);
  await checkRemote(s);
}

/* ==========================================================
   INICIO
   ========================================================== */
console.log("🧩 QA-SYNC | CFC_LOCK_CORE V72-ENFORCE REAL cargado");

setInterval(heartcoreLoop, 5000);
heartcoreLoop();
