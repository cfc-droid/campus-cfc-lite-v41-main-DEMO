(function() {

  // =====================================================
  // 🔧 FIX CRÍTICO V41 — leer email REAL sin router activo
  // =====================================================
  const rawGet = Storage.prototype.getItem;
  const email = rawGet.call(localStorage, "CFC_EMAIL") || "guest";
  const USER_KEY = email.replace(/[^a-zA-Z0-9]/g, "_") + "_";

  // =====================================================
  // 🔒 Router REAL por usuario (aislamiento correcto)
  // =====================================================
  const originalSet = Storage.prototype.setItem;
  const originalGet = Storage.prototype.getItem;
  const originalRemove = Storage.prototype.removeItem;

  Storage.prototype.setItem = function(key, value) {
    return originalSet.call(this, USER_KEY + key, value);
  };

  Storage.prototype.getItem = function(key) {
    return originalGet.call(this, USER_KEY + key);
  };

  Storage.prototype.removeItem = function(key) {
    return originalRemove.call(this, USER_KEY + key);
  };

  console.log("🔐 CFC_STORAGE_ROUTER_ACTIVO — aislamiento real por usuario:", USER_KEY);

})();
