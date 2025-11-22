// 🛡️ SESSION GUARD CFC V1.0
// Archivo: /frontend/js/cfc_guard.js
// Versión: V1.0
// Autor: CFC
// Descripción: Guardián global que protege cada página del Campus.

// IIFE para no ensuciar el ámbito global
(function CFC_SESSION_GUARD_V1() {
  try {
    const path = window.location.pathname || "";

    // ----------------------------------------------------------
    // 1) Páginas excluidas del guard
    //    - login.html
    //    - blocked.html
    // ----------------------------------------------------------
    const isLogin =
      path.endsWith("/login.html") ||
      path.includes("/html/login.html");

    const isBlocked =
      path.endsWith("/blocked.html") ||
      path.includes("/blocked.html");

    if (isLogin || isBlocked) {
      console.log("🛡️ CFC-GUARD: página excluida del guard:", path);
      return;
    }

    // ----------------------------------------------------------
    // 2) Resolver ruta correcta de login según carpeta
    // ----------------------------------------------------------
    function CFC_GUARD_GET_LOGIN_URL() {
      if (path.includes("/modules/")) {
        // Ej: /frontend/modules/1/cap1.html
        return "../../html/login.html";
      }
      if (
        path.includes("/html/") ||
        path.includes("/pages/") ||
        path.includes("/out/")
      ) {
        // Ej: /frontend/html/..., /frontend/pages/..., /frontend/out/...
        return "../html/login.html";
      }
      // Raíz /frontend/index.html u otros HTML en /frontend
      return "html/login.html";
    }

    // ----------------------------------------------------------
    // 3) Validar la sesión usando el validador oficial
    // ----------------------------------------------------------
    let isValid = false;

    if (typeof window.CFC_VALIDATE_FULL_SESSION === "function") {
      // Uso del validador MSCU V1
      isValid = window.CFC_VALIDATE_FULL_SESSION();
    } else {
      // Fallback mínimo por si el validador no está disponible
      console.warn("⚠️ CFC-GUARD: CFC_VALIDATE_FULL_SESSION no existe, usando validación mínima.");
      const session =
        typeof window.CFC_GET_SESSION === "function"
          ? window.CFC_GET_SESSION()
          : null;

      if (!session) {
        isValid = false;
      } else {
        const now = Date.now();

        const hasFields =
          session.user_id &&
          session.email &&
          session.device_id &&
          session.session_token &&
          typeof session.session_expires_at === "number";

        const notExpired = now < session.session_expires_at;
        const localDid = localStorage.getItem("CFC_DEVICE_ID");
        const deviceOK = localDid && session.device_id === localDid;
        const flagsOK =
          session.license_valid === true &&
          session.render_valid === true &&
          session.firestore_valid === true;

        isValid = !!(hasFields && notExpired && deviceOK && flagsOK);
      }
    }

    // ----------------------------------------------------------
    // 4) Si la sesión NO es válida → redirigir a login
    // ----------------------------------------------------------
    if (!isValid) {
      const loginUrl = CFC_GUARD_GET_LOGIN_URL();
      console.warn(
        "🛡️ CFC-GUARD: sesión inválida o ausente. Redirigiendo a:",
        loginUrl
      );
      window.location.href = loginUrl;
      return;
    }

    // ----------------------------------------------------------
    // 5) Sesión válida → permitir acceso
    // ----------------------------------------------------------
    console.log("🛡️ CFC-GUARD: sesión validada ✔");

  } catch (e) {
    console.error("❌ CFC-GUARD ERROR:", e);

    // En caso de error grave, intentar fallback a login con ruta segura
    try {
      const p = window.location.pathname || "";
      let loginFallback;

      if (p.includes("/modules/")) {
        loginFallback = "../../html/login.html";
      } else if (
        p.includes("/html/") ||
        p.includes("/pages/") ||
        p.includes("/out/")
      ) {
        loginFallback = "../html/login.html";
      } else {
        loginFallback = "html/login.html";
      }

      window.location.href = loginFallback;
    } catch (_) {
      // Si incluso el fallback falla, no hacemos más nada para evitar loops.
    }
  }
})();
