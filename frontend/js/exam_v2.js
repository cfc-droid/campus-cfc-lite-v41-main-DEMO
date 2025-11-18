/* ==========================================================
   ✅ CFC_FUNC_3_7D_V12.5_REAL — EXAM V2 FINAL CELEBRATION (≥75%)
   Integración: Overlay de Graduación + Confeti Dorado + Audio Motivacional
   QA-SYNC V12.5 REAL — 2025-11-06
========================================================== */

console.log("🧩 CFC_SYNC checkpoint: exam_v2.js — QA-SYNC V12.5 activo", new Date().toLocaleString());

let examStartTime = Date.now(); // ⏱ Inicio del examen

function enviarExamen() {
  try {
    const preguntas = document.querySelectorAll("fieldset");
    let correctas = 0;
    let errores = [];

    preguntas.forEach((pregunta, index) => {
      const seleccionada = pregunta.querySelector("input[type='radio']:checked");
      const comentario = pregunta.innerHTML.match(/<!-- Correcta:\s*([A-D]) -->/);
      const correcta = comentario ? comentario[1] : null;

      if (seleccionada) {
        if (seleccionada.value === correcta) {
          correctas++;
        } else {
          const textoPregunta = pregunta.querySelector("legend")?.textContent.trim() || `Pregunta ${index + 1}`;
          const textoRespuesta = seleccionada.parentElement.textContent.trim();
          errores.push(`${textoPregunta}\n❌ Respuesta marcada: ${textoRespuesta}`);
        }
      } else if (correcta) {
        const textoPregunta = pregunta.querySelector("legend")?.textContent.trim() || `Pregunta ${index + 1}`;
        errores.push(`${textoPregunta}\n⚠️ Sin respuesta seleccionada.`);
      }
    });

    const total = preguntas.length;
    const porcentaje = (correctas / total) * 100;
    const aprobado = porcentaje >= 75;
    const duracionSegundos = Math.floor((Date.now() - examStartTime) / 1000);
    const modulo = parseInt(document.body.dataset.module || 0);

    const resultado = {
      moduleNumber: modulo,
      correctas,
      total,
      porcentaje,
      aprobado,
      errores,
      duracionSegundos,
      timestamp: new Date().toISOString(),
      passed: aprobado
    };

    localStorage.setItem("examResult", JSON.stringify(resultado));
    guardarResultadoLocal(correctas, total, errores, duracionSegundos);

    const evento = new CustomEvent("examCompleted", { detail: resultado });
    window.dispatchEvent(evento);

    const mensaje = aprobado
      ? `🎯 ¡Aprobado! Obtuviste ${correctas}/${total} (${porcentaje.toFixed(0)}%).`
      : `❌ No aprobado. Obtuviste ${correctas}/${total} (${porcentaje.toFixed(0)}%).`;
    alert(mensaje);

    const successSound = new Audio("../../sounds/success.wav");
    const errorSound = new Audio("../../sounds/error.wav");
    const snd = aprobado ? successSound : errorSound;
    snd.volume = 0.6;
    snd.play().catch(() => console.warn("🔇 Reproducción bloqueada por navegador."));

    /* 🎓 ACTIVACIÓN AUTOMÁTICA — GRADUACIÓN CFC V41.1 CELEBRATION */
    if (aprobado && modulo === 20) {
      console.log("🎓 CFC_SYNC checkpoint: Examen final aprobado ≥75% — Activando Overlay de Graduación");
      if (typeof activarGraduacionCFC === "function") activarGraduacionCFC();
      lanzarConfetiDorado();
      return; // evita redirección inmediata
    }

    if (aprobado) {
      setTimeout(() => {
        window.location.href = "../../modules/index.html";
      }, 1500);
    }
  } catch (err) {
    console.error("⚠️ CFC_SYNC → Error general en enviarExamen():", err);
    alert("⚠️ Hubo un problema al procesar el examen. Reintentá nuevamente.");
  }
}

/* ==========================================================
   ✅ Guardado avanzado local (con timestamp y backup)
========================================================== */
function guardarResultadoLocal(score, total, errores, duracionSegundos) {
  try {
    const moduleTitle = document.querySelector("h1,h2")?.textContent.trim() || "Módulo desconocido";
    const examResults = JSON.parse(localStorage.getItem("examResults")) || [];

    // 🧹 Eliminar versiones previas del mismo módulo
    const filtrado = examResults.filter(r => r.module !== moduleTitle);

    const nuevoRegistro = {
      module: moduleTitle,
      attempts: (examResults.find(r => r.module === moduleTitle)?.attempts || 0) + 1,
      date: new Date().toLocaleDateString("es-AR"),
      time: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      score: Math.round((score / total) * 100),
      status: (score / total) >= 0.75 ? "✅ Aprobado" : "❌ Reprobado",
      duration: `${(duracionSegundos / 60).toFixed(1)} min`,
      error: errores?.length ? errores.join(" | ") : "-",
      timestamp: Date.now()
    };

    // Insertar primero (más reciente arriba)
    filtrado.unshift(nuevoRegistro);

    // 🧭 Guardar y crear copia de respaldo
    localStorage.setItem("examResults", JSON.stringify(filtrado));
    localStorage.setItem("examResults_backup", JSON.stringify(filtrado));

    console.log("🧩 CFC_SYNC checkpoint: Resultado actualizado y reordenado correctamente", nuevoRegistro);
  } catch (err) {
    console.error("❌ Error al guardar resultado en localStorage:", err);
  }
}

/* ==========================================================
   🎊 FUNCIÓN: CONFETI DORADO CELEBRATION — V41.1
========================================================== */
function lanzarConfetiDorado() {
  const canvas = document.createElement("canvas");
  canvas.id = "confeti-cfc";
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const confetis = [];
  const colores = ["#d4af37", "#ffd700", "#fff3b0"];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < 150; i++) {
    confetis.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 50,
      color: colores[Math.floor(Math.random() * colores.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetis.forEach(c => {
      ctx.beginPath();
      ctx.lineWidth = c.r / 2;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 5);
      ctx.stroke();
    });
    update();
  }

  function update() {
    confetis.forEach(c => {
      c.tiltAngle += c.tiltAngleIncremental;
      c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
      c.x += Math.sin(c.d);
      c.tilt = Math.sin(c.tiltAngle - c.d / 3) * 15;
    });
  }

  let anim;
  function loop() {
    draw();
    anim = requestAnimationFrame(loop);
  }
  loop();

  setTimeout(() => {
    cancelAnimationFrame(anim);
    canvas.remove();
    console.log("🎊 CFC_SYNC checkpoint: Confeti dorado finalizado — V41.1 CELEBRATION");
  }, 8000);
}

/* ==========================================================
   Protección QA-SYNC doble declaración
========================================================== */
try {
  if (window._cfc_enviarExamen && typeof _cfc_enviarExamen === "function") {
    console.log("🧩 CFC_SYNC FIX: _cfc_enviarExamen ya existe, omitiendo redeclaración.");
  } else {
    window._cfc_enviarExamen = enviarExamen;
    console.log("🧩 CFC_SYNC FIX: función enviarExamen registrada globalmente.");
  }
} catch (err) {
  console.warn("🧩 CFC_SYNC FIX: control preventivo aplicado.", err);
}

console.log("🧩 CFC_SYNC checkpoint FINAL — QA-SYNC V12.5 REAL CELEBRATION", new Date().toLocaleString());
