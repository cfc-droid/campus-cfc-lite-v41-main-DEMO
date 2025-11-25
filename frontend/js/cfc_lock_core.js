/* ==========================================================
   ✅ CFC_LOCK_CORE_V72_LAYER_COMPATIBLE
   Sistema: Campus CFC LITE V41-DEMO
   Propósito: Heartcore Monitor + Render Sync (modo permisivo)
   Compatibilidad: 100% con login local CFC_USERS
   No borra progreso — No expulsa prematuro
   ========================================================== */

const CFC_LOCK_ENFORCE = false; // 🔸 MODO PERMISIVO (Fase 4/5-D)

(function () {

  const API_URL = "https://cfc-lock-proxy.onrender.com";

  /* ==========================================================
     🧩 Obtener datos de sesión local (CFC_SESSION)
     NO se modifica tu MSCU — NO se exige estructura aún
     ========================================================== */
  function getMSCU() {
    try {
      const data = localStorage.getItem("CFC_SESSION");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  /* ==========================================================
     🧩 Logout suave (sin borrar progreso)
     Compatible con overlay_block.js
     ========================================================== */
  function logoutNow(reason) {
    console.warn("🚨 Logout forzado:", reason);

    // 🔸 Limpieza mínima (sin clear total)
    localStorage.removeItem("CFC_SESSION");
    localStorage.removeItem("CFC_EMAIL");
    localStorage.removeItem("CFC_DEVICE_ID");

    // 🔸 Overlay de bloqueo (si existe)
    if (window.CFC_showBlockOverlay) {
      window.CFC_showBlockOverlay(reason || "⚠️ Sesión cerrada automáticamente.");
    }

    // 🔸 Redirección segura
    setTimeout(() => {
      window.location.href = "/frontend/html/login.html?expired=true";
    }, 1600);
  }

  /* ==========================================================
     🧩 Verificar sesión en Render (modo seguro)
     Nota: En modo PERMISIVO nunca expulsa
     ========================================================== */
  async function verifyRemoteSession(email, device_id) {
    try {
      const res = await fetch(`${API_URL}/check-session?email=${email}&device_id=${device_id}`);
      const data = await res.json();
      return data?.status === "valid";
    } catch (err) {
      console.log("🔁 Error temporal Render:", err.message);
      return true; // 🔹 Nunca expulsa por error
    }
  }

  /* ==========================================================
     🧩 Heartcore Monitor principal
     ========================================================== */
  async function runLock() {

    // 🔹 Login.html → guard NO aplica
    if (window.location.pathname.includes("login")) {
      console.log("🛑 Guard inactivo en login — OK");
      return;
    }

    const mscu = getMSCU();

    /* ========================================================
       ⚠ Caso 1 — No existe MSCU
       PERMITIDO en esta fase (modo permisivo)
       ======================================================== */
    if (!mscu) {
      console.warn("⚠️ MSCU inexistente — permitido (modo PERMISIVO)");
      return;
    }

    const { session_user_email, device_id } = mscu;

    /* ========================================================
       ⚠ Caso 2 — Faltan campos
       PERMITIDO en esta fase
       ======================================================== */
    if (!session_user_email || !device_id) {
      console.warn("⚠️ MSCU incompleto — permitido (modo PERMISIVO)");
      return;
    }

    /* ========================================================
       🟡 Caso 3 — MODO PERMISIVO
       No hace expulsión → solo logs
       ======================================================== */
    if (!CFC_LOCK_ENFORCE) {
      console.log("🟡 Guard PERMISIVO activo — navegación permitida");
      return;
    }

    /* ========================================================
       🔥 Caso 4 — MODO ESTRICTO (en el futuro)
       ======================================================== */
    const valid = await verifyRemoteSession(session_user_email, device_id);

    if (!valid) {
      logoutNow("⚠️ Tu sesión fue cerrada desde otro dispositivo.");
    }
  }

  /* ==========================================================
     🫀 Heartbeat local para auditoría
     ========================================================== */
  setInterval(() => {
    localStorage.setItem("CFC_HEARTBEAT_TS", Date.now());
  }, 4000);

  /* ==========================================================
     🟦 Inicialización del guard
     ========================================================== */
  console.log(`
🧠 CFC_LOCK_CORE_V72_LAYER_COMPATIBLE
Modo actual → ${CFC_LOCK_ENFORCE ? "ESTRICTO" : "PERMISIVO"}
Heartcore Monitor activo
Render Sync activo
`);

  setInterval(runLock, 6000);
  runLock();

})();
