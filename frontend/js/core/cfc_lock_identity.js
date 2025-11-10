/* ==========================================================
   ✅ CFC_FUNC_47_0_IDENTITY_OVERLAY_INTEGRATION
   Sistema: CFC-LOCK IDENTITY (Firebase Auth + Overlay)
   Versión: V47.0-I — Fecha: 2025-11-09
   Auditor: CFC-SYNC REAL LOCK FINAL CONTEXT FIX
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
// 🔹 Configuración Firebase
// ==========================================================
const firebaseConfig = {
  apiKey: "AIzaSyDLWJlayKYbXeDAp8uE6-7abSdyB8Babys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
  storageBucket: "cfc-lock-firebase.appspot.com",
  messagingSenderId: "352796892343",
  appId: "1:352796892343:web:2b8bb30a35f45579efc1e",
};

// ==========================================================
// 🔹 Inicialización
// ==========================================================
let app, auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("🔥 Firebase inicializado correctamente (CFC_LOCK).");
} catch (e) {
  console.error("❌ Error inicializando Firebase:", e);
}

// ==========================================================
// 🔐 Función principal de login
// ==========================================================
async function CFC_login(email, pass) {
  try {
    console.log("⏳ Intentando login con:", email);

    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    console.log("✅ Usuario autenticado:", user.email);

    localStorage.setItem("CFC_SESSION_UID", user.uid);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");
    localStorage.setItem("CFC_SESSION_TIMESTAMP", new Date().toISOString());

    // Redirigir
    window.location.href = "../index.html";
  } catch (err) {
    console.warn("⚠️ Error al iniciar sesión:", err.code);
    alert("Credenciales inválidas o usuario no autorizado.");
  }
}

// ==========================================================
// 🔒 Cierre manual
// ==========================================================
async function CFC_logout() {
  await signOut(auth);
  localStorage.clear();
  CFC_showBlockOverlay("Cierre de sesión exitoso");
}

// ==========================================================
// 🧠 Observador de sesión con verificación de contexto
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const isLoginPage = currentPage === "login.html";

  onAuthStateChanged(auth, (user) => {
    const uidLocal = localStorage.getItem("CFC_SESSION_UID");

    if (user) {
      console.log("🟢 Sesión activa:", user.email);

      if (uidLocal && uidLocal !== user.uid) {
        console.warn("⚠️ Sesión duplicada detectada, cerrando sesión...");
        signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      }
    } else {
      if (!isLoginPage) {
        console.log("🔴 Usuario no autenticado (fuera del login) → overlay ON");
        localStorage.clear();
        CFC_showBlockOverlay("Sesión no autorizada o expirada");
      } else {
        console.log("🟡 En login.html — overlay bloqueado correctamente.");
      }
    }
  });
});

// ==========================================================
// 🧩 Exportaciones
// ==========================================================
export { CFC_login, CFC_logout };

// ==========================================================
// 🟡 Línea QA-SYNC
// ==========================================================
console.log("✅ CFC_FUNC_47_0_IDENTITY_OVERLAY_INTEGRATION activo — V47.0-I FINAL CONTEXT FIX");
