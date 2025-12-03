/* ==========================================================
   🟩 CFC_LOCK_CORE_V72_ENFORCE_REAL (GLOBAL)
   Sistema híbrido Render + Local
   Función: Heartbeat + Update + Check + Expulsión Real
   Auditor: CFC-SYNC
   ========================================================== */

(function () {

  const API = "https://cfc-lock-proxy.onrender.com";
  const CFC_LOCK_ENFORCE = true;

  console.log("🧩 QA-SYNC | CFC_LOCK_CORE V72-ENFORCE REAL cargado");

  /* -------------------------------------------
     Obtener MSCU local
  ------------------------------------------- */
  function getLocalSession() {
    const email = localStorage.getItem("CFC_EMAIL");
    const device_id = localStorage.getItem("CFC_DEVICE_ID");
    const session_id = localStorage.getItem("CFC_SESSION_ID");
    return (email && device_id && session_id) ? { email, device_id, session_id } : null;
  }

  /* -------------------------------------------
     Limpieza full excepto progreso
  ------------------------------------------- */
  function clearMSCU() {
    console.log("🧹 [CFC-LOCK] Limpieza MSCU LOCAL…");

    const preserve = ["CFC_PROGRESS", "CFC_TIMER", "CFC_LAST_MODULE", "CFC_HISTORY"];

    Object.keys(localStorage).forEach(k => {
      if (!preserve.includes(k)) localStorage.removeItem(k);
    });

    sessionStorage.clear();
  }

  /* -------------------------------------------
     EXPULSIÓN REAL
  ------------------------------------------- */
  async function forceLogout(reason, email, device_id) {

    if (window.__CFC_FORCELOGOUT_ACTIVE__) return;
    window.__CFC_FORCELOGOUT_ACTIVE__ = true;

    console.warn("🚨 EXPULSIÓN REAL:", { reason, email, device_id });

    if (window.CFC_showBlockOverlay)
      CFC_showBlockOverlay(email, device_id, reason);

    clearMSCU();

    document.body.style.pointerEvents = "none";
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      window.location.href = "/frontend/html/login.html";
    }, 1500);
  }

  /* -------------------------------------------
     Heartbeat
  ------------------------------------------- */
  async function sendHeartbeat(s) {
    try {
      const r = await fetch(`${API}/heartbeat`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email: s.email, device_id: s.device_id })
      });
      console.log("❤️ [HEARTBEAT]", await r.json());
    } catch (e) {
      console.warn("⚠️ Heartbeat error", e);
    }
  }

  /* -------------------------------------------
     Update-session
  ------------------------------------------- */
  async function sendUpdate(s) {
    try {
      const r = await fetch(`${API}/update-session`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(s)
      });
      const json = await r.json();
      console.log("🟡 [UPDATE-SESSION]", json);

      if (CFC_LOCK_ENFORCE && json.status === "invalid") {
        await forceLogout("Sesión iniciada en otro dispositivo (UPDATE)", s.email, s.device_id);
      }

    } catch (e) {
      console.warn("⚠️ update-session error", e);
    }
  }

  /* -------------------------------------------
     Check Render híbrido
  ------------------------------------------- */
  async function checkRemote(s) {
    try {
      const r = await fetch(`${API}/check-session?email=${s.email}&device_id=${s.device_id}`);
      const json = await r.json();
      console.log("🌐 [CHECK-SESSION]", json);

      if (CFC_LOCK_ENFORCE && (json.status === "invalid" || json.status === "expired")) {
        await forceLogout("Sesión iniciada en otro dispositivo (CHECK)", s.email, s.device_id);
      }

    } catch (e) {
      console.warn("⚠️ check-session error", e);
    }
  }

  /* -------------------------------------------
     LOOP HEARTCORE
  ------------------------------------------- */
  async function heartcoreLoop() {

    const s = getLocalSession();
    if (!s) return;

    // No ejecutar en login
    if (window.location.pathname.includes("login")) return;

    await sendHeartbeat(s);
    await sendUpdate(s);
    await checkRemote(s);
  }

  setInterval(heartcoreLoop, 5000);
  heartcoreLoop();

})();
