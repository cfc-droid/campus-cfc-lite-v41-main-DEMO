/* ==========================================================
   ✅ CFC_FUNC_10_2_20251029 — Overlay diario implementado
   ========================================================== */
function dailyReview() {
  const today = new Date().toLocaleDateString();

  // 🔍 Mostrar solo si no se revisó hoy
  if (localStorage.getItem("lastReview") !== today) {
    const o = document.createElement("div");
    o.id = "dailyReview";
    o.style.cssText = `
      position:fixed;
      inset:0;
      background:rgba(0,0,0,0.85);
      color:#FFD700;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      z-index:99999;
      font-family:'Poppins',sans-serif;
      text-align:center;
      animation:fadeIn 0.8s ease;
    `;
    o.innerHTML = `
      <div style="background:rgba(0,0,0,0.6);padding:30px;border-radius:14px;box-shadow:0 0 18px rgba(255,215,0,0.5);max-width:400px;">
        <h2 style="margin-bottom:12px;">📘 Tu objetivo de hoy</h2>
        <p style="font-size:1rem;line-height:1.4;">Completá al menos <b>1 módulo</b> y registrá tu <b>emoción del día</b>.</p>
        <button onclick="closeReview()" style="margin-top:20px;background:linear-gradient(90deg,#FFD700,#FFEC8B);border:none;border-radius:10px;padding:8px 18px;font-weight:700;color:#000;cursor:pointer;">
          Entendido ✅
        </button>
      </div>
    `;
    document.body.appendChild(o);
  }
}

function closeReview() {
  localStorage.setItem("lastReview", new Date().toLocaleDateString());
  const el = document.getElementById("dailyReview");
  if (el) el.remove();
}

// 🕓 Lanzar revisión diaria al cargar la página
window.addEventListener("load", dailyReview);

console.log("🧩 CFC_SYNC checkpoint: daily-review.js — Punto 10.2 actualizado", new Date().toLocaleString());
