// 🧩 CFC-SYNC — Modelo de Sesión CFC (MSCU V1)
// Archivo: /frontend/js/cfc_session_model.js
// Versión: V1.1
// Autor: CFC
// Descripción: Define la estructura base, expiración y helpers para la sesión CFC.

// ------------------------------------------------------------
// ESTRUCTURA OFICIAL MSCU V1
// ------------------------------------------------------------

window.CFC_EMPTY_SESSION = function() {
  return {
    user_id: "",
    email: "",
    license_valid: false,
    render_valid: false,
    firestore_valid: false,
    device_id: "",
    session_token: "",
    session_created_at: 0,
    session_expires_at: 0
  };
};

// ------------------------------------------------------------
// CREAR SESIÓN VACÍA (INICIAL)
// ------------------------------------------------------------

window.CFC_CREATE_EMPTY_SESSION = function() {
  const empty = window.CFC_EMPTY_SESSION();
  console.log("🧩 MSCU V1 — Sesión inicial creada:", empty);
  return empty;
};

// ------------------------------------------------------------
// LEER SESIÓN DESDE localStorage
// ------------------------------------------------------------

window.CFC_GET_SESSION = function() {
  const raw = localStorage.getItem("cfc_session");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("⚠️ MSCU V1 — Sesión corrupta, se devolverá null.");
    return null;
  }
};

// ------------------------------------------------------------
// GUARDAR SESIÓN EN localStorage
// ------------------------------------------------------------

window.CFC_SAVE_SESSION = function(sessionObj) {
  if (!sessionObj) return;

  localStorage.setItem("cfc_session", JSON.stringify(sessionObj));
  console.log("💾 MSCU V1 — Sesión guardada:", sessionObj);
};

// ------------------------------------------------------------
// BORRAR SESIÓN (base, luego logout la expandirá)
// ------------------------------------------------------------

window.CFC_CLEAR_SESSION = function() {
  localStorage.removeItem("cfc_session");
  console.log("🗑️ MSCU V1 — Sesión eliminada.");
};

// ------------------------------------------------------------
// GENERAR EXPIRACIÓN (24 HS DESDE AHORA)
// ------------------------------------------------------------

window.CFC_BUILD_EXPIRATION = function() {
  const now = Date.now();
  return {
    created: now,
    expires: now + window.CFC_SESSION_EXPIRE_MS
  };
};

// ------------------------------------------------------------
// APLICAR EXPIRACIÓN A UN OBJETO DE SESIÓN MSCU V1
// ------------------------------------------------------------

window.CFC_APPLY_EXPIRATION = function(sessionObj) {
  if (!sessionObj) return sessionObj;

  const exp = window.CFC_BUILD_EXPIRATION();
  sessionObj.session_created_at = exp.created;
  sessionObj.session_expires_at = exp.expires;

  console.log("⏳ MSCU V1 — Expiración aplicada:", exp);
  return sessionObj;
};
