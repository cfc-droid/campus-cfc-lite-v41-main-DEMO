/* ==========================================================
   ✅ CFC_FUNC_47_3_LOCK_PERSIST_REAL_FIX
   Sistema: CFC-LOCK Overlay + Preservación del progreso
   Versión: V47.3-F — Fecha: 2025-11-10
   Auditor: CFC-SYNC REAL QA
   ========================================================== */

export function CFC_showBlockOverlay(reason = "Sesión no autorizada") {
  // 🧹 Elimina cualquier overlay previo
  const existingOverlay = document.getElementById("cfc_overlay_block");
  if (existingOverlay) existingOverlay.remove();

  // 🧩 Contenedor principal
  const overlay = document.createElement("div");
  overlay.id = "cfc_overlay_block";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.96)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "999999",
    backdropFilter: "blur(8px)",
    color: "#FFD700",
    fontFamily: "Poppins, sans-serif",
    textAlign: "center"
  });

  // 🟡 Contenido interno
  overlay.innerHTML = `
    <div style="max-width:420px;padding:30px;border:1px solid #FFD700;
      border-radius:20px;box-shadow:0 0 30px rgba(255,215,0,0.25);
      background:rgba(0,0,0,0.8);">
      <h2 style="font-size:22px;margin-bottom:10px;">🔒 Acceso bloqueado</h2>
      <p style="font-size:14px;opacity:0.9;margin-bottom:20px;">
        ${reason}<br>Por seguridad, debes volver a iniciar sesión.
      </p>
      <button id="cfc_btn_reload" style="
        background:#FFD700;color:#000;font-weight:bold;
        padding:10px 25px;border:none;border-radius:10px;
        cursor:pointer;transition:0.3s;">
        Reingresar
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  // 🧠 Botón de reingreso con preservación local
  document.getElementById("cfc_btn_reload").addEventListener("click", () => {
    console.log("🔁 Reingreso solicitado desde overlay…");

    // ✅ CFC_FUNC_47_3_LOCK_PERSIST_REAL_FIX — preserva progreso local
    const preserveKeys = [
      "CFC_PROGRESS",
      "CFC_TIMER",
      "CFC_MODULE_STATE",
      "CFC_EMO_STATE",
      "CFC_LAST_LOGIN",
      "progressData",
      "progressPercent"
    ];

    // Guardar datos esenciales antes de limpiar
    const preservedData = {};
    preserveKeys.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) preservedData[k] = v;
    });

    // Limpiar todo excepto progreso
    localStorage.clear();
    sessionStorage.clear();

    // Restaurar claves protegidas
    Object.entries(preservedData).forEach(([k, v]) => {
      localStorage.setItem(k, v);
    });

    console.log("✅ CFC_LOCK_PERSIST: progreso local restaurado antes del reingreso.");
    window.location.href = "../html/login.html";
  });

  console.log("🟡 CFC Overlay de bloqueo activado:", reason);
}

// 🚀 Exposición global
window.CFC_showBlockOverlay = CFC_showBlockOverlay;

// ==========================================================
// QA-SYNC LOG
// ==========================================================
console.log("✅ CFC_FUNC_47_3_LOCK_PERSIST_REAL_FIX activo — V47.3-F");
