// ===============================================================
// 🧩 CFC-SYNC — Modelo oficial de Sesión (MSCU V1 — FINAL 2025)
// Archivo: /frontend/js/cfc_session_model.js
// Versión: V1.5 — Compatible con CFC_LOCK_IDENTITY_V72
// Autor: Cristian F. Choqui (CFC)
// ===============================================================

// ------------------------------------------------------------
// ESTRUCTURA OFICIAL MSCU V1
// ------------------------------------------------------------
window.CFC_EMPTY_SESSION = function () {
  return {
    user_id: "",
    email: "",
    device_id: "",
    session_token: "",
    license_valid: false,
    firestore_valid: false,
    render_valid: false,
    created_at: 0,
    expires_at: 0,
  };
};

// ------------------------------------------------------------
// CREAR SESIÓN VACÍA
// ------------------------------------------------------------
window.CFC_CREATE_EMPTY_SESSION = function () {
  const empty = window.CFC_EMPTY_SESSION();
  console.log("🧩 MSCU V1 — Sesión inicial:", empty);
  return empty;
};

// ------------------------------------------------------------
// LEER SESIÓN DESDE localStorage (CLAVE OFICIAL 2025)
// ------------------------------------------------------------
window.CFC_GET_SESSION = function () {
  const raw = localStorage.getItem("CFC_SESSION");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("⚠️ MSCU V1 — Sesión corrupta");
    return null;
  }
};

// ------------------------------------------------------------
// GUARDAR SESIÓN (CLAVE OFICIAL 2025)
// ------------------------------------------------------------
window.CFC_SAVE_SESSION = function (sessionObj) {
  if (!sessionObj) return;
  localStorage.setItem("CFC_SESSION", JSON.stringify(sessionObj));
  console.log("💾 MSCU V1 — Sesión guardada:", sessionObj);
};

// ------------------------------------------------------------
// BORRAR SESIÓN
// ------------------------------------------------------------
window.CFC_CLEAR_SESSION = function () {
  localStorage.removeItem("CFC_SESSION");
  console.log("🗑️ MSCU V1 — Sesión eliminada");
};

// ------------------------------------------------------------
// CREAR EXPIRACIÓN (24 HS)
// ------------------------------------------------------------
window.CFC_BUILD_EXPIRATION = function () {
  const now = Date.now();
  return {
    created_at: now,
    expires_at: now + 1000 * 60 * 60 * 24,
  };
};

// ------------------------------------------------------------
// APLICAR EXPIRACIÓN A LA SESIÓN
// ------------------------------------------------------------
window.CFC_APPLY_EXPIRATION = function (sessionObj) {
  if (!sessionObj) return sessionObj;
  const exp = window.CFC_BUILD_EXPIRATION();
  sessionObj.created_at = exp.created_at;
  sessionObj.expires_at = exp.expires_at;
  console.log("⏳ MSCU V1 — Expiración aplicada:", exp);
  return sessionObj;
};
