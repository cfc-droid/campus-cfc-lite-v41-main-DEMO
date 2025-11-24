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

/* ✅ CFC_FUNC_4_5_D4 — POST-EXPULSION BLOCKER */
const urlParams = new URLSearchParams(window.location.search);
const isConflictLogin = urlParams.get("conflict") === "true";

// Si no existe MSCU y NO es login → bloquear
if (!mscu && !isConflictLogin) {
  console.warn("🚫 CFC_D4_BLOCK — navegación bloqueada tras expulsión");
  window.location.href = "/frontend/html/login.html?conflict=true";
  return;
}

// Si estamos en login con conflicto → limpiar rastros
if (isConflictLogin) {
  sessionStorage.removeItem("CFC_PREV_SESSION");
  console.log("🧹 CFC_D4_CLEAN — sesión previa ignorada tras conflicto");
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

/* ✅ CFC_FUNC_4_5_D3 — OVERLAY + EXPULSIÓN DIFERIDA */
setTimeout(() => {
  const overlay = document.createElement("div");
  overlay.innerHTML = `
    <div style="
      position:fixed;inset:0;z-index:999999;
      background:rgba(0,0,0,0.92);
      display:flex;align-items:center;justify-content:center;
      flex-direction:column;
      font-family:Poppins,sans-serif;
      color:#ffd700;
      font-size:26px;
      text-align:center;">
      <div>🚨 Sesión activa en otro dispositivo</div>
      <div style="margin-top:12px;font-size:18px;">
        Serás desconectado por seguridad...
      </div>
    </div>`;
  document.body.appendChild(overlay);

  setTimeout(() => {
    window.location.href = "/frontend/html/login.html?conflict=true";
  }, 1600);
}, 3000);

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
