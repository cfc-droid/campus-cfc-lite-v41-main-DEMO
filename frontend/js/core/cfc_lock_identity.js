/* ==========================================================
   🟥 CFC_LOCK_IDENTITY_V72.4 — HEARTCORE SIGNAL ENGINE
   Firestore Snapshot + Render Check + Señales al Heartcore
   Integración completa con SYNC REMOTE + CFC_LOCK_CORE_V72.3
   Auditor: CFC-SYNC
   ========================================================== */

(function () {

  console.log("🧩 QA-SYNC | CFC_LOCK_IDENTITY_V72.4 cargado");

  /* ---------------------------------------------------------
     FIREBASE INIT (instancia global ya existente)
  --------------------------------------------------------- */
  let db = null;
  try {
    db = firebase.firestore();
    console.log("🟢 Firebase (identity) inicializado correctamente");
  } catch (err) {
    console.error("❌ Error inicializando Firebase en identity:", err);
  }

  /* ---------------------------------------------------------
     UTILIDADES
  --------------------------------------------------------- */
  const nowISO = () => new Date().toISOString();

  function makeSessionId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function makeDeviceId() {
    let id = localStorage.getItem("CFC_DEVICE_ID");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("CFC_DEVICE_ID", id);
    }
    return id;
  }

  /* ---------------------------------------------------------
     🔴 EMISIÓN DE SEÑALES AL HEARTCORE (Core lo procesa)
  --------------------------------------------------------- */
  function sendHeartcoreSignal(type) {
    console.warn("📡 Emisión señal HEARTCORE:", type);
    localStorage.setItem("CFC_HEARTCORE_SIGNAL", type);
  }

  /* ---------------------------------------------------------
     REGISTRAR SESIÓN (primer paso al loguear)
  --------------------------------------------------------- */
  async function registerSession(email, device_id, session_id) {
    try {
      await db.collection("sessions").doc(email).set({
        email,
        device_id,
        session_id,
        active_session: true,
        last_active: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at_iso: nowISO()
      }, { merge: true });

      console.log("🟢 [IDENTITY] Sesión registrada:", { email, device_id, session_id });

    } catch (err) {
      console.error("❌ registerSession error:", err);
    }
  }

  /* ---------------------------------------------------------
     SNAPSHOT HANDLER — Evaluación del documento en vivo
  --------------------------------------------------------- */
  function handleSnapshot(email, device_id, session_id, data) {

    console.log("📡 [IDENTITY] SNAPSHOT recibido:", data);

    // 1) Cambio de dispositivo
    if (data.device_id !== device_id) {
      sendHeartcoreSignal("DEVICE_CONFLICT");
      return;
    }

    // 2) Sesión remota cerrada
    if (data.active_session === false) {
      sendHeartcoreSignal("SESSION_CLOSED");
      return;
    }

    // 3) Cambio de session_id (manipulación o suplantación)
    if (data.session_id !== session_id) {
      sendHeartcoreSignal("SESSION_CHANGED");
      return;
    }
  }

  /* ---------------------------------------------------------
     LISTENER FIRESTORE — monitoreo continuo
  --------------------------------------------------------- */
  function listenIdentity(email, device_id, session_id) {

    db.collection("sessions")
      .doc(email)
      .onSnapshot(doc => {

        if (!doc.exists) return;
        const data = doc.data();

        handleSnapshot(email, device_id, session_id, data);
      });
  }

  /* ---------------------------------------------------------
     CHECK RENDER — validación híbrida inicial
  --------------------------------------------------------- */
  async function checkRenderIdentity(email, device_id) {
    try {
      const r = await fetch(
        `https://cfc-lock-proxy.onrender.com/check-session?email=${email}&device_id=${device_id}`
      );
      const json = await r.json();
      console.log("🌐 [IDENTITY] Render INIT:", json);

      if (json.status === "invalid" || json.status === "expired") {
        sendHeartcoreSignal("DEVICE_CONFLICT");
      }

    } catch (err) {
      console.warn("⚠️ Render INIT error:", err);
    }
  }

  /* ---------------------------------------------------------
     LOGIN GLOBAL — llamado desde login.html
  --------------------------------------------------------- */
  window.CFC_login = async function(email, license) {

    console.log("🧩 CFC_login() — HEARTCORE READY");

    const e = email.trim().toLowerCase();
    const k = license.trim();

    const session_id = makeSessionId();
    const device_id = makeDeviceId();

    /* Guardar MSCU mínima (NO progreso) */
    localStorage.setItem("CFC_EMAIL", e);
    localStorage.setItem("CFC_LICENSE", k);
    localStorage.setItem("CFC_SESSION_ID", session_id);
    localStorage.setItem("CFC_DEVICE_ID", device_id);

    /* Registrar en Firestore */
    await registerSession(e, device_id, session_id);

    /* Activar listener permanente */
    listenIdentity(e, device_id, session_id);

    /* Validación híbrida Render */
    checkRenderIdentity(e, device_id);

    console.log("🟢 Login Identity COMPLETO — listo para HEARTCORE");

    return {
      email: e,
      device_id,
      session_id
    };
  };

})();
