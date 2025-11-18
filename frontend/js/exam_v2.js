document.addEventListener("DOMContentLoaded", () => {

/* ==========================================================
   CFC_FUNC_3_7D_V12.5_REAL — EXAM V2 (DOM FIX)
========================================================== */

console.log("🧩 CFC_SYNC: exam_v2.js FIX — DOMContentLoaded OK");

let examStartTime = Date.now();

function enviarExamen() {
  try {
    const preguntas = document.querySelectorAll("fieldset");
    let correctas = 0;
    let errores = [];

    // --------------------
    // CORRECCIÓN PRINCIPAL
    // --------------------
    if (!preguntas.length) {
      console.warn("❌ El examen no encontró preguntas (DOMContentLoaded FIX evitó error).");
      return;
    }

    preguntas.forEach((pregunta, index) => {
      const seleccionada = pregunta.querySelector("input[type='radio']:checked");
      const comentario = pregunta.innerHTML.match(/<!-- Correcta:\s*([A-D]) -->/);
      const correcta = comentario ? comentario[1] : null;

      if (seleccionada) {
        if (seleccionada.value === correcta) correctas++;
        else {
          const textoPregunta = pregunta.querySelector("legend")?.textContent.trim();
          const textoRespuesta = seleccionada.parentElement.textContent.trim();
          errores.push(`${textoPregunta}\n❌ ${textoRespuesta}`);
        }
      } else if (correcta) {
        errores.push(`Pregunta ${index + 1} sin responder`);
      }
    });

    // -----------------------------
    // GUARDADO Y EVENTO FINAL
    // -----------------------------
    const total = preguntas.length;
    const porcentaje = (correctas / total) * 100;
    const aprobado = porcentaje >= 75;
    const modulo = parseInt(document.body.dataset.module || "0", 10);

    const resultado = {
      moduleNumber: modulo,
      correctas,
      total,
      porcentaje,
      aprobado,
      errores,
      duracionSegundos: Math.floor((Date.now() - examStartTime)/1000),
      timestamp: new Date().toISOString(),
      passed: aprobado
    };

    localStorage.setItem("examResult", JSON.stringify(resultado));
    window.dispatchEvent(new CustomEvent("examCompleted", { detail: resultado }));

    alert(aprobado ? `🎯 Aprobado (${porcentaje.toFixed(0)}%)` : `❌ No aprobado (${porcentaje.toFixed(0)}%)`);

    const snd = new Audio(aprobado ? "../../sounds/success.wav" : "../../sounds/error.wav");
    snd.volume = 0.6;
    snd.play().catch(()=>{});

    if (aprobado && modulo === 20) {
      if (typeof activarGraduacionCFC === "function") activarGraduacionCFC();
      lanzarConfetiDorado();
      return;
    }

    if (aprobado) {
      setTimeout(()=> window.location.href = "../../modules/index.html", 1500);
    }

  } catch (err) {
    console.error("❌ Error examen FIX:", err);
  }
}

window.enviarExamen = enviarExamen;
});
