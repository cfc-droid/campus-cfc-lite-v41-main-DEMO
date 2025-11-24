/* ==========================================================
   ✅ CFC_LOCK_CORE_V70.1_PERMISSIVE_READY
   Sistema: Campus CFC LITE V41-DEMO
   Propósito: Guard con modo PERMISIVO para pruebas del índice
   ========================================================== */

const CFC_LOCK_ENFORCE = false; // ✅ MODO PERMISIVO PARA PRUEBA 5/8-C.2

(function () {

  const API_URL = "https://cfc-lock-proxy.onrender.com";

  function getMSCU() {
    try {
      const data = localStorage.getItem("CFC_SESSION");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function logoutNow(reason) {
    console.warn("🚨 Logout forzado:", reason);

    // ✅ NO borra todo — solo claves relacionadas
    localStorage.removeItem("CFC_SESSION");
    localStorage.removeItem("CFC_EMAIL");
    localStorage.removeItem("CFC_DEVICE_ID");

    const msg = reason || "⚠️ Sesión cerrada automáticamente.";
    const overlay = document.createElement("div");
    overlay.innerHTML = `
      <div style="
        position:fixed;inset:0;z-index:99999;
        background:rgba(0,0,0,0.85);
        color:#ffd700;font-family:Poppins,sans-serif;
        display:flex;align-items:center;justify-content:center;
        flex-direction:column;font-size:22px;">
        <div>⚠️ ${msg}</div>
        <div style="font-size:16px;margin-top:10px;">Redirigiendo...</div>
      </div>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
      window.location.href = "/frontend/html/login.html?expired=true";
    }, 1800);
  }

  async function verifyRemoteSession(email, device_id) {
    try {
      const res = await fetch(`${API_URL}/check-session?email=${email}&device_id=${device_id}`);
      const data = await res.json();
      return data?.status === "valid";
    } catch (err) {
      console.log("🔁 Error temporal al verificar sesión:", err.message);
      return true; // ✅ No desconecta por error de red
    }
  }

  async function runLock() {

    const mscu = getMSCU();

    // ✅ Permitir login operar sin guard
    if (window.location.pathname.includes("login")) {
      console.log("🛑 Guard inactivo en login — OK");
      return;
    }

    // ✅ Si no existe MSCU → aplicar según modo
    if (!mscu) {
      if (CFC_LOCK_ENFORCE) {
        logoutNow("Sesión no válida o expirada.");
      }
      console.warn("⚠️ MSCU inexistente — permitido por modo PERMISIVO");
      return;
    }

    const { session_user_email, device_id } = mscu;

    // ✅ Si falta info → actuar según modo
    if (!session_user_email || !device_id) {
      if (CFC_LOCK_ENFORCE) {
        logoutNow("Datos de sesión incompletos.");
      }
      console.warn("⚠️ MSCU incompleto — permitido por modo PERMISIVO");
      return;
    }

// ✅ Si modo permisivo → no seguir verificando
if (!CFC_LOCK_ENFORCE) {
  console.log("🟡 Guard en modo PERMISIVO — navegación permitida");
  
/* ✅ CFC_FUNC_4_5_D2 — SESSION CONFLICT DETECTOR */
try {
  const previousSession = sessionStorage.getItem("CFC_PREV_SESSION");
  const mscuRaw = localStorage.getItem("CFC_SESSION");

  if (previousSession && mscuRaw) {
    const prev = JSON.parse(previousSession);
    const curr = JSON.parse(mscuRaw);

    const sameUser = prev.session_user_email === curr.session_user_email;
    const differentDevice = prev.device_id !== curr.device_id;
    const changedToken = true; // ✅ fuerza detección en modo permisivo

    if (sameUser && (differentDevice || changedToken)) {
      console.warn("🚨 CFC_SESSION_CONFLICT detectado — otro dispositivo activo");

      // ✅ Evento interno sin expulsión
      window.dispatchEvent(new CustomEvent("CFC_SESSION_CONFLICT"));

      console.log("✅ Evento CFC_SESSION_CONFLICT enviado correctamente");
    }
  }

  if (mscuRaw) {
    sessionStorage.setItem("CFC_PREV_SESSION", mscuRaw);
  }

} catch (err) {
  console.error("❌ Error en detector D2:", err);
}

// ✅ ahora sí:
if (!CFC_LOCK_ENFORCE) {
  console.log("🟡 Guard en modo PERMISIVO — navegación permitida");
  return;
}
     
    // ✅ MODO ESTRICTO — verificar remoto
    const valid = await verifyRemoteSession(session_user_email, device_id);

    if (!valid) {
      logoutNow("Tu sesión fue cerrada desde otro dispositivo.");
    }
  }

  console.log(`🧠 CFC_LOCK_CORE activo → modo=${CFC_LOCK_ENFORCE ? "ENFORCE" : "PERMISSIVE"}`);
  setInterval(runLock, 5000);
  runLock();

})();
