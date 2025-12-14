(function() {

  const email = localStorage.getItem("CFC_EMAIL") || "guest";
  const USER_KEY = email.replace(/[^a-zA-Z0-9]/g, "_") + "_";

  const originalSet = localStorage.setItem;
  const originalGet = localStorage.getItem;
  const originalRemove = localStorage.removeItem;

  localStorage.setItem = function(key, value) {
    return originalSet.call(this, USER_KEY + key, value);
  };

  localStorage.getItem = function(key) {
    return originalGet.call(this, USER_KEY + key);
  };

  localStorage.removeItem = function(key) {
    return originalRemove.call(this, USER_KEY + key);
  };

  console.log("🔐 CFC_STORAGE_ROUTER_ACTIVO — aislamiento total por usuario:", USER_KEY);

})();
