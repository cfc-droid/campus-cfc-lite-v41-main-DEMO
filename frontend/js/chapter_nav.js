/* ==========================================================
✅ CFC_FUNC_9_9_FINAL_V41.21 — Botón “Continuar” estable y visible
📄 Archivo: /frontend/js/chapter_nav.js
🔒 QA-SYNC V10.9 | CFC-SYNC V8.3 — Cristian F. Choqui — 2025-11-06
========================================================== */

(function () {
  const insertNextButton = () => {
    try {
      const match = window.location.pathname.match(/modules\/(\d+)\/cap(\d+)\.html$/);
      if (!match) return false;

      const module = parseInt(match[1]);
      const chapter = parseInt(match[2]);
      const next = chapter + 1;
      const max = 4;

      if (document.querySelector(".next-chapter-btn")) return true;

      const btn = document.createElement("button");
      btn.className = "next-chapter-btn";
      btn.textContent =
        chapter < max ? `Continuar al Capítulo ${next} ▶` : "Ir al Examen Final 🏁";

      Object.assign(btn.style, {
        position: "fixed",
        bottom: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "14px 34px",
        fontWeight: "700",
        fontSize: "1rem",
        color: "#000",
        background: "linear-gradient(90deg,#ffd700,#d4af37)",
        border: "none",
        borderRadius: "12px",
        boxShadow: "0 0 18px rgba(255,215,0,0.55)",
        cursor: "pointer",
        zIndex: "99999",
        transition: "all .25s ease",
      });

      btn.addEventListener("mouseenter", () => {
        btn.style.transform = "translateX(-50%) scale(1.05)";
        btn.style.boxShadow = "0 0 28px rgba(255,215,0,0.8)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translateX(-50%) scale(1)";
        btn.style.boxShadow = "0 0 18px rgba(255,215,0,0.55)";
      });

      btn.addEventListener("click", () => {
        const bell = new Audio("../../media/audio/bell-gold.wav");
        bell.volume = 0.7;
        bell.play().catch(() => {});
        btn.disabled = true;
        btn.innerText = "Cargando... ⚡";
        const dest =
          chapter < max ? `cap${next}.html` : "../../examen/examen.html";
        setTimeout(() => (window.location.href = dest), 900);
      });

      const footer = document.querySelector("footer.firma-cfc");
      if (footer && footer.parentNode) footer.parentNode.insertBefore(btn, footer);
      else document.body.appendChild(btn);

      console.log(
        `🧩 CFC_SYNC checkpoint: Botón “Continuar” visible — módulo ${module}, cap ${chapter}`
      );
      return true;
    } catch (err) {
      console.warn("⚠ chapter_nav.js error:", err);
      return false;
    }
  };

  let t = 0;
  const timer = setInterval(() => {
    if (insertNextButton() || t++ > 33) clearInterval(timer);
  }, 300);
})();
