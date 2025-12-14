document.querySelectorAll('.faq-item h3').forEach(h => {
  h.addEventListener('click', () => {
    h.nextElementSibling.classList.toggle('visible');
  });
});

// 🔒 CFC-SYNC
// ✅ CFC_FUNC_6_2_20251029 — FAQ interactivo funcional
/* ARCHIVO ANTERIOR — versión 20251029 — reemplazado por CFC_FUNC_6_2_20251029 */
console.log("🧩 CFC_SYNC checkpoint:", "faqBot.js", "Punto 6.2 actualizado", new Date().toLocaleString());
