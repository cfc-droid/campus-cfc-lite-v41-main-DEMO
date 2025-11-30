/* ==========================================================
   🟥 CFC_LOCK_IDENTITY_V72_ENFORCE_REAL (GLOBAL)
   Firestore + Render Hybrid
   Auditor: CFC-SYNC
   ========================================================== */

(function () {

  console.log("🧩 QA-SYNC | CFC_LOCK_IDENTITY_V72_ENFORCE_REAL cargado");

  /* -------------------------------------------
     Firebase inicializar
  ------------------------------------------- */
  const firebaseConfig = {
    apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
    authDomain: "cfc-lock-firebase.firebaseapp.com",
    projectId: "cfc-lock-firebase",
  };

  let db = null;
  try {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore(app);
    console.log("🟢 Firebase cargado (GLOBAL ENFORCE)");
  } catch (err) {
    console.error("❌ Firebase init error:", err);
  }

  /* -------------------------------------------
     Utilidades
  ------------------------------------------- */
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

  /* -------------------------------------------
     Registrar sesión Firestore (ENFORCE REAL)
  ------------------------------------------- */
  async function registerSession(email, device_id, session_id) {
    try {
      await db.collection("sessions").doc(email).set({
        email,
        device_id,
        session_id,
        active_session: true,
        last_active: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at_iso: nowISO()
      });

      console.log("🟢 [ENFORCE] Sesión registrada FS:", {
        email, device_id, session_id
      });

    } catch (err) {
      console.error("❌ registerSession error:", err);
    }
  }

  /* --------------------------------------------------------
     ❌ ELIMINADO: forceLogoutFS
     (Identity ya NO expulsa — solo emite señales)
     -------------------------------------------------------- */


  /* ============================================================
       5/5-D.1 — Identity ENFORCE (Snapshot Normalizer)
       Genera señales para HEARTCORE sin expulsar directamente.
     ============================================================ */
  window.CFC_identity_enforce = function(email, device_id, data) {
    try {
      console.log("🟪 [IDENTITY-ENFORCE] Evaluando snapshot…", data);

      if (!data) return;

      // 1) Device ID no coincide → sesión duplicada
      if (data.device_id && data.device_id !== device_id) {
        console.warn("🚨 [IDENTITY-ENFORCE] DEVICE MISMATCH");

        localStorage.setItem("CFC_HEARTCORE_SIGNAL", "EXPEL_FS");
        localStorage.setItem(
          "CFC_HEARTCORE_REASON",
          "Sesión iniciada en otro dispositivo (FIRESTORE)"
        );
        return;
      }

      // 2) active_session = false
      if (data.active_session === false) {
        console.warn("🚨 [IDENTITY-ENFORCE] ACTIVE_SESSION = FALSE");

        localStorage.setItem("CFC_HEARTCORE_SIGNAL", "EXPEL_FS");
        localStorage.setItem(
          "CFC_HEARTCORE_REASON",
          "Sesión cerrada remotamente (FIRESTORE)"
        );
        return;
      }

      // 3) session_id cambiado
      const local_sid = localStorage.getItem("CFC_SESSION_ID");
      if (data.session_id && data.session_id !== local_sid) {
        console.warn("🚨 [IDENTITY-ENFORCE] SESSION_ID MISMATCH");

        localStorage.setItem("CFC_HEARTCORE_SIGNAL", "EXPEL_FS");
        localStorage.setItem(
          "CFC_HEARTCORE_REASON",
          "Cambio de session_id detectado (FIRESTORE)"
        );
        return;
      }

      console.log("🟩 [IDENTITY-ENFORCE] Snapshot válido ✔");

    } catch (err) {
      console.error("❌ [IDENTITY-ENFORCE] Error:", err);
    }
  };


  /* -------------------------------------------
     Listener Firestore REAL (RE-WRITTEN)
     Ahora usa CFC_identity_enforce y NO expulsa.
  ------------------------------------------- */
  function listenEnforce(email, device_id) {
    db.collection("sessions").doc(email).onSnapshot(doc => {
      if (!doc.exists) return;

      const data = doc.data() || {};
      console.log("📡 SNAPSHOT:", data);

      // Identity solo genera señales para Heartcore
      window.CFC_identity_enforce(email, device_id, data);
    });
  }

  /* -------------------------------------------
     Validación inicial Render
     (ahora NO expulsa — solo emite señales)
  ------------------------------------------- */
  async function checkRender(email, device_id) {
    try {
      const r = await fetch(
        `https://cfc-lock-proxy.onrender.com/check-session?email=${email}&device_id=${device_id}`
      );
      const json = await r.json();
      console.log("🌐 Render INIT:", json);

      if (json.status === "invalid" || json.status === "expired") {
        localStorage.setItem("CFC_HEARTCORE_SIGNAL", "EXPEL_RENDER");
        localStorage.setItem(
          "CFC_HEARTCORE_REASON",
          "Sesión iniciada en otro dispositivo (RENDER INIT)"
        );
      }
    } catch (e) {
      console.warn("⚠️ Render INIT error:", e);
    }
  }

  /* -------------------------------------------
     LOGIN GLOBAL (se usa en login.html)
  ------------------------------------------- */
  window.CFC_login = async function(email, license) {

    console.log("🧩 CFC_login() — ENFORCE REAL");

    const e = email.trim().toLowerCase();
    const k = license.trim();
    const sid = makeSessionId();
    const did = makeDeviceId();

    localStorage.setItem("CFC_EMAIL", e);
    localStorage.setItem("CFC_LICENSE", k);
    localStorage.setItem("CFC_SESSION_ID", sid);
    localStorage.setItem("CFC_DEVICE_ID", did);

    await registerSession(e, did, sid);

    listenEnforce(e, did);

    checkRender(e, did);

    return { email: e, device_id: did, session_id: sid };
  };

})();
