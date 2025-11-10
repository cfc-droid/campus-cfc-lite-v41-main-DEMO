/* ==========================================================
   ✅ CFC_FUNC_47_0_IDENTITY_OVERLAY_INTEGRATION
   Sistema: CFC-LOCK IDENTITY (Firebase Auth + Overlay)
   Versión: V47.0-F — Fecha: 2025-11-09
   Auditor: CFC-SYNC REAL LOCK
   ========================================================== */

// ==========================================================
// 🔹 Importaciones globales (fuera de funciones)
// ==========================================================
import { CFC_showBlockOverlay } from "../overlay_block.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// ==========================================================
// 🔹 Configuración Firebase (CFC_LOCK_FIREBASE)
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
// 🔹 Inicializa Firebase
// ==========================================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================================================
// 🔐 Función principal de login
// ==========================================================
async function CFC_login(email, pass) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    console.log("✅ Usuario autenticado:", user.email);

    // Guardar sesión
    localStorage.setItem("CFC_SESSION_UID", user.uid);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");
    localStorage.setItem("CFC_SESSION_TIMESTAMP", new Date().toISOString());

    // Redirigir al dashboard
    window.location.href = "../index.html";
  } catch (err) {
    console.warn("⚠️ Error al iniciar sesión:", err.code);
    alert("Credenciales inválidas o usuario no autorizado.");
  }
}

// ==========================================================
// 🔒 Función de cierre manual
// ==========================================================
async function CFC_logout() {
  await signOut(auth);
  localStorage.clear();
  CFC_showBlockOverlay("Cierre de sesión exitoso");
}

// ==========================================================
// 🧠 Observador de cambios de sesión
// ==========================================================
onAuthStateChanged(auth, (user) => {
  const uidLocal = localStorage.getItem("CFC_SESSION_UID");

  if (user) {
    console.log("🟢 Sesión activa:", user.email);

    // Control de sesión duplicada
    if (uidLocal && uidLocal !== user.uid) {
      console.warn("⚠️ Sesión duplicada detectada, cerrando sesión...");
      CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      signOut(auth);
    }
  } else {
    console.log("🔴 No hay usuario activo, mostrando overlay...");
    localStorage.clear();
    CFC_showBlockOverlay("Sesión no autorizada o expirada");
  }
});

// ==========================================================
// 🧩 Exportaciones para uso modular
// ==========================================================
export { CFC_login, CFC_logout };

// ==========================================================
// 🟡 Línea de control QA-SYNC
// ==========================================================
console.log("✅ CFC_FUNC_47_0_IDENTITY_OVERLAY_INTEGRATION activo — V47.0-F REAL LOCK FINAL");
