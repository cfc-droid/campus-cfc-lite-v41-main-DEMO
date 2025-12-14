/* ==========================================================
✅ CFC_FUNC_3_2_EXAM_V10.6_FINAL — Fix global + guardado + compatibilidad exam1
📄 Archivo: /frontend/js/exam-logic_v2.js
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // 🔍 Localizar formulario (exam1, exam2, etc.)
  const examForm =
    document.querySelector("#exam-form") ||
    document.querySelector("form[id^='exam']");

  if (!examForm) {
    console.warn("⚠️ No se encontró el formulario del examen — QA-SYNC V10.6");
    return;
  }

  // 🎧 Sonidos
  const successSound = new Audio("../../sounds/success.wav");
  const errorSound = new Audio("../../sounds/error.wav");
  successSound.volume = 0.6;
  errorSound.volume = 0.6;

  // 🔊 Desbloqueo de audio
  document.body.addEventListener(
    "click",
    () => {
      [successSound, errorSound].forEach((snd) => {
        snd.play().then(() => {
          snd.pause();
          snd.currentTime = 0;
        }).catch(()=>{});
      });
      console.log("🧩 AudioContext habilitado — QA-SYNC V10.6");
    },
    { once: true }
  );

  /* ==========================================================
     📘 FUNCIÓN PRINCIPAL — envío de examen
     ========================================================== */
  function sendExam() {
    const formData = new FormData(examForm);
    let total = 0,
      correctas = 0;

    formData.forEach((value, key) => {
      total++;
      const correcta = document.querySelector(
        `input[name="${key}"][data-correct="true"]`
      );
      if (correcta && correcta.value === value) correctas++;
    });

    const score = Math.round((correctas / total) * 100);
    const passed = score >= 70;
    const msg = passed
      ? `✅ ¡Aprobado! Obtuviste ${correctas}/${total} (${score}%).`
      : `❌ Reprobado. Obtuviste ${correctas}/${total} (${score}%).`;

    alert(msg);

    // 🎵 Sonido
    setTimeout(() => {
      const snd = passed ? successSound : errorSound;
      snd.currentTime = 0;
      snd.play().catch(()=>{});
    }, 300);

    // 🧠 CFC SYNC — progreso global
    const moduleNumber = parseInt(
      document.body.dataset.module ||
        localStorage.getItem("currentModule") ||
        1
    );

    window.dispatchEvent(
      new CustomEvent("examCompleted", {
        detail: { moduleNumber, score, passed },
      })
    );

    if (typeof showMotivationModal === "function") showMotivationModal(passed);

    localStorage.setItem(
      `module${moduleNumber}_passed`,
      passed ? "true" : "false"
    );

    if (passed) {
      localStorage.setItem(`mod${moduleNumber + 1}_unlocked`, "true");
      const modules = JSON.parse(
        localStorage.getItem("completedModules") || "[]"
      );
      if (!modules.includes(moduleNumber)) {
        modules.push(moduleNumber);
        localStorage.setItem("completedModules", JSON.stringify(modules));
      }
    }

    /* ==========================================================
       🧾 HISTORIAL DE EXÁMENES — Guardado local
       ========================================================== */
    try {
      const examResults = JSON.parse(localStorage.getItem("examResults")) || [];
      const moduleName = `Módulo ${moduleNumber}`;
      const date = new Date().toLocaleDateString("es-AR");

      // Eliminar duplicados
      const filtered = examResults.filter((r) => r.module !== moduleName);

      filtered.push({
        module: moduleName,
        date,
        score,
        status: passed ? "✅ Aprobado" : "❌ Reprobado",
      });

      localStorage.setItem("examResults", JSON.stringify(filtered));
      console.log(
        "🧩 CFC_SYNC checkpoint: historial actualizado — QA-SYNC V10.6",
        filtered
      );
    } catch (err) {
      console.error("❌ Error guardando historial:", err);
    }
  }

  /* ==========================================================
     🔗 ENLACE DEL BOTÓN — compatibilidad total
     ========================================================== */
  const btn =
    document.querySelector("button[onclick='enviarExamen()']") ||
    document.querySelector("button[onclick='sendExam()']");

  if (btn) {
    btn.addEventListener("click", sendExam);
    console.log("🧩 CFC_SYNC checkpoint: botón vinculado — QA-SYNC V10.6");
  }

  // 🔄 Exportar función al ámbito global (para onclick directo)
  window.enviarExamen = sendExam;
});
