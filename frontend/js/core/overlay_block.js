/* ==========================================================
   🔥 CFC_FUNC_47_3_LOCK_PERSIST_REAL_FIX + EXPULSIÓN V72
   Sistema: CFC-LOCK Overlay Premium (Expulsión real)
   Versión: V72-D-OVERLAY — Fecha: 2025-11-27
   Auditor: CFC-SYNC — Subpaso 3.7 (PRUEBA 13)
   ========================================================== */

/**
 * Muestra overlay premium negro–dorado de expulsión.
 *
 * @param {string} email        – Email expulsado
 * @param {string} device_id    – Device ID expulsado
 * @param {string} motivo       – Motivo de expulsión (texto)
 */
export function CFC_showBlockOverlay(email = "unknown", device_id = "unknown", motivo = "Sesión iniciada en otro dispositivo") {

  console.log("🔒 [CFC-LOCK] Disparando Overlay de Expulsión…", { email, device_id, motivo });

  /* ======================================================
     ⚠️ PROTECCIÓN ANTI–LOOP (evita reabrir overlay 1000 veces)
     ====================================================== */
  if (window.__CFC_OVERLAY_ACTIVE__) {
    console.warn("⛔ Overlay ya activo — cancelado (anti-loop)");
    return;
  }
  window.__CFC_OVERLAY_ACTIVE__ = true;

  /* ======================================================
     1. ELIMINAR OVERLAYS PREVIOS
     ====================================================== */
  const prev = document.getElementById("cfc_overlay_block");
  if (prev) prev.remove();

  /* ======================================================
     2. BLOQUEAR LA INTERACCIÓN GLOBAL (scroll + clicks)
     ====================================================== */
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  document.body.style.pointerEvents = "none";

  /* ======================================================
     3. CREAR OVERLAY PRINCIPAL (negro + dorado premium)
     ====================================================== */
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
    textAlign: "center",
    pointerEvents: "auto" /* overlay sí acepta clicks */
  });

  /* ======================================================
     4. CONTENIDO PREMIUM (email + device_id + motivo)
     ====================================================== */
  overlay.innerHTML = `
    <div style="
      max-width:480px;
      padding:32px;
      border:2px solid #FFD700;
      border-radius:22px;
      box-shadow:0 0 40px rgba(255,215,0,0.35);
      background:rgba(0,0,0,0.85);
      ">
      
      <h2 style="font-size:24px;margin-bottom:14px;">🔒 Sesión Expulsada</h2>

      <p style="font-size:15px;opacity:0.9;margin-bottom:14px;line-height:1.5;">
        <b>Motivo:</b><br>${motivo}
      </p>

      <p style="font-size:13px;opacity:0.8;margin-bottom:18px;">
        <b>Email:</b> ${email}<br>
        <b>Device ID:</b> ${device_id}
      </p>

      <button id="cfc_btn_reload" style="
        background:#FFD700;
        color:#000;
        font-weight:bold;
        padding:12px 28px;
        border:none;
        border-radius:12px;
        cursor:pointer;
        transition:0.3s;
        box-shadow:0 0 12px rgba(255,215,0,0.55);
      ">
        Reingresar
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  /* ======================================================
     5. BOTÓN REINGRESAR — FULL LIMPIEZA + PROGRESO
     ====================================================== */
  document.getElementById("cfc_btn_reload").addEventListener("click", () => {
    console.log("🔁 [CFC-LOCK] Reingresar solicitado desde overlay…");

    /* 5.1 Preservar progreso clave */
    const preserveKeys = [
      "CFC_PROGRESS",
      "CFC_TIMER"_
