// ===============================================================
// 🛡️ CFC-SYNC — Validador oficial de sesión (MSCU V1 FINAL)
// Archivo: /frontend/js/cfc_session_validator.js
// Versión: V1.2 — 21/11/2025
// Autor: Cristian F. Choqui (CFC)
// ===============================================================

//-------------------------------------------------------------
// Cargar sesión (wrapper)
//-------------------------------------------------------------
window.CFC_GET_SESSION = function () {
  try {
    const raw = localStorage.getItem("CFC_SESSION");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("❌ Error leyendo sesión:", e);
    return null;
  }
};

//-------------------------------------------------------------
// Validar expiración
//-------------------------------------------------------------
window.CFC_VALIDATE_EXPIRATION = function (session) {
  return session && Date.now() < session.expires_at;
};

//-------------------------------------------------------------
// Validar Device ID persistente
//-------------------------------------------------------------
window.CFC_VALIDATE_DEVICE = function (session) {
  const did = localStorage.getItem("CFC_DEVICE_ID");
  if (!did) return false;
  return session.device_id === did;
};

//-------------------------------------------------------------
// Validar flags remotos
//-------------------------------------------------------------
window.CFC_VALIDATE_REMOTE_FLAGS = function (session) {
  return (
    session.license_valid === true &&
    session.firestore_valid === true &&
    session.render_valid === true
  );
};

//-------------------------------------------------------------
// Validación completa (sin redirección)
//-------------------------------------------------------------
window.CFC_VALIDATE_FULL_SESSION = function () {
  const session = window.CFC_GET_SESSION();
  if (!session) return false;

  const valid =
    session.session_token &&
    session.email &&
    session.device_id &&
    window.CFC_VALIDATE_EXPIRATION(session) &&
    window.CFC_VALIDATE_DEVICE(session) &&
    window.CFC_VALIDATE_REMOTE_FLAGS(session);

  console.log("🛡️ CFC-SESSION Validator (MSCU V1):", {
    token: !!session.session_token,
    email: !!session.email,
    device: window.CFC_VALIDATE_DEVICE(session),
    expiration: window.CFC_VALIDATE_EXPIRATION(session),
    remote_flags: window.CFC_VALIDATE_REMOTE_FLAGS(session),
    final: valid,
  });

  return valid;
};
