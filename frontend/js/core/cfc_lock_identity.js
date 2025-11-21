/* ============================================================================
   🔒 CFC_LOCK_IDENTITY.JS — V43 FINAL FIX (2025-11-21)
   Sistema: Campus CFC LITE V41
   Función: Identidad, sesión y login → compatible con CFC-GUARD + MSCU V1
   ============================================================================ */

console.log("🟦 [CFC_LOCK_IDENTITY] Cargado correctamente");

// ============================================================================
// 🔹 Helpers
// ============================================================================

function generateSessionID() {
  return "SID-" + Math.random().toString(36).substring(2) + Date.now();
}

function getDeviceID() {
  let did = localStorage.getItem("CFC_DEVICE_ID");
  if (!did) {
    did = "DID-" + Math.random().toString(36).substring(2) + Date.now();
    localStorage.setItem("CFC_DEVICE_ID", did);
  }
  return did;
}

function saveEmail(email) {
  localStorage.setItem("CFC_EMAIL", email);
}

// ============================================================================
// 🔹 CREACIÓN DE LA SESIÓN MSCU V1 — (ESTO ES LO QUE FALTABA PARA EL GUARD)
// ============================================================================

function createMSCU(email, device_id, session_token) {
  const session = {
    session_token: session_token,
    email: email,
    device_id: device_id,
    license_valid: true,       // Render OK
    firestore_valid: true,     // Se actualizará en tiempo real si cambia
    render_valid: true,        // validación /check-session OK
    created_at: Date.now(),
    expires_at: Date.now() + 1000 * 60 * 60 * 24 // 24 horas
  };

  localStorage.setItem("CFC_SESSION", JSON.stringify(session));

  console.log("🟢 [MSCU] Sesión MSCU creada correctamente:", session);
}


// ============================================================================
// 🔹 FUNCIONES REMOTAS
// ============================================================================

async function registerLogin(email, device_id) {
  try {
    const url = `${window.CFC_PROXY}/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, device_id })
    });

    const data = await res.json();
    console.log("📡 [Render /login] →", data);
    return data;
  } catch (e) {
    console.error("❌ Error en registerLogin:", e);
    return { status: "error" };
  }
}

async function checkSession(email, device_id) {
  try {
    const url = `${window.CFC_PROXY}/check-session?email=${email}&device_id=${device_id}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log("📡 [Render /check-session] →", data);
    return data;
  } catch (e) {
    console.error("❌ Error en checkSession:", e);
    return { status: "invalid" };
  }
}


// ============================================================================
// 🔸 Heartbeat
// ============================================================================

async function startHeartbeat(email, device_id) {
  setInterval(async () => {
    try {
      await fetch(`${window.CFC_PROXY}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, device_id })
      });
      console.log("💓 Heartbeat OK");
    } catch (e) {
      console.warn("⚠ Heartbeat error");
    }
  }, 10000);
}


// ============================================================================
// 🔸 Firestore Listener (opcional, pero recomendado)
// ============================================================================

function startRealtimeSync(email) {
  try {
    if (!window.db) return console.log("⚠ Firestore no cargado");

    const ref = window.db.collection("licenses").doc(email);

    ref.onSnapshot((doc) => {
      if (!doc.exists) return;

      const data = doc.data();
      console.log("🔥 [Firestore Sync]", data);

      if (data.session_force_closed === true) {
        console.warn("🚨 Sesión cerrada desde Firebase");
        localStorage.removeItem("CFC_SESSION");
        window.location.href = "../html/login.html";
      }
    });

  } catch (e) {
    console.warn("⚠ Firestore listener error:", e);
  }
}


// ============================================================================
// 🔸 Server Polling (backup)
// ============================================================================

function startServerPolling(email, device_id) {
  setInterval(async () => {
    const ch = await checkSession(email, device_id);

    if (ch.status !== "valid") {
      console.warn("🚨 Polling detectó sesión inválida");
      localStorage.removeItem("CFC_SESSION");
      window.location.href = "../html/login.html";
    }
  }, 15000);
}


// ============================================================================
// 🔹 LOGIN PRINCIPAL — (AQUÍ ESTABA EL ERROR ORIGINAL)
// ============================================================================

async function CFC_login(email, license) {
  console.log("⏳ Iniciando CFC_login…");

  saveEmail(email);

  const did = getDeviceID();
  const sid = generateSessionID();

  localStorage.setItem("CFC_LICENSE", license);
  localStorage.setItem("CFC_SESSION_ID", sid);

  // 1) Registrar login en Render
  await registerLogin(email, did);

  // 2) Verificar sesión real en Render
  const valid = await checkSession(email, did);

  if (valid.status !== "valid") {
    console.warn("🚨 Render no validó la sesión…");
    return alert("Error de sesión. Reintentá.");
  }

  console.log("🟢 Render validó correctamente.");


  // ============================================================
  //   ✔️ CREAR Y GUARDAR LA SESIÓN MSCU V1 OFICIAL
  // ============================================================

  createMSCU(email, did, sid);


  // ============================================================
  //   🔄 Iniciar servicios de sesión (heartbeat, sync, polling)
  // ============================================================

  startHeartbeat(email, did);
  startRealtimeSync(email, did);
  startServerPolling(email, did);


  // ============================================================
  //   🚀 REDIRECCIÓN FINAL AL CAMPUS
  // ============================================================

  setTimeout(() => {
    console.log("➡ Redirigiendo al Campus…");
    window.location.href = "../index.html";
  }, 600);
}


// ============================================================================
// 🔹 EXPORTAR (si se usa como módulo)
// ============================================================================
window.CFC_login = CFC_login;

console.log("🟩 [CFC_LOCK_IDENTITY] Listo.");
