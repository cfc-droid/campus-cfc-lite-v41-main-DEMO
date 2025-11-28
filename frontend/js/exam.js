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
