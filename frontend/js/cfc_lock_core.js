/* ==========================================================
   🟩 CFC_LOCK_CORE_V72.5 — HEARTCORE SIGNAL BUS
   Render + Firestore + Identity Signals
   Expulsión REAL sin loops — preserva progreso
   Auditor CFC-SYNC
   ========================================================== */

(function () {

  const API = "https://cfc-lock-proxy.onrender.com";
  const CFC_LOCK_ENFORCE = true;

  console.log("🧩 QA-SYNC | CFC_LOCK_CORE V72.5 cargado");

  /* ---------------------------------------------------------
     Obtener sesión local (sin progreso)
  --------------------------------------------------------- */
  function getLocalSession() {
    const email = localStorage.getItem("CFC_EMAIL");
    const device_id = localStorage.getItem("CFC_DEVICE_ID");
    const session_id = localStorage.getItem("CFC_SESSION_ID");
    return (email && device_id && session_id) ? { email, device_id, session_id } : null;
  }

  /* ---------------------------------------------------------
     Limpieza sin borrar progreso
  --------------------------------------------------------- */
  function clearMSCU() {
    console.log("🧹 [HEARTCORE] Limpieza MSCU…");

    const preserve = ["CFC_PROGRESS", "CFC_TIMER", "CFC_LAST_MODULE", "CFC_HISTORY"];

    Object.keys(localStorage).forEach(k => {
      if (!preserve.includes(k)) localStorage.removeItem(k);
    });

    sessionStorage.clear();
  }

  /* ---------------------------------------------------------
     EXPULSIÓN MAESTRA (única fuente de expulsiones)
  --------------------------------------------------------- */
  async function forceLogout(reason, email, device_id) {

    if (window.__CFC_FORCELOGOUT_ACTIVE__) return;
    window.__CFC_FORCELOGOUT_ACTIVE__ = true;

    console.warn("🚨 EXPULSIÓN REAL — HEARTCORE:", { reason, email, device_id });

    if (window.CFC_showBlockOverlay)
      CFC_showBlockOverlay(email, device_id, reason);

    clearMSCU();

    document.body.style.pointerEvents = "none";
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      window.location.href = "/frontend/html/login.html";
    }, 1400);
  }

  /* ---------------------------------------------------------
     CHECK REMOTO HÍBRIDO
  --------------------------------------------------------- */
  async function checkRemote(s) {
    try {
      const r = await fetch(`${API}/check-session?email=${s.email}&device_id=${s.device_id}`);
      const json = await r.json();
      console.log("🌐 [CHECK-SESSION]", json);

      if (CFC_LOCK_ENFORCE && (json.status === "invalid" || json.status === "expired")) {
        await forceLogout("Sesión iniciada en otro dispositivo (CHECK)", s.email, s.device_id);
      }

    } catch (err) {
      console.warn("⚠️ check-session error", err);
    }
  }

  /* ---------------------------------------------------------
     SEND HEARTBEAT
  --------------------------------------------------------- */
  async function sendHeartbeat(s) {
    try {
      const r = await fetch(`${API}/heartbeat`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email: s.email, device_id: s.device_id })
      });
      console.log("❤️ [HEARTBEAT]", await r.json());
    } catch (err) {
      console.warn("⚠️ Heartbeat error", err);
    }
  }

  /* ---------------------------------------------------------
     UPDATE SESSION
  --------------------------------------------------------- */
  async function sendUpdate(s) {
    try {
      const r = await fetch(`${API}/update-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s)
      });
      const json = await r.json();

      console.log("🟡 [UPDATE-SESSION]", json);

      if (CFC_LOCK_ENFORCE && json.status === "invalid") {
        await forceLogout("Sesión iniciada en otro dispositivo (UPDATE)", s.email, s.device_id);
      }

    } catch (err) {
      console.warn("⚠️ update-session error", err);
    }
  }

  /* =========================================================
     🔴 5/5-D.5 — SIGNAL BUS (NOVEDAD)
     Identity emite señales → Heartcore las ejecuta aquí
  ========================================================= */
  function processIdentitySignals(s) {

    const signal = localStorage.getItem("CFC_HEARTCORE_SIGNAL");
    if (!signal) return;  // nada que procesar

    console.warn("📡 [HEARTCORE] Señal recibida:", signal);

    // Limpiar para evitar loops
    localStorage.removeItem("CFC_HEARTCORE_SIGNAL");

    switch (signal) {

      case "DEVICE_CONFLICT":
        forceLogout("Sesión iniciada en otro dispositivo (IDENTITY)", s.email, s.device_id);
        break;

      case "SESSION_CHANGED":
        forceLogout("Sesión manipulada o reemplazada (IDENTITY)", s.email, s.device_id);
        break;

      case "SESSION_CLOSED":
        forceLogout("Sesión cerrada remotamente (IDENTITY)", s.email, s.device_id);
        break;

      default:
        console.log("ℹ️ Señal no reconocida, ignorando:", signal);
        break;
    }
  }

  /* ---------------------------------------------------------
     HEARTCORE LOOP — ejecuta todo
  --------------------------------------------------------- */
  async function heartcoreLoop() {

    const s = getLocalSession();
    if (!s) return;

    if (window.location.pathname.includes("login")) return;

    processIdentitySignals(s);
    await sendHeartbeat(s);
    await sendUpdate(s);
    await checkRemote(s);
  }

  setInterval(heartcoreLoop, 5000);
  heartcoreLoop();

})();
