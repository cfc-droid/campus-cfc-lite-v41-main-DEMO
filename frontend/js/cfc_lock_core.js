/* ==========================================================
   🟩 CFC_LOCK_CORE_V72.3 — HEARTCORE ENGINE REAL
   Motor maestro de expulsión, sincronización y monitoreo.
   Integración completa con identity.js + Render Proxy.
   Auditor: CFC-SYNC
   ========================================================== */

(function () {

  const API = "https://cfc-lock-proxy.onrender.com";
  console.log("🧩 QA-SYNC | CFC_LOCK_CORE V72.3 HEARTCORE cargado");

  /* ---------------------------------------------------------
     ESTADO GLOBAL DEL HEARTCORE
  --------------------------------------------------------- */
  let HEARTCORE_ACTIVE = true;
  let HEARTCORE_TIMER = null;

  /* ---------------------------------------------------------
     OBTENER SESIÓN LOCAL
  --------------------------------------------------------- */
  function getLocalSession() {
    return {
      email: localStorage.getItem("CFC_EMAIL"),
      device_id: localStorage.getItem("CFC_DEVICE_ID"),
      session_id: localStorage.getItem("CFC_SESSION_ID")
    };
  }

  /* ---------------------------------------------------------
     LIMPIEZA CONTROLADA (preserva progreso)
  --------------------------------------------------------- */
  function clearLocalSession() {
    console.log("🧹 [HEARTCORE] Limpieza MSCU local…");

    const preserve = [
      "CFC_PROGRESS",
      "CFC_TIMER",
      "CFC_LAST_MODULE",
      "CFC_HISTORY"
    ];

    Object.keys(localStorage).forEach(key => {
      if (!preserve.includes(key)) localStorage.removeItem(key);
    });

    sessionStorage.clear();
  }

  /* ---------------------------------------------------------
     EXPULSIÓN MAESTRA (unificada)
  --------------------------------------------------------- */
  async function CFC_forceLogout(reason) {

    if (!HEARTCORE_ACTIVE) return;
    HEARTCORE_ACTIVE = false;

    console.warn("🚨 EXPULSIÓN MAESTRA:", reason);

    const { email, device_id } = getLocalSession();

    // Mostrar overlay si existe
    if (window.CFC_showBlockOverlay)
      CFC_showBlockOverlay(email, device_id, reason);

    clearLocalSession();

    // Detener loop
    if (HEARTCORE_TIMER) clearInterval(HEARTCORE_TIMER);

    // Redirigir después del overlay
    setTimeout(() => {
      window.location.href = "/frontend/html/login.html";
    }, 1400);
  }

  /* ---------------------------------------------------------
     SIGNAL HANDLER — identity.js envía señales aquí
  --------------------------------------------------------- */
  function checkIdentitySignals() {
    const signal = localStorage.getItem("CFC_HEARTCORE_SIGNAL");
    if (!signal) return;

    console.warn("📡 [HEARTCORE] Señal recibida:", signal);

    if (signal.includes("DEVICE_CONFLICT")) {
      CFC_forceLogout("Sesión iniciada en otro dispositivo (FS SIGNAL)");
    }

    if (signal.includes("SESSION_CLOSED")) {
      CFC_forceLogout("Sesión finalizada remotamente (FS SIGNAL)");
    }

    if (signal.includes("SESSION_CHANGED")) {
      CFC_forceLogout("Cambio de sesión detectado (FS SIGNAL)");
    }

    // Limpiar la señal después de procesarla
    localStorage.removeItem("CFC_HEARTCORE_SIGNAL");
  }

  /* ---------------------------------------------------------
     HEARTCORE TASK — se ejecuta cada ciclo
  --------------------------------------------------------- */
  async function heartcoreTask() {

    if (!HEARTCORE_ACTIVE) return;

    const s = getLocalSession();
    if (!s.email || !s.device_id || !s.session_id) return;

    // 1) Procesar señales internas
    checkIdentitySignals();

    // 2) Heartbeat
    try {
      const hb = await fetch(`${API}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: s.email, device_id: s.device_id })
      });
      console.log("❤️ [HEARTBEAT]", await hb.json());
    } catch (e) {
      console.warn("⚠️ Heartbeat error:", e);
    }

    // 3) Update-session
    try {
      const up = await fetch(`${API}/update-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s)
      });
      const upJson = await up.json();
      console.log("🟡 [UPDATE-SESSION]", upJson);

      if (upJson.status === "invalid") {
        return CFC_forceLogout("Sesión iniciada en otro dispositivo (UPDATE)");
      }

    } catch (e) {
      console.warn("⚠️ update-session error", e);
    }

    // 4) Check remote status
    try {
      const r = await fetch(`${API}/check-session?email=${s.email}&device_id=${s.device_id}`);
      const json = await r.json();
      console.log("🌐 [CHECK-SESSION]", json);

      if (json.status === "invalid" || json.status === "expired") {
        return CFC_forceLogout("Sesión inválida (CHECK)");
      }
    } catch (e) {
      console.warn("⚠️ check-session error:", e);
    }
  }

  /* ---------------------------------------------------------
     HEARTCORE LOOP — 1 ciclo cada 5 segundos
  --------------------------------------------------------- */
  function startHeartcoreLoop() {
    if (HEARTCORE_TIMER) clearInterval(HEARTCORE_TIMER);
    HEARTCORE_TIMER = setInterval(heartcoreTask, 5000);

    // Primer ejecución inmediata
    setTimeout(heartcoreTask, 500);
  }

  // No ejecutar en login
  const path = window.location.pathname;
  if (!path.includes("login")) {
    console.log("🚀 HEARTCORE iniciado");
    startHeartcoreLoop();
  } else {
    console.log("🚫 HEARTCORE desactivado en login");
  }

  /* ---------------------------------------------------------
     Exponer API opcional
  --------------------------------------------------------- */
  window.CFC_forceLogout = CFC_forceLogout;

})();
