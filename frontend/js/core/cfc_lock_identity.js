/* ==========================================================
   🔐 CFC_LOCK_IDENTITY_V72_LAYER_MODE + EXPORT_11B
   Sistema: Campus CFC LITE V41
   Modo: SAFE — Solo inicialización, sin ejecución automática
   Parche: EXPORTACIÓN GLOBAL CONTROLADA (PRUEBA 11)
   ========================================================== */

/* ==========================================================
   🔹 IMPORTS PERMITIDOS EN V72-LAYER
   ========================================================== */
import { CFC_showBlockOverlay } from "../overlay_block.js";

/* ==========================================================
   🔹 Firebase SAFE Config
   (No autentica, no valida usuarios)
   Solo inicializa Firestore para uso futuro
   ========================================================== */
import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ==========================================================
   🔹 CONFIG FIREBASE — PERMITIDO
   ========================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
};

let db = null;

try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("🧩 Firebase cargado en modo SAFE (V72-LAYER)");
} catch (err) {
  console.error("❌ Error al inicializar Firebase (SAFE):", err);
}

/* ==========================================================
   🧩 UTILIDADES SEGURAS (permitidas)
   ========================================================== */
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const nowISO = () => new Date().toISOString();

const makeDeviceId = () => {
  let id = localStorage.getItem("CFC_DEVICE_ID");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("CFC_DEVICE_ID", id);
  }
  return id;
};

/* ==========================================================
   🔐 FUNCIÓN PRINCIPAL — CFC_login()
   Es la única permitida en esta etapa
   NO se ejecuta sola
   NO inicia listeners
   NO inicia heartbeat
   NO registra sesión todavía
   Solo prepara estructura MSCU local
   ========================================================== */

export async function CFC_login(email, license) {
  console.log("🧩 CFC_login() llamado correctamente DESPUÉS de login local");

  // Normalización
  const e = email.trim().toLowerCase();
  const k = license.trim();
  const sid = makeSessionId();
  const did = makeDeviceId();

  // Guardado LOCAL (SAFE)
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sid);
  localStorage.setItem("CFC_DEVICE_ID", did);

  console.log(`
  🔐 CFC_LOCK_IDENTITY_V72_LAYER — Datos preparados (MSCU LOCAL)
  --------------------------------------------------
  email: ${e}
  device_id: ${did}
  session_id: ${sid}
  (AÚN NO SE ENVÍA NADA A FIRESTORE)
  (AÚN NO SE INICIA HEARTBEAT)
  (AÚN NO SE INICIA RENDER SYNC)
  --------------------------------------------------
  `);

  return {
    email: e,
    device_id: did,
    session_id: sid,
  };
}

/* ==========================================================
   🚫 PROHIBIDO EN ESTA ETAPA (V72-LAYER)
   ----------------------------------------------------------
   NO AUTOCALL
   NO AUTOLOAD
   NO LISTENERS
   NO HEARTBEAT
   NO SYNC
   NO POLLING
   NO FIRESTORE WRITE
   ----------------------------------------------------------
   Por eso no hay ningún addEventListener aquí
   ========================================================== */

/* ==========================================================
   🟡 PARCHE 11-B — EXPORTACIÓN GLOBAL CONTROLADA
   ----------------------------------------------------------
   Esto permite usar:
       CFC_login(...)
   en la consola del navegador.
   NO activa nada automático.
   NO cambia el comportamiento SAFE.
   ========================================================== */
window.CFC_login = CFC_login;

console.log("🧩 QA-SYNC | CFC_LOCK_IDENTITY_V72_LAYER + EXPORT_11B listo (CFC_login exportado)");
