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
document.getElementById('pea-btn-views').onclick = () => {
  alert('Función no disponible en esta versión.');
};

document.getElementById('pea-btn-audit').onclick = () => {
  alert('Función no disponible en esta versión.');
};
