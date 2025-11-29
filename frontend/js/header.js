/* ==========================================
   ✅ BITÁCORA CFC
   Funcionalidad: Header Global Premium
   Subpaso: 2.3 — Creación componente navegación
   Tipo: Inserción nueva (Fix Visual Premium)
   Fecha: 26-10-2025
   Autor: ChatGPT + CFC
   ControlVisual: true
========================================== */

// 🔹 INICIO CFC_FUNC_2.3_HEADER_FIX

document.addEventListener("DOMContentLoaded", () => {
  const header = document.createElement("header");
  header.innerHTML = `
    <nav class="navbar">
      <div class="logo">🌙 Campus CFC LITE V37</div>
      <ul class="nav-links">
        <li><a href="index.html">Inicio</a></li>
        <li><a href="modules/index.html">Módulos</a></li>
        <li><a href="pages/resultados.html">Resultados</a></li>
        <li><a href="pages/perfil.html">Perfil</a></li>
      </ul>
    </nav>
  `;

  // Insertar al inicio del body si no existe un header previo
  const existingHeader = document.querySelector("header.navbar");
  if (!existingHeader) {
    document.body.insertBefore(header, document.body.firstChild);
  }

  // Validación de rutas (solo en entorno local o Cloudflare)
  console.log("✅ Header Premium cargado correctamente:", window.location.href);
});

// 🔹 FIN CFC_FUNC_2.3_HEADER_FIX
