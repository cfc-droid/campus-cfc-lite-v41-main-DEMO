// ✅ CFC_FUNC_20_1B_GRADUACION_V41_1_CELEBRATION — Overlay + Audio Final
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("graduacion-overlay");
  const cerrarBtn = document.getElementById("cerrarGraduacion");
  const modulo = document.body.getAttribute("data-module");

  // 🎓 Función global invocada desde exam_v2.js
  window.activarGraduacionCFC = function () {
    if (modulo === "20") {
      overlay.classList.remove("oculto");

      // 🎧 1. Audio de éxito inicial
      try {
        const audioSuccess = new Audio("../../assets/audio/success.wav");
        audioSuccess.volume = 0.8;
        audioSuccess.play();
      } catch (e) {
        console.warn("⚠️ Audio success no disponible", e);
      }

      // 🎧 2. Audio motivacional final (voz)
      setTimeout(() => {
        try {
          const mensajeFinal = new Audio("../../assets/audio/final_message.mp3");
          mensajeFinal.volume = 0.9;
          mensajeFinal.play();
          console.log("🎧 CFC_SYNC checkpoint: Audio motivacional final reproducido — V41.1 CELEBRATION");
        } catch (e) {
          console.warn("⚠️ Audio motivacional no disponible", e);
        }
      }, 2500); // se reproduce tras breve pausa para sincronizar con overlay

      console.log("🎓 CFC_SYNC checkpoint: Overlay Graduación + Audio Final activo");
    }
  };

  cerrarBtn?.addEventListener("click", () => {
    overlay.classList.add("oculto");
  });
});
