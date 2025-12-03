// ===============================================================
// 🧩 CFC-SYNC — CFC_SESSION_BUILDER (MSCU V1 FINAL)
// Ubicación: /frontend/js/cfc_session_builder.js
// Versión: V1.2 — 21/11/2025
// Autor: Cristian F. Choqui (CFC)
// ===============================================================

//-------------------------------------------------------------
// Generar token único — compatible MSCU V1
//-------------------------------------------------------------
window.CFC_GENERATE_TOKEN = function () {
  return (
    "CFC_" +
    crypto.randomUUID().replace(/-/g, "") +
    "_" +
    Date.now().toString(36)
  );
};

//-------------------------------------------------------------
// Estructura vacía MSCU V1
//-------------------------------------------------------------
window.CFC_CREATE_EMPTY_SESSION = function () {
  return {
    session_token: "",
    session_id: "",
    user_id: "",
    email: "",
    license_valid: false,
    firestore_valid: false,
    render_valid: false,
    device_id: "",
    created_at: Date.now(),
    last_active: Date.now(),
    expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
    version: "MSCU_V1",
  };
};

//-------------------------------------------------------------
// Aplicar expiración automática (24 horas)
//-------------------------------------------------------------
window.CFC_APPLY_EXPIRATION = function (session) {
  session.expires_at = Date.now() + 24 * 60 * 60 * 1000;
  return session;
};

//-------------------------------------------------------------
// Guardar sesión en localStorage
//-------------------------------------------------------------
window.CFC_SAVE_SESSION = function (session) {
  try {
    localStorage.setItem("CFC_SESSION", JSON.stringify(session));
    console.log("💾 CFC_SESSION guardada correctamente:", session);
  } catch (e) {
    console.error("❌ ERROR al guardar la sesión:", e);
  }
};

//-------------------------------------------------------------
// Cargar sesión
//-------------------------------------------------------------
window.CFC_LOAD_SESSION = function () {
  try {
    const raw = localStorage.getItem("CFC_SESSION");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("❌ ERROR al cargar la sesión:", e);
    return null;
  }
};

//-------------------------------------------------------------
// Validar la sesión (expiración + integridad)
//-------------------------------------------------------------
window.CFC_VALIDATE_SESSION = function (session) {
  if (!session) return false;

  if (!session.session_token) return false;
  if (!session.email) return false;
  if (!session.device_id) return false;

  if (Date.now() > session.expires_at) {
    console.warn("⚠️ Sesión expirada.");
    return false;
  }

  return true;
};

//-------------------------------------------------------------
// Constructor principal de sesión (MSCU V1 FINAL)
//-------------------------------------------------------------
window.CFC_BUILD_SESSION = async function (params) {
  try {
    // Sesión previa (si existe)
    const previous = window.CFC_LOAD_SESSION();

    // Crear base nueva
    let session = window.CFC_CREATE_EMPTY_SESSION();

    // Asignar campos obligatorios
    session.user_id = params.user_id || "";
    session.email = params.email || "";
    session.license_valid = !!params.license_valid;
    session.render_valid = !!params.render_valid;
    session.firestore_valid = !!params.firestore_valid;
    session.device_id = params.device_id || "";

    // ID único del login actual
    session.session_token = window.CFC_GENERATE_TOKEN();

    // Identificador persistente de sesión (si el usuario ya tenía una previa válida)
    session.session_id =
      previous && previous.session_id ? previous.session_id : crypto.randomUUID();

    // Actualizar tiempos
    session.created_at =
      previous && previous.created_at ? previous.created_at : Date.now();
    session.last_active = Date.now();

    // Expiración
    session = window.CFC_APPLY_EXPIRATION(session);

    // Guardar final
    window.CFC_SAVE_SESSION(session);

    console.log("🎉 CFC_SESSION CREATED — MSCU V1 FINAL:", session);
    return session;
  } catch (e) {
    console.error("❌ ERROR al construir sesión MSCU V1:", e);
    return null;
  }
};
