/* ==========================================================
🔐 CFC_STORAGE_ROUTER_V2_REAL_DYNAMIC
----------------------------------------------------------
• NO usa "guest"
• Espera a que exista CFC_EMAIL
• Aislamiento real por usuario
• Compatible con TODO el campus
========================================================== */

(function () {

  const originalSet = localStorage.setItem.bind(localStorage);
  const originalGet = localStorage.getItem.bind(localStorage);
  const originalRemove = localStorage.removeItem.bind(localStorage);

  function getUserPrefix() {
    const email = originalGet("CFC_EMAIL");
    if (!email) return null;
    return email.replace(/[^a-zA-Z0-9]/g, "_") + "_";
  }

  localStorage.setItem = function (key, value) {
    const prefix = getUserPrefix();
    if (!prefix) {
      return originalSet(key, value);
    }
    return originalSet(prefix + key, value);
  };

  localStorage.getItem = function (key) {
    const prefix = getUserPrefix();
    if (!prefix) {
      return originalGet(key);
    }
    return originalGet(prefix + key);
  };

  localStorage.removeItem = function (key) {
    const prefix = getUserPrefix();
    if (!prefix) {
      return originalRemove(key);
    }
    return originalRemove(prefix + key);
  };

  console.log("🔐 CFC_STORAGE_ROUTER_V2 activo — aislamiento dinámico por usuario");

})();
