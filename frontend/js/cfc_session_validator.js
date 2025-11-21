// ===============================================================
// 🛡️ CFC-SYNC — Validador de Sesión (MSCU V1 — FINAL 2025)
// Archivo: /frontend/js/cfc_session_validator.js
// Versión: V1.5 — Compatibilidad total con CFC_GUARD + CFC_IDENTITY
// Autor: Cristian F. Choqui (CFC)
// ===============================================================

// ------------------------------------------------------------
// LEER SESIÓN OFICIAL
// ------------------------------------------------------------
window.CFC_GET_SESSION = function () {
  try {
    const raw = localStorage.getItem("CFC_SESSION");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("❌ Error al leer sesión:", e);
    return null;
  }
};

// ------------------------------------------------------------
// VALIDAR EXPIRACIÓN (created_at + expires_at)
// ------------------------------------------------------------
window.CFC_VALIDATE_EXPIRATION = function (session) {
  return (
    session &&
    typeof session.expires_at === "number" &&
    Date.now() < session.expires_at
  );
};

// ------------------------------------------------------------
// VALIDAR DEVICE ID LOCAL
// ------------------------------------------------------------
window.CFC_VALIDATE_DEVICE = function (session) {
  const did = localStorage.getItem("CFC_DEVICE_ID");
  if (!did) return false;
  return session.device_id === did;
};

// ------------------------------------------------------------
// VALIDAR FLAGS REMOTOS
// ------------------------------------------------------------
window.CFC_VALIDATE_REMOTE_FLAGS = function (session) {
  return (
    session.license_valid === true &&
    session.firestore_valid === true &&
    session.render_valid === true
  );
};

// ------------------------------------------------------------
// VALIDACIÓN COMPLETA MSCU V1
// ------------------------------------------------------------
window.CFC_VALIDATE_FULL_SESSION = function () {
  const s = window.CFC_GET_SESSION();
  if (!s) return false;

  const valid =
    s.session_token &&
    s.email &&
    s.device_id &&
    window.CFC_VALIDATE_EXPIRATION(s) &&
    window.CFC_VALIDATE_DEVICE(s) &&
    window.CFC_VALIDATE_REMOTE_FLAGS(s);

  console.log("🛡️ CFC-SESSION Validator (MSCU V1):", {
    token: !!s.session_token,
    email: !!s.email,
    device: window.CFC_VALIDATE_DEVICE(s),
    expiration: window.CFC_VALIDATE_EXPIRATION(s),
    remote_flags: window.CFC_VALIDATE_REMOTE_FLAGS(s),
    final: valid,
  });

  return valid;
};
