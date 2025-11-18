// 🧠 CFC Sync Base — localStorage Initialization
// Archivo: /frontend/scripts/sync.js

console.log("🟡 Inicializando sincronización local...");

// Estructura base de datos local del usuario
const userData = {
  nombre: localStorage.getItem('nombreUsuario') || 'Trader',
  progreso: parseInt(localStorage.getItem('progreso')) || 0,
  ultimaSync: localStorage.getItem('ultimaSync') || null
};

// Mostrar confirmación visual en consola
console.log("🔄 Sync local inicial cargado correctamente");
console.log("📦 Datos del usuario:", userData);
