(function () {

  function resolveUserKey() {
    const email = localStorage.getItem("CFC_EMAIL");
    if (!email) return "guest_";
    return email.replace(/[^a-zA-Z0-9]/g, "_") + "_";
  }

  const originalSet = localStorage.setItem.bind(localStorage);
  const originalGet = localStorage.getItem.bind(localStorage);
  const originalRemove = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = function (key, value) {
    const USER_KEY = resolveUserKey();
    return originalSet(USER_KEY + key, value);
  };

  localStorage.getItem = function (key) {
    const USER_KEY = resolveUserKey();
    return originalGet(USER_KEY + key);
  };

  localStorage.removeItem = function (key) {
    const USER_KEY = resolveUserKey();
    return originalRemove(USER_KEY + key);
  };

  console.log("🔐 CFC_STORAGE_ROUTER_ACTIVO — aislamiento dinámico por usuario");

})();
