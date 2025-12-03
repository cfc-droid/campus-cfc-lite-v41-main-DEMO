/* ==========================================================
   🟥 CFC_LOCK_IDENTITY_V41_SAFE
   Identity estable para MSCU V41
   Firestore + Render (pos-login, no en login.html)
   ========================================================== */

(function () {
  console.log("🧩 Identity V41 SAFE cargado");

  /* -------------------------------------------
     Proteger ejecución en login.html
  ------------------------------------------- */
  const isLogin = window.location.pathname.includes("login.html");
  if (isLogin) {
    console.log("⛔ Identity desactivado en login.html");
    return;
  }

  /* -------------------------------------------
     Firebase instancia segura
  ------------------------------------------- */
  let db = null;
  try {
    db = firebase.firestore();
    console.log("🟢 Identity usando Firestore normal");
  } catch (err) {
    console.error("❌ Firebase no inicializado antes de Identity:", err);
    return;
  }

  /* -------------------------------------------
     Utilidades
  ------------------------------------------- */
  const nowISO = () => new Date().toISOString();

  function forceLogout(reason) {
    console.warn("🚨 IDENTITY LOGOUT:", reason);

    const preserve = ["CFC_PROGRESS", "CFC_TIMER", "CFC_LAST_MODULE"];
    Object.keys(localStorage).forEach(k => {
      if (!preserve.includes(k)) localStorage.removeItem(k);
    });

    sessionStorage.clear();
    window.location.href = "/frontend/html/login.html";
  }

  /* -------------------------------------------
     LISTENER Firestore REAL
  ------------------------------------------- */
  function startListener(email, device_id) {
    try {
      db.collection("sessions").doc(email).onSnapshot(doc => {
        if (!doc.exists) return;

        const data = doc.data();
        console.log("📡 SNAPSHOT:", data);

        if (!data.active_session) {
          forceLogout("Sesión cerrada remotamente");
        }

        if (data.device_id !== device_id) {
          forceLogout("Sesión iniciada en otro dispositivo");
        }
      });
    } catch (e) {
      console.error("❌ Error listener FS:", e);
    }
  }

  /* -------------------------------------------
     VALIDACIÓN contra Render
  ------------------------------------------- */
  async function validateRender(email, device_id) {
    try {
      const r = await fetch(
        `https://cfc-lock-proxy.onrender.com/check-session?email=${email}&device_id=${device_id}`
      );
      const json = await r.json();

      console.log("🌐 Render INIT:", json);

      if (json.status !== "valid") {
        forceLogout("Render marcó sesión inválida");
      }
    } catch (e) {
      console.warn("⚠️ Error Render INIT:", e);
    }
  }

  /* -------------------------------------------
     BOOT PRINCIPAL (desde index.html)
  ------------------------------------------- */
  window.CFC_identityStart = function () {
    const email = localStorage.getItem("CFC_EMAIL");
    const device_id = localStorage.getItem("CFC_DEVICE_ID");

    if (!email || !device_id) {
      console.warn("⚠️ Identity no puede iniciar; datos faltantes");
      return;
    }

    console.log("🟢 Identity iniciado:", email, device_id);

    startListener(email, device_id);
    validateRender(email, device_id);
  };
})();
