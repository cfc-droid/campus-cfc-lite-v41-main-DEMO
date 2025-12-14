(function () {

  function getUserKey() {
    const email = localStorage.getItem("CFC_EMAIL");
    if (!email) return null;
    return email.replace(/[^a-zA-Z0-9]/g, "_") + "_";
  }

  const originalSet = localStorage.setItem;
  const originalGet = localStorage.getItem;
  const originalRemove = localStorage.removeItem;

  localStorage.setItem = function (key, value) {
    const USER_KEY = getUserKey();
    if (!USER_KEY) {
      console.warn("⚠️ CFC_STORAGE_ROUTER: setItem sin CFC_EMAIL, usando key original:", key);
      return originalSet.call(this, key, value);
    }
    return originalSet.call(this, USER_KEY + key, value);
  };

  localStorage.getItem = function (key) {
    const USER_KEY = getUserKey();
    if (!USER_KEY) return originalGet.call(this, key);
    return originalGet.call(this, USER_KEY + key);
  };

  localStorage.removeItem = function (key) {
    const USER_KEY = getUserKey();
    if (!USER_KEY) return originalRemove.call(this, key);
    return originalRemove.call(this, USER_KEY + key);
  };

  console.log("🔐 CFC_STORAGE_ROUTER_ACTIVO — modo seguro por usuario (dinámico)");

})();
