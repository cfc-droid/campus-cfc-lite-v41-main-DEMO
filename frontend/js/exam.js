/**
 * Exam Engine CFC LITE V40 — con sonidos, historial y progreso
 */
(function examCFC() {
  // Obtener número de módulo desde la URL
  function getModuleNumber() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('modules');
    if (idx >= 0 && parts[idx + 1]) return parseInt(parts[idx + 1], 10) || 1;
    return 1;
  }

  // Producir sonidos (WAV)
  function playSound(ok) {
    try {
      const src = ok ? '/sounds/success.wav' : '/sounds/error.wav';
      const audio = new Audio(src);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  // Guardar historial local
  function saveHistory(mod, score) {
    const attkey = `mod${mod}_attempts`;
    const attempts = (parseInt(localStorage.getItem(attkey)) || 0) + 1;
    localStorage.setItem(attkey, String(attempts));
    localStorage.setItem(`mod${mod}_score`, String(score));
    const ts = new Date().toISOString();
    localStorage.setItem(`mod${mod}_ts`, ts);

    let hist = [];
    try {
      const raw = localStorage.getItem('cfc_history');
      if (raw) hist = JSON.parse(raw);
    } catch (e) {}

    const row = { mod, score, attempts, ts };
    const i = hist.findIndex((h) => h.mod === mod);
    if (i >= 0) hist[i] = row; else hist.push(row);
    localStorage.setItem('cfc_history', JSON.stringify(hist));
  }

  // Desbloquear siguiente módulo
  function maybeUnlockNext(mod, score) {
    if (score >= 3) {
      const next = mod + 1;
      if (next <= 20) localStorage.setItem(`mod${next}_unlocked`, 'true');
    }
  }

  // Recalcular progreso
  function recalcProgress() {
    let passed = 0;
    for (let i = 1; i <= 20; i++) {
      const sc = parseInt(localStorage.getItem(`mod${i}_score`) || '0', 10);
      if (sc >= 3) passed++;
    }
    const pct = Math.round((passed / 20) * 100);
    localStorage.setItem('cfc_progress_pct', String(pct));

    const bar = document.getElementById('cfc-progress-bar');
    const txt = document.getElementById('cfc-progress-text');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.innerText = pct + '% completado';
  }

  // Calificar examen
  window.gradeExam = function gradeExam() {
    const form = document.getElementById('exam1');
    if (!form) return false;

    const answers = {
      q1: form.querySelector('input[name="q1"]:checked')?.value,
      q2: form.querySelector('input[name="q2"]:checked')?.value,
      q3: form.querySelector('input[name="q3"]:checked')?.value,
      q4: form.querySelector('input[name="q4"]:checked')?.value,
    };

    const key = { q1: 'a', q2: 'b', q3: 'b', q4: 'b' };

    Object.keys(key).forEach((q) => {
      const fieldset = form.querySelector(`[name="${q}"]`)?.closest('fieldset');
      if (fieldset) {
        const chosen = answers[q];
        const ok = chosen === key[q];
        fieldset.style.border = ok ? '1px solid #4ad399' : '1px solid #ef4444';
        fieldset.style.background = ok ? '#052a04' : '#220000';
      }
    });

    let score = 0;
    Object.keys(key).forEach((q) => { if (answers[q] === key[q]) score++; });

    const mod = getModuleNumber();
    saveHistory(mod, score);
    maybeUnlockNext(mod, score);
    recalcProgress();

    const msg = document.querySelector('.cfc-exam-msg');
    if (msg) {
      if (score >= 3) {
        msg.textContent = '✅ ¡Aprobaste este módulo! Se desbloqueó el siguiente.';
        playSound(true);
      } else {
        msg.textContent = '❌ Te faltó. Repetí el examen hasta lograr al menos 3/4.';
        playSound(false);
      }
    }

    return false;
  };
})();

/* =========================================================
   🟣 SUBPASO 5.10 — Registrar MÓDULO ACTUAL AUTOMÁTICO AL APROBAR  
   🔥 CFC_STATS_V6.0_SUBPASO_5.10_REAL_B — 2025-12-10
========================================================= */
(function () {
  try {

    const msgBox = document.querySelector('.cfc-exam-msg');
    if (!msgBox) return;

    const observer = new MutationObserver(() => {
      const text = msgBox.textContent || "";
      if (!text.includes("Aprobaste")) return;

      const parts = window.location.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('modules');
      if (idx < 0 || !parts[idx + 1]) return;

      const approvedModuleNumber = parseInt(parts[idx + 1], 10);
      const nextModuleNumber = approvedModuleNumber + 1;

      const CFC_MODULES_FULL = {
        1:"Módulo 1 – Introducción a la Psicología del Trader",
        2:"Módulo 2 – Neurociencia del Trading",
        3:"Módulo 3 – Fundamentos de Psicología Profunda",
        4:"Módulo 4 – Modelo Mental del Trader Profesional",
        5:"Módulo 5 – Herramientas Avanzadas de Regulación Emocional",
        6:"Módulo 6 – Psicología de la Gestión del Capital",
        7:"Módulo 7 – Estrategias Psicológicas por Etapas",
        8:"Módulo 8 – Integración Estrategia–Psicología",
        9:"Módulo 9 – Casos de Estudio y Simulaciones Reales",
        10:"Módulo 10 – Optimización Mental y Rendimiento Peak",
        11:"Módulo 11 – Ecosistema de Apoyo y Herramientas",
        12:"Módulo 12 – Maestría Continua y Legado",
        13:"Módulo 13 – Psicología del Error y Reprogramación Mental",
        14:"Módulo 14 – El Mapa del Autocontrol Extremo",
        15:"Módulo 15 – Arquitectura del Trading Mental Automático",
        16:"Módulo 16 – Reversión Psicológica y Superación del Burnout",
        17:"Módulo 17 – Psicología del Trader de Alto Impacto",
        18:"Módulo 18 – La Mentalidad del Mentor Trader",
        19:"Módulo 19 – Integración Total Cuerpo–Mente–Mercado",
        20:"Módulo 20 – Legado Final del Trader Consciente"
      };

      let stats = {};
      try { stats = JSON.parse(localStorage.getItem("CFC_stats") || "{}"); } catch {}

      if (CFC_MODULES_FULL[nextModuleNumber]) {
        stats.currentModule = CFC_MODULES_FULL[nextModuleNumber];
      } else {
        stats.currentModule = CFC_MODULES_FULL[approvedModuleNumber];
      }

      localStorage.setItem("CFC_stats", JSON.stringify(stats));

      console.log("📌 SUBPASO 5.10 → currentModule:", stats.currentModule);
    });

    observer.observe(msgBox, { childList: true, subtree: true });

  } catch (err) {
    console.error("❌ Error SUBPASO 5.10_B:", err);
  }
})();

/* =========================================================
   🟣 SUBPASO 5.11 — Registrar MÓDULOS COMPLETADOS (OPCIÓN C)
   🔥 CFC_STATS_V6.0_SUBPASO_5.11_REAL — 2025-12-10
   ---------------------------------------------------------
   ✔ Cuenta todos los módulos aprobados (sin importar orden)
   ✔ lastCompletedModule = módulo aprobado MÁS ALTO
   ✔ Compatible con tu lógica 4.10 y 5.10 (NO pisado)
   ✔ No rompe nada del examen ni del Campus
========================================================= */

(function () {
  try {

    const msgBox = document.querySelector('.cfc-exam-msg');
    if (!msgBox) return;

    const observer = new MutationObserver(() => {
      const text = msgBox.textContent || "";
      if (!text.includes("Aprobaste")) return;

      // Cargar stats
      let stats = {};
      try { stats = JSON.parse(localStorage.getItem("CFC_stats") || "{}"); } catch {}

      const MODULES_FULL = {
        1:"Módulo 1 – Introducción a la Psicología del Trader",
        2:"Módulo 2 – Neurociencia del Trading",
        3:"Módulo 3 – Fundamentos de Psicología Profunda",
        4:"Módulo 4 – Modelo Mental del Trader Profesional",
        5:"Módulo 5 – Herramientas Avanzadas de Regulación Emocional",
        6:"Módulo 6 – Psicología de la Gestión del Capital",
        7:"Módulo 7 – Estrategias Psicológicas por Etapas",
        8:"Módulo 8 – Integración Estrategia–Psicología",
        9:"Módulo 9 – Casos de Estudio y Simulaciones Reales",
        10:"Módulo 10 – Optimización Mental y Rendimiento Peak",
        11:"Módulo 11 – Ecosistema de Apoyo y Herramientas",
        12:"Módulo 12 – Maestría Continua y Legado",
        13:"Módulo 13 – Psicología del Error y Reprogramación Mental",
        14:"Módulo 14 – El Mapa del Autocontrol Extremo",
        15:"Módulo 15 – Arquitectura del Trading Mental Automático",
        16:"Módulo 16 – Reversión Psicológica y Superación del Burnout",
        17:"Módulo 17 – Psicología del Trader de Alto Impacto",
        18:"Módulo 18 – La Mentalidad del Mentor Trader",
        19:"Módulo 19 – Integración Total Cuerpo–Mente–Mercado",
        20:"Módulo 20 – Legado Final del Trader Consciente"
      };

      // 📌 Detectar módulo aprobado actual
      const parts = window.location.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('modules');
      if (idx < 0 || !parts[idx + 1]) return;
      const approvedModule = parseInt(parts[idx + 1], 10);

      // 📌 Contar cuántos módulos aprobados existen
      let count = 0;
      let highest = 0;

      for (let i = 1; i <= 20; i++) {
        const sc = parseInt(localStorage.getItem(`mod${i}_score`) || "0", 10);
        if (sc >= 3) {
          count++;
          if (i > highest) highest = i;
        }
      }

      // Actualizar stats
      stats.modulesCompleted = count;
      stats.lastCompletedModule = MODULES_FULL[highest] || `Módulo ${highest}`;

      localStorage.setItem("CFC_stats", JSON.stringify(stats));

      console.log(`📌 SUBPASO 5.11 → lastCompletedModule: ${stats.lastCompletedModule}`);
      console.log(`📌 SUBPASO 5.11 → modulesCompleted: ${stats.modulesCompleted}`);

    });

    observer.observe(msgBox, { childList: true, subtree: true });

  } catch (err) {
    console.error("❌ Error SUBPASO 5.11:", err);
  }
})();
