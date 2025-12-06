/* ==========================================================
   🟥 CFC_LOCK_IDENTITY_V72_ENFORCE_REAL (GLOBAL)
   Firestore + Render Hybrid
   Auditor: CFC-SYNC
   ========================================================== */

(function () {

  console.log("🧩 QA-SYNC | CFC_LOCK_IDENTITY_V72_ENFORCE_REAL cargado");

 /* -------------------------------------------
   Firebase inicializar (USAR INSTANCIA GLOBAL)
------------------------------------------- */
let db = null;

try {
  if (window.CFC_FIREBASE_DB) {
    db = window.CFC_FIREBASE_DB;
    console.log("🟢 Firebase conectado desde instancia GLOBAL");
  } else {
    console.error("❌ No existe CFC_FIREBASE_DB — firebase_init.js no cargó");
  }

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

  /* -------------------------------------------
     Expulsar por SNAPSHOT
  ------------------------------------------- */
  function forceLogoutFS(reason, email, device_id) {
    console.warn("🚨 SNAPSHOT expulsión:", reason);

    if (window.CFC_showBlockOverlay)
      CFC_showBlockOverlay(email, device_id, reason);

    const preserve = ["CFC_PROGRESS", "CFC_TIMER", "CFC_LAST_MODULE"];
    Object.keys(localStorage).forEach(k => {
      if (!preserve.includes(k)) localStorage.removeItem(k);
    });

    sessionStorage.clear();

    setTimeout(() => {
      window.location.href = "/frontend/html/login.html";
    }, 1200);
  }

  /* -------------------------------------------
     Listener Firestore REAL (ENFORCE)
  ------------------------------------------- */
  function listenEnforce(email, device_id) {
    db.collection("sessions").doc(email).onSnapshot(doc => {
      if (!doc.exists) return;

      const data = doc.data();
      console.log("📡 SNAPSHOT:", data);

      if (data.device_id !== device_id) {
        forceLogoutFS("Sesión iniciada en otro dispositivo (FIRESTORE)", email, device_id);
      }

      if (data.active_session === false) {
        forceLogoutFS("Sesión cerrada remotamente (FIRESTORE)", email, device_id);
      }
    });
  }

  /* -------------------------------------------
     Validación inicial Render
  ------------------------------------------- */
  async function checkRender(email, device_id) {
    try {
      const r = await fetch(
        `https://cfc-lock-proxy.onrender.com/check-session?email=${email}&device_id=${device_id}`
      );
      const json = await r.json();
      console.log("🌐 Render INIT:", json);

      if (json.status === "invalid" || json.status === "expired") {
        forceLogoutFS("Sesión iniciada en otro dispositivo (RENDER INIT)", email, device_id);
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
