// ✅ CFC_FUNC_15_SUBPASO_1.3 — Preload de imágenes críticas (25-10-2025)
document.addEventListener("DOMContentLoaded", () => {
  const recursos = [
    "img/logo.png",
    "img/hero.jpg",
    "img/fondo-campus.jpg"
  ];
  recursos.forEach(src => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });
});
