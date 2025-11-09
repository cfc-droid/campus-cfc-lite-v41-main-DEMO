/* ✅ CFC_FUNC_47_0_IDENTITY_FIREBASE */
import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// ⚙️ Configuración del proyecto Firebase (rellenar con tus valores)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  appId: "TU_APP_ID"
};

// 🚀 Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔑 Inicio de sesión manual
async function CFC_login(email, pass){
  try{
    await signInWithEmailAndPassword(auth, email, pass);
    localStorage.setItem("CFC_user", email);
    localStorage.setItem("CFC_session", crypto.randomUUID());
    console.log("✅ Sesión iniciada correctamente");
  }catch(e){
    alert("Error: " + e.message);
  }
}

// 🔐 Detección de cierre remoto de sesión
onAuthStateChanged(auth, user => { 
  if(!user) CFC_showBlockedOverlay(); 
});

// 🟡 Overlay dorado de sesión cerrada
function CFC_showBlockedOverlay(){
  document.body.innerHTML = `
  <div style="
      text-align:center;
      margin-top:25vh;
      color:#FFD700;
      font-family:Poppins,sans-serif;">
    <h2>🚫 Sesión cerrada en otro dispositivo</h2>
    <p>Vuelve a iniciar sesión para continuar.</p>
  </div>`;
  localStorage.clear();
}

// 🧩 Función de cierre manual (opcional)
async function CFC_logout(){
  await signOut(auth);
  CFC_showBlockedOverlay();
}

// 🌍 Exposición global para HTML
window.CFC_login = CFC_login;
window.CFC_logout = CFC_logout;
window.CFC_showBlockedOverlay = CFC_showBlockedOverlay;
