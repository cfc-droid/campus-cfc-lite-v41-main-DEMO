// 🛡️ CFC-SYNC — Validador oficial de sesión (MSCU V1)
// Archivo: /frontend/js/cfc_session_validator.js
// Versión: V1.0
// Autor: CFC

//-------------------------------------------------------------
// Verificar presencia de campos mínimos MSCU V1
//-------------------------------------------------------------
window.CFC_VALIDATE_MIN_FIELDS = function(session) {
  if (!session) return false;

  const required = window.CFC_SESSION_REQUIRED_FIELDS;
  return required.every(f => session.hasOwnProperty(f));
};

//-------------------------------------------------------------
// Verificar expiración de la sesión (24 hs)
//-------------------------------------------------------------
window.CFC_VALIDATE_EXPIRATION = function(session) {
  if (!session) return false;

  const now = Date.now();
  return now < session.session_expires_at;
};

//-------------------------------------------------------------
// Verificar Device ID correcto
//-------------------------------------------------------------
window.CFC_VALIDATE_DEVICE = function(session) {
  if (!session) return false;

  const localDid = localStorage.getItem("CFC_DEVICE_ID");
  if (!localDid) return false;

  return session.device_id === localDid;
};

//-------------------------------------------------------------
// Validar flags remotos (Render + Firestore + Licencia)
//-------------------------------------------------------------
window.CFC_VALIDATE_REMOTE_FLAGS = function(session) {
  if (!session) return false;

  return (
    session.license_valid === true &&
    session.render_valid === true &&
    session.firestore_valid === true
  );
};

//-------------------------------------------------------------
// VALIDACIÓN COMPLETA MSCU V1 (sin redirecciones)
//-------------------------------------------------------------
window.CFC_VALIDATE_FULL_SESSION = function() {
  const session = window.CFC_GET_SESSION();
  if (!session) return false;

  const checks = {
    fields: window.CFC_VALIDATE_MIN_FIELDS(session),
    expiration: window.CFC_VALIDATE_EXPIRATION(session),
    device: window.CFC_VALIDATE_DEVICE(session),
    remote: window.CFC_VALIDATE_REMOTE_FLAGS(session)
  };

  console.log("🛡️ CFC-VALIDATOR — Estado de validación:", checks);

  return checks.fields && checks.expiration && checks.device && checks.remote;
};
