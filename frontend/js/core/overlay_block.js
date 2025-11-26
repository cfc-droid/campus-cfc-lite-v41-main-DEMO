/* ==========================================================
   🟦 CFC_OVERLAY_BLOCK_V72_GLOBAL
   Expulsión visual premium negro/dorado
   Auditor: CFC-SYNC
   ========================================================== */

(function () {

  window.CFC_showBlockOverlay = function(email, device_id, reason) {
    console.warn("🚨 OverlayBlock activado:", { email, device_id, reason });

    // Evitar múltiples overlays
    if (document.getElementById("cfc-block-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "cfc-block-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.92)";
    overlay.style.zIndex = "999999";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.color = "#ffd700";
    overlay.style.fontFamily = "Poppins, sans-serif";
    overlay.style.textAlign = "center";
    overlay.style.padding = "20px";

    overlay.innerHTML = `
      <div style="font-size:26px;font-weight:700;margin-bottom:10px;">
        🔒 Dispositivo expulsado
      </div>
      <div style="font-size:15px;opacity:0.85;margin-bottom:20px;">
        ${reason || "Sesión inválida"}
      </div>
      <div style="font-size:13px;opacity:0.6;">
        Email: <b>${email}</b><br>
        Device ID: <b>${device_id}</b>
      </div>
    `;

    document.body.appendChild(overlay);
  };

})();
