document.addEventListener("DOMContentLoaded", () => {

/* ==========================================================
   CFC — PROGRESS V2.1 FULLSYNC FIX (DOM READY)
========================================================== */

console.log("🧩 CFC_SYNC: progress_v2.js FIX — DOMContentLoaded OK");

function ensureProgressData() {
  try {
    const data = localStorage.getItem("progressData");
    if (!data) {
      const base = { completed: [], lastModule: null };
      localStorage.setItem("progressData", JSON.stringify(base));
      return base;
    }
    return JSON.parse(data);
  } catch {
    const reset = { completed: [], lastModule: null };
    localStorage.setItem("progressData", JSON.stringify(reset));
    return reset;
  }
}

let progressData = ensureProgressData();

function updateProgressDisplay() {
  const el = document.getElementById("cfc-progress-text");
  const bar = document.getElementById("cfc-progress-bar");

  const done = progressData.completed.length;
  const percent = Math.floor((done / 20) * 100);

  if (el) el.textContent = `${percent}% completado`;
  if (bar) bar.style.width = `${percent}%`;

  localStorage.setItem("progressPercent", percent);
}

window.addEventListener("examCompleted", (e) => {
  const { moduleNumber, passed } = e.detail || {};
  if (!passed) return;

  const next = Math.min(moduleNumber + 1, 20);
  const currentPath = `/modules/${moduleNumber}/index.html`;

  if (!progressData.completed.includes(currentPath)) {
    progressData.completed.push(currentPath);
    localStorage.setItem("progressData", JSON.stringify(progressData));
  }

  updateProgressDisplay();
});

// Inicializar barra al cargar
updateProgressDisplay();

// Verificación dominio cada 10 s (igual que original)
setInterval(() => {
  if (!window.CFC_DOMAIN_OK) {
    console.warn("CFC-LOCK V72 → Dominio no válido, expulsando");
    window.location.href = "/frontend/blocked.html";
  }
}, 10000);

});
