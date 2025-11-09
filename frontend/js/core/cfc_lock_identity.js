/* ✅ CFC_FUNC_47_0_IDENTITY_OVERLAY_INTEGRATION */
import { CFC_showBlockOverlay } from "../overlay_block.js";

// 🔹 Inicialización Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// 🔹 Configuración Firebase (reemplaza con tus credenciales reales)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  appId: "TU_APP_ID",
};

// 🔹 Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================================================
// 🔐 Función principal de login
// ==========================================================
export async function CFC_login(email, pass) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    console.log("✅ Usuario autenticado:", user.email);

    // Guardar ID de sesión para control de duplicado
    localStorage.setItem("CFC_SESSION_UID", user.uid);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");

    // Redirigir al dashboard o inicio
    window.location.href = "../index.html";
  } catch (err) {
    console.warn("⚠️ Error al iniciar sesión:", err.code);
    alert("Credenciales inválidas o usuario no autorizado.");
  }
}

// ==========================================================
// 🧠 Observador de cambios de sesión
// ==========================================================
onAuthStateChanged(auth, (user) => {
  const uidLocal = localStorage.getItem("CFC_SESSION_UID");

  if (user) {
    // Sesión válida
    console.log("🟢 Sesión activa:", user.email);

    // Validar sesión única
    if (uidLocal && uidLocal !== user.uid) {
      console.warn("⚠️ Sesión duplicada detectada, cerrando sesión...");
      CFC_showBlockOverlay("Sesión cerrada en otro dispositivo");
      signOut(auth);
    }
  } else {
    // Sin sesión activa → mostrar overlay y forzar cierre
    console.log("🔴 No hay usuario activo, mostrando overlay...");
    localStorage.clear();
    CFC_showBlockOverlay("Sesión no autorizada o expirada");
  }
});

// ==========================================================
// 🔒 Función de cierre manual
// ==========================================================
export async function CFC_logout() {
  await signOut(auth);
  localStorage.clear();
  CFC_showBlockOverlay("Cierre de sesión exitoso");
}

// ==========================================================
// 🧩 Exposición global
// ==========================================================
window.CFC_login = CFC_login;
window.CFC_logout = CFC_logout;

// ==========================================================
// 🔖 CFC_LOCK línea de control
// ==========================================================
console.log("✅ CFC_FUNC_47_0_IDENTITY_OVERLAY_INTEGRATION activo — V47.0-F");
