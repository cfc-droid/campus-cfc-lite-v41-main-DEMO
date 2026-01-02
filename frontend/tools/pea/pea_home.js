// PEA Home — navegación básica
// No lógica de negocio
// No interpretación
// No métricas

document.getElementById('pea-btn-register').onclick = () => {
  window.location.href = './pea_screen_register.html';
};

document.getElementById('pea-btn-history').onclick = () => {
  window.location.href = './pea_screen_history.html';
};

document.getElementById('pea-btn-back').onclick = () => {
  window.location.href = '/frontend/index.html';
};


// Vistas guardadas y Modo Auditoría
// Se habilitan en bloques posteriores
const viewsBtn = document.getElementById('pea-btn-views');
if (viewsBtn) {
  viewsBtn.onclick = () => alert('Función no disponible en esta versión.');
}

const auditBtn = document.getElementById('pea-btn-audit');
if (auditBtn) {
  auditBtn.onclick = () => alert('Función no disponible en esta versión.');
}

const themeBtn = document.getElementById('pea-btn-theme');
if (themeBtn) {
  themeBtn.onclick = () => {
    if (typeof window.peaToggleTheme === 'function') {
      window.peaToggleTheme();
    } else {
      console.warn("peaToggleTheme no está disponible.");
    }
  };
}
