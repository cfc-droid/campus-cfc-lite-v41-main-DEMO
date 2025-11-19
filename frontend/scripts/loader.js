// ==============================================
// LOADER.JS — Loader interactivo con frases
// Campus CFC LITE v1.5
// ==============================================

// Frases motivacionales aleatorias
const frasesMotivacionales = [
  "La paciencia paga más que la prisa. 🧠",
  "Cada trade es una lección, no una derrota. 📘",
  "Controla el riesgo, no el resultado. ⚖️",
  "Tu mente es tu mayor herramienta como trader. 💡",
  "Respira, analiza y ejecuta sin emociones. 🎯",
  "Perder un trade no significa perder el control. 🧭",
  "Constancia > suerte. Siempre. 🔁",
  "Sé disciplinado, incluso cuando nadie te mira. 🦾",
  "El mercado premia la serenidad, no la euforia. 🌊",
  "CFC: Control, Foco y Calma. 💛"
];

// Selecciona una frase aleatoria
function obtenerFraseAleatoria() {
  const indice = Math.floor(Math.random() * frasesMotivacionales.length);
  return frasesMotivacionales[indice];
}

// Asignar frase al loader
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const fraseElemento = document.getElementById('loader-frase');
  if (fraseElemento) fraseElemento.innerText = obtenerFraseAleatoria();

  // Simulación de carga progresiva
  setTimeout(() => {
    loader.classList.add('oculto');
    document.body.classList.add('mostrar-contenido');
  }, 2200);
});
