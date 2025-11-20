// 🧩 CFC-SYNC — Constructor oficial de sesión CFC (MSCU V1)
// Archivo: /frontend/js/cfc_session_builder.js
// Versión: V1.1
// Autor: CFC

//-------------------------------------------------------------
// Generar token único (session_token)
//-------------------------------------------------------------
window.CFC_GENERATE_TOKEN = function() {
  return (
    "CFC_" +
    Math.random().toString(36).substring(2) +
    Date.now().toString(36)
  );
};

//-------------------------------------------------------------
// Constructor principal de la sesión (MSCU V1)
// Recibe un objeto base con los campos clave validados por login
//-------------------------------------------------------------
window.CFC_BUILD_SESSION = async function(params) {
  try {
    // 1) Crear estructura vacía MSCU V1
    let session = window.CFC_CREATE_EMPTY_SESSION();

    // 2) Asignar campos obligatorios
    session.user_id = params.user_id || "";
    session.email = params.email || "";
    session.license_valid = !!params.license_valid;
    session.render_valid = !!params.render_valid;
    session.firestore_valid = !!params.firestore_valid;
    session.device_id = params.device_id || "";

    // 3) Generar token único
    session.session_token = window.CFC_GENERATE_TOKEN();

    // 4) Aplicar expiración (24 hs)
    session = window.CFC_APPLY_EXPIRATION(session);

    // 5) Guardar sesión en localStorage
    window.CFC_SAVE_SESSION(session);

    console.log("🎉 CFC_SESSION CREATED — MSCU V1 listo:", session);
    return session;

  } catch (e) {
    console.error("❌ ERROR al construir sesión MSCU V1:", e);
    return null;
  }
};
