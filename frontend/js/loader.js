/* ============================================================
   ✅ CFC_FUNC_1_1_6_V41.6 — Intro Splash Integrado + Fade 5s
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const frases = [
    "El control es la verdadera libertad 🧠",
    "El mercado premia la paciencia 🕰️",
    "Disciplina hoy, libertad mañana 💰",
    "Ganá cuando mantenés la calma en el caos 🌙"
  ];

  const phrase = document.getElementById("splash-phrase");
  if (phrase) phrase.textContent = frases[Math.floor(Math.random() * frases.length)];

  const splash = document.getElementById("intro-splash");
  const btn = document.getElementById("enterSplash");

  const cerrarSplash = () => {
    if (!splash) return;
    splash.classList.add("fade-out");
    setTimeout(() => splash.remove(), 1000); // Fade-out 1s
  };

  // 🔹 Redirección visual automática (4s visibles + 1s fade)
  setTimeout(cerrarSplash, 5000);

  // 🔹 Opción manual
  if (btn) btn.addEventListener("click", cerrarSplash);

  console.log("🧩 CFC_SYNC checkpoint:", "Intro Splash activo | Fade 5s", new Date().toLocaleString());
});
