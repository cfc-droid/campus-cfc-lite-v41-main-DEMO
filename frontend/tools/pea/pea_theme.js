/* PEA Theme — global y persistente */
(function () {
  const KEY = "PEA_THEME";

  function apply(mode) {
    const dark = mode === "dark";
    document.documentElement.classList.toggle("pea-dark", dark);
    localStorage.setItem(KEY, dark ? "dark" : "light");
  }

  // expuesto para el botón
  window.peaToggleTheme = function () {
    const cur = localStorage.getItem(KEY) || "light";
    apply(cur === "dark" ? "light" : "dark");
  };

  // al cargar cada página, aplica el tema guardado
  apply(localStorage.getItem(KEY) || "light");
})();
