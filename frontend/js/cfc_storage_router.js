(function () {

  function resolveUserKey() {
    try {
      const raw = localStorage.getItem("CFC_SESSION");
      if (!raw) return "guest_";

      const session = JSON.parse(raw);
      if (!session.session_user_email) return "guest_";

      return session.session_user_email
        .replace(/[^a-zA-Z0-9]/g, "_") + "_";

    } catch (e) {
      return "guest_";
    }
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

  console.log(
    "🔐 CFC_STORAGE_ROUTER_ACTIVO — aislamiento por session_user_email"
  );

})();
