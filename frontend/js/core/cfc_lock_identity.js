/* ==========================================================
   ✅ CFC_FUNC_47_0_IDENTITY_OVERLAY_INTEGRATION
   Sistema: CFC-LOCK IDENTITY (Firebase Auth + Overlay)
   Versión: V47.0-K — Fecha: 2025-11-09
   Auditor: CFC-SYNC SECURE API KEY FIX (FINAL STABLE)
   ========================================================== */

import { CFC_showBlockOverlay } from "../overlay_block.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// ==========================================================
// 🔹 Configuración Firebase (actualizada desde consola)
// ==========================================================
const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
  storageBucket: "cfc-lock-firebase.firebasestorage.app",
  messagingSenderId: "352796893243",
  appId: "1:352796893243:web:a2bb8b30a35f45579efc1e",
};

// ==========================================================
// 🔹 Inicialización controlada
// ==========================================================
let app, auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("🔥 Firebase inicializado correctamente (CFC_LOCK).");
} catch (e) {
  console.error("❌ Error inicializando Firebase:", e);
  alert("Error de conexión con Firebase. Verifica tu API Key o dominio.");
}

// ==========================================================
// 🔐 Login
// ==========================================================
async function CFC_login(email, pass) {
  try {
    console.log("⏳ Intentando login con:", email);
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;

    console.log("✅ Usuario autenticado:", user.email);

    // Guardar sesión local
    localStorage.setItem("CFC_SESSION_UID", user.uid);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");
    localStorage.setItem("CFC_SESSION_TIMESTAMP", new Date().toISOString());

    // Redirección al índice principal
    window.location.href = "../index.html";
  } catch (err) {
    console.warn("⚠️ Error al iniciar sesión:", err.code || err.message);
    if (err.code?.includes("auth/invalid-api-key")) {
      alert("Error de configuración: API key inválida. Verifica el archivo.");
    } else if (err.code?.includes("auth/invalid-email")) {
      alert("El formato del correo no es válido.");
    } else if (err.code?.includes("auth/invalid-credential")) {
      alert("Credenciales incorrectas o usuario no autorizado.");
    } else {
      alert("Error al iniciar sesión. Verifica tus datos o la conexión.");
    }
  }
}

// ==========================================================
// 🔒 Logout manual
// ==========================================================
async function CFC_logout() {
  await signOut(auth);
  localStorage.clear();
  CFC_showBlockOverlay("Cierre de sesión exitoso");
}

// ==========================================================
// 🧠 Observador de sesión (modo robusto)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const href = window.location.href.toLowerCase();
  const isLoginPage =
    href.includes("login.html") ||
    href.endsWith("/login") ||
    href.endsWith("/login/") ||
    document.title.toLowerCase().includes("iniciar sesión");

  console.log("🔍 Verificación de contexto:", { href, isLoginPage });

  onAuthStateChanged(auth, (user) => {
    const uidLocal = localStorage.getItem("CFC_SESSION_UID");

    if (user) {
      console.log("🟢 Sesión activa:", user.email);

      // Prevención de sesión duplicada
      if (uidLocal && uidLocal !== user.uid) {
        console.warn("⚠️ Sesión duplicada detectada → cerrando sesión");
        signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      }
    } else {
      if (!isLoginPage) {
        console.log("🔴 Usuario no autenticado → overlay ON");
         
        // ✅ CFC_FUNC_47_2_LOCK_STATE — Preservar progreso local
const preserveKeys = [
  "CFC_PROGRESS",
  "CFC_TIMER",
  "CFC_MODULE_STATE",
  "CFC_EMO_STATE",
  "CFC_LAST_LOGIN"
];

// Guardar temporalmente las claves protegidas
const preservedData = {};
preserveKeys.forEach(k => {
  const value = localStorage.getItem(k);
  if (value !== null) preservedData[k] = value;
});

// Borrar todo
localStorage.clear();
sessionStorage.clear();

// Restaurar las claves protegidas
Object.entries(preservedData).forEach(([k, v]) => {
  localStorage.setItem(k, v);
});

console.log("✅ CFC_LOCK_STATE: progreso local preservado tras logout.");

        CFC_showBlockOverlay("Sesión no autorizada o expirada");
      } else {
        console.log("🟡 En login.html — overlay desactivado correctamente.");
      }
    }
  });
});

// ==========================================================
// 🧩 Exportaciones
// ==========================================================
export { CFC_login, CFC_logout };

// ==========================================================
// QA-SYNC
// ==========================================================
console.log("✅ CFC_FUNC_47_0_IDENTITY_OVERLAY_INTEGRATION activo — V47.0-K SECURE STABLE");
