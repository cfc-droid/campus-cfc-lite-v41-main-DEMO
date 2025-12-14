/* ==========================================================
   🔐 CFC_STORAGE_ROUTER_V2_SAFE_LOGIN_AWARE
   • Aislamiento REAL por usuario
   • NO usa "guest"
   • Espera CFC_EMAIL válido
   • Compatible con Campus CFC LITE V41
   ========================================================== */

(function () {

  const originalSet = localStorage.setItem.bind(localStorage);
  const originalGet = localStorage.getItem.bind(localStorage);
  const originalRemove = localStorage.removeItem.bind(localStorage);

  let USER_KEY = null;

  function resolveUserKey() {
    const email = originalGet("CFC_EMAIL");
    if (!email || !email.includes("@")) return null;
    return email.replace(/[^a-zA-Z0-9]/g, "_") + "_";
  }

  function ensureRouterReady() {
    if (USER_KEY) return true;

    const key = resolveUserKey();
    if (!key) return false;

    USER_KEY = key;
    console.log("🔐 CFC_STORAGE_ROUTER ACTIVADO →", USER_KEY);
    return true;
  }

  localStorage.setItem = function (key, value) {
    if (ensureRouterReady()) {
      return originalSet(USER_KEY + key, value);
    }
    return originalSet(key, value);
  };

  localStorage.getItem = function (key) {
    if (ensureRouterReady()) {
      return originalGet(USER_KEY + key);
    }
    return originalGet(key);
  };

  localStorage.removeItem = function (key) {
    if (ensureRouterReady()) {
      return originalRemove(USER_KEY + key);
    }
    return originalRemove(key);
  };

  console.log("🧩 CFC_STORAGE_ROUTER cargado (esperando login)");

})();
