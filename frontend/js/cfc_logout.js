/* ==========================================================
   🧹 CFC_LOGOUT_V1 — Destrucción total de sesión (MSCU V1)
   Sistema: Campus CFC LITE V41
   Autor: CFC
   ========================================================== */

// 👉 1) Importar API (Render Proxy)
import { triggerLogout } from "./core/cfc_api.js";

// 👉 2) Limpiar sesión MSCU V1
export function CFC_FULL_LOGOUT(reason = "Cierre de sesión solicitado.") {
  console.log("🧹 CFC_LOGOUT — Iniciando limpieza total de sesión…");
  console.log("🔎 Razón:", reason);

  // A) Borrar sesión MSCU V1
  try {
    localStorage.removeItem("cfc_session");
    console.log("🗑️ cfc_session eliminada");
  } catch (e) {
    console.warn("⚠️ Error al borrar cfc_session:", e);
  }

  // B) Borrar Device ID
  try {
    localStorage.removeItem("CFC_DEVICE_ID");
    console.log("🗑️ CFC_DEVICE_ID eliminado");
  } catch (e) {
    console.warn("⚠️ Error al borrar CFC_DEVICE_ID:", e);
  }

  // C) Borrar antiguas claves heredadas
  const legacyKeys = [
    "CFC_SESSION_ID",
    "CFC_SESSION_ACTIVE",
    "CFC_EMAIL",
    "CFC_LICENSE"
  ];

  legacyKeys.forEach(k => {
    try {
      localStorage.removeItem(k);
      console.log(`🗑️ ${k} eliminado`);
    } catch (e) {
      console.warn(`⚠️ Error al borrar ${k}:`, e);
    }
  });

  // D) Notificar al servidor Render (si aplica)
  try {
    triggerLogout(reason);
    console.log("📡 Logout remoto enviado a Render");
  } catch (e) {
    console.warn("⚠️ Error al notificar Render:", e);
  }

  // 👉 3) Redirigir al login
  console.log("🔄 Redirigiendo a login…");
  window.location.href = "../html/login.html";
}

/* ==========================================================
   🔒 FIN — CFC_LOGOUT_V1
   ========================================================== */
