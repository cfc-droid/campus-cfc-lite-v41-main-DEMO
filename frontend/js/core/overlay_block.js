/* ==========================================================
   ✅ CFC_FUNC_47_2_OVERLAY_BLOCK_UI
   Sistema: CFC-LOCK Overlay Dorado-Negro
   Versión: V47.2-F — Fecha: 2025-11-09
   Auditor: CFC-SYNC QA-SYNC VERIFIED
   ========================================================== */

export function CFC_showBlockOverlay(msg = "Acceso bloqueado") {
  // 🔸 Protección: evitar overlay en la pantalla de login
  const isLoginPage = window.location.pathname.includes("login.html");
  if (isLoginPage) {
    console.log("🟡 Overlay bloqueado en login.html — no se mostrará.");
    return;
  }

  // 🔸 Eliminar si ya existe uno previo
  const existing = document.querySelector(".cfc-overlay-block");
  if (existing) existing.remove();

  // 🔸 Crear estructura base del overlay
  const overlay = document.createElement("div");
  overlay.className = "cfc-overlay-block";
  overlay.innerHTML = `
    <div class="overlay-content">
      <h2>🔒 Acceso bloqueado</h2>
      <p>${msg}</p>
      <button id="cfcReLoginBtn">Reingresar</button>
    </div>
  `;

  // 🔸 Estilos dinámicos
  const style = document.createElement("style");
  style.textContent = `
    .cfc-overlay-block {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at center, #000 80%, #111);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: #FFD700;
      font-family: Poppins, sans-serif;
      transition: opacity 0.3s ease-in-out;
    }
    .overlay-content {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,215,0,0.5);
      border-radius: 20px;
      padding: 35px 25px;
      text-align: center;
      box-shadow: 0 0 30px rgba(255,215,0,0.2);
      width: 320px;
    }
    .overlay-content h2 {
      color: #FFD700;
      margin-bottom: 10px;
      font-size: 20px;
    }
    .overlay-content p {
      color: #FFD700;
      font-size: 14px;
      margin-bottom: 20px;
      opacity: 0.85;
    }
    #cfcReLoginBtn {
      background-color: #FFD700;
      color: #000;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.25s;
    }
    #cfcReLoginBtn:hover {
      background-color: #fff;
      color: #000;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // 🔸 Acción del botón
  document.getElementById("cfcReLoginBtn").addEventListener("click", () => {
    window.location.href = "../html/login.html";
  });

  console.log("🧱 CFC Overlay de bloqueo activado:", msg);
}

// ==========================================================
// 🔖 Línea de control QA-SYNC
// ==========================================================
console.log("✅ CFC_FUNC_47_2_OVERLAY_BLOCK_UI activo — V47.2-F QA-SYNC");
