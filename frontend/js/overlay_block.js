/* ✅ CFC_FUNC_47_0_OVERLAY_BLOCK */
export function CFC_showBlockOverlay(reason = "Sesión no autorizada") {
  // Elimina cualquier overlay previo
  const existingOverlay = document.getElementById("cfc_overlay_block");
  if (existingOverlay) existingOverlay.remove();

  // Crea el contenedor principal
  const overlay = document.createElement("div");
  overlay.id = "cfc_overlay_block";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.96)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "999999";
  overlay.style.backdropFilter = "blur(8px)";
  overlay.style.color = "#FFD700";
  overlay.style.fontFamily = "Poppins, sans-serif";
  overlay.style.textAlign = "center";

  // Contenido interno (mensaje + botón)
  overlay.innerHTML = `
    <div style="max-width:420px; padding:30px; border:1px solid #FFD700; border-radius:20px; box-shadow:0 0 30px rgba(255,215,0,0.25); background:rgba(0,0,0,0.8);">
      <h2 style="font-size:22px; margin-bottom:10px;">🔒 Acceso bloqueado</h2>
      <p style="font-size:14px; opacity:0.9; margin-bottom:20px;">
        ${reason}<br>Por seguridad, debes volver a iniciar sesión.
      </p>
      <button id="cfc_btn_reload" style="
        background:#FFD700;
        color:#000;
        font-weight:bold;
        padding:10px 25px;
        border:none;
        border-radius:10px;
        cursor:pointer;
        transition:0.3s;">
        Reingresar
      </button>
    </div>
  `;

  // Agregar el overlay al documento
  document.body.appendChild(overlay);

  // Botón de reinicio
  document.getElementById("cfc_btn_reload").addEventListener("click", () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../html/login.html";
  });

  console.log("🟡 CFC Overlay de bloqueo activado:", reason);
}

// 🚀 Exposición global
window.CFC_showBlockOverlay = CFC_showBlockOverlay;

// ✅ CFC_LOCK línea de control
console.log("✅ CFC_FUNC_47_0_OVERLAY_BLOCK activo — V47.0-F");
