/* ==========================================================
   🟩 CFC_LOCK_CORE_V72_SAFE_MODE_V41
   Fix PRUEBA 7 y PRUEBA 8 — SAFE MODE + Heartcore Boot Loader
   Función: evitar expulsión falsa a los 8–11 segundos
   ========================================================== */

(function () {

  const API = "https://cfc-lock-proxy.onrender.com";

  // ==========================================================
  // 🔥 MODO SEGURO → solo ENFORCE en index.html y páginas raíz
  // ==========================================================
  const pathname = window.location.pathname;

  const IS_INDEX =
    pathname.endsWith("/index.html") ||
    pathname.endsWith("/frontend/index.html") ||
    pathname === "/" ||
    pathname === "/frontend/";

  // 👉 En módulos/capítulos/exámenes DESACTIVAMOS ENFORCE
  const CFC_LOCK_ENFORCE = IS_INDEX;

  console.log("🧩 QA-SYNC | CFC_LOCK_CORE SAFE MODE — ENFORCE:", CFC_LOCK_ENFORCE);

  // ==========================================================
  // 🔵 HEARTCORE BOOT (PRUEBA 8)
  // ==========================================================
  let HEARTCORE_READY = false;      // ⚠️ Hasta que el MSCU esté completo no corre UPDATE/CHECK
  let HEARTCORE_BOOTING = false;    // Evita múltiples boots simultáneos



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


  /* ==========================================================
     🟦 PRUEBA 8 — HEARTCORE BOOT LOADER V41
     Evita cualquier expulsión durante los primeros 8–11 s
     ========================================================== */
  async function heartcoreBoot() {

    if (HEARTCORE_READY) return;
    if (HEARTCORE_BOOTING) return;

    HEARTCORE_BOOTING = true;
    console.log("🔵 [HEARTCORE BOOT] Iniciando secuencia…");

    let attempts = 0;

    while (!HEARTCORE_READY) {

      attempts++;

      const s = getLocalSession();
      if (!s) {
        console.log("🔵 [HEARTCORE BOOT] MSCU incompleto. Reintentando…");
        await new Promise(res => setTimeout(res, 1500));
        continue;
      }

      try {
        const r = await fetch(`${API}/check-session?email=${s.email}&device_id=${s.device_id}`);
        const json = await r.json();
        console.log("🔵 [HEARTCORE BOOT] Handshake:", json);

        // Solo cuando Render confirma "valid"
        if (json.status === "valid") {
          HEARTCORE_READY = true;
          console.log("🟢 [HEARTCORE BOOT] COMPLETADO — Heartcore READY");
          break;
        }

      } catch (err) {
        console.warn("⚠️ [HEARTCORE BOOT] Error handshake:", err);
      }

      await new Promise(res => setTimeout(res, 1500));
    }

    HEARTCORE_BOOTING = false;
  }


  /* -------------------------------------------
     LOOP HEARTCORE
  ------------------------------------------- */
  async function heartcoreLoop() {

    if (!HEARTCORE_READY) return;  // 🛑 PRUEBA 8: NO ejecutar hasta Boot OK

    const s = getLocalSession();
    if (!s) return;

    if (window.location.pathname.includes("login")) return;

    await sendHeartbeat(s);
    await sendUpdate(s);
    await checkRemote(s);
  }


  // ==========================================================
  // ARRANQUE
  // ==========================================================
  heartcoreBoot();                          // PRUEBA 8: Boot primero
  setInterval(heartcoreBoot, 3000);         // Asegura boot estable

  setInterval(heartcoreLoop, 5000);         // Heartcore real
  heartcoreLoop();

})();
