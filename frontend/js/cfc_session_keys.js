// 🧩 CFC-SYNC — Claves oficiales de sesión CFC
// Archivo: /frontend/js/cfc_session_keys.js
// Versión: V1.0
// Autor: CFC
// Descripción: Define claves oficiales y reglas base del MSCU V1.

// ------------------------------------------------------------
// CLAVE OFICIAL DEL MSCU V1
// ------------------------------------------------------------

window.CFC_SESSION_KEY = "cfc_session";

// ------------------------------------------------------------
// REGLAS BASE DEL MODELO
// ------------------------------------------------------------

// Expiración oficial: 24 horas (en milisegundos)
window.CFC_SESSION_EXPIRE_MS = 24 * 60 * 60 * 1000; // 24 hs

// Campos obligatorios que debe tener el MSCU V1
window.CFC_SESSION_REQUIRED_FIELDS = [
  "user_id",
  "email",
  "license_valid",
  "render_valid",
  "firestore_valid",
  "device_id",
  "session_token",
  "session_created_at",
  "session_expires_at"
];

// ------------------------------------------------------------
// Helper para validar estructura mínima
// (Luego el guard hará validación profunda)
// ------------------------------------------------------------

window.CFC_SESSION_HAS_MIN_FIELDS = function(sessionObj) {
  if (!sessionObj) return false;
  return window.CFC_SESSION_REQUIRED_FIELDS.every(f => sessionObj.hasOwnProperty(f));
};
