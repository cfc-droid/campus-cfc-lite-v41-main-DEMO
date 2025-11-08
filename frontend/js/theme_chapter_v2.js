/* =========================================================
   ✅ CFC_FUNC_5_3_FIX_V41.20 — Sistema unificado de tema global (dark/light)
   📄 Archivo: /frontend/js/theme_chapter.js
   🔒 CFC-SYNC V8.9 | QA-SYNC V41.20 (Cloudflare SAFE)
   ========================================================= */

(function () {
  const CFC_ID = "theme-toggle";
  const THEME_KEY = "CFC_THEME_STATE";

  const CFC_STYLE = {
    position: "fixed",
    top: "18px",
    right: "18px",
    borderRadius: "50%",
    width: "44px",
    height: "44px",
    fontSize: "1.2rem",
    fontWeight: "700",
    cursor: "pointer",
    zIndex: "9999",
    transition: "all 0.3s ease",
    border: "2px solid var(--color-accent, #ffd700)",
    boxShadow: "0 0 10px rgba(255,215,0,0.4)",
    backdropFilter: "blur(8px)",
  };

  // 🪶 Aplicar tema global
  function applyTheme(theme, toggle) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);

    document.body.classList.toggle("light-mode", theme === "light");
    document.body.classList.toggle("dark-mode", theme === "dark");

    if (toggle) {
      if (theme === "dark") {
        toggle.textContent = "🌙";
        toggle.style.background = "rgba(255,215,0,0.15)";
        toggle.style.color = "#FFD700";
      } else {
        toggle.textContent = "🌞";
        toggle.style.background = "#FFD700";
        toggle.style.color = "#000";
      }
    }

    console.log(`🎨 CFC_THEME_APPLIED → ${theme}`);
  }

  // 🔘 Crear botón si no existe
  function injectButton() {
    if (document.getElementById(CFC_ID)) return;
    const toggle = document.createElement("button");
    toggle.id = CFC_ID;
    toggle.title = "Cambiar tema claro / oscuro";
    Object.assign(toggle.style, CFC_STYLE);
    document.body.appendChild(toggle);

    let currentTheme = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(currentTheme, toggle);

    toggle.addEventListener("click", () => {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(currentTheme, toggle);
    });

    console.log("✅ CFC_THEME_BUTTON activo:", currentTheme);
  }

  // 🕐 Inicialización segura
  function ensureBodyLoaded() {
    if (document.body) injectButton();
    else setTimeout(ensureBodyLoaded, 120);
  }

  ensureBodyLoaded();

  const observer = new MutationObserver(() => {
    if (!document.getElementById(CFC_ID) && document.body) injectButton();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const preTheme = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(preTheme);
  console.log("🧩 CFC_SYNC checkpoint:", "theme_chapter.js activo en", window.location.pathname);

  // ✅ Función pública para “Cambiar fondo” desde el botón global del Campus
  window.toggleTheme = function() {
    let currentTheme = localStorage.getItem(THEME_KEY) || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme, document.getElementById(CFC_ID));
    console.log("🌗 toggleTheme ejecutado desde botón principal →", newTheme);
  };
})();
