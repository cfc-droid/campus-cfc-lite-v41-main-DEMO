document.addEventListener("DOMContentLoaded", () => {
  // Evita duplicar el botón si ya existe
  if (document.querySelector(".btn-volver-examen")) return;

  // Crear contenedor + estilos
  const backBtn = document.createElement("div");
  backBtn.innerHTML = `
    <div style="text-align:center; margin-top:40px;">
      <a href="./cap4.html" class="btn-volver-examen">⬅ Volver al capítulo</a>
    </div>
    <style>
      .btn-volver-examen {
        display:inline-block;
        background:linear-gradient(90deg, gold, orange);
        color:#111;
        font-weight:600;
        padding:12px 20px;
        border-radius:8px;
        text-decoration:none;
        box-shadow:0 0 8px rgba(255,215,0,0.4);
        transition:transform 0.2s ease, box-shadow 0.2s ease;
        margin-bottom:30px;
      }
      .btn-volver-examen:hover {
        transform:translateY(-2px);
        box-shadow:0 0 12px rgba(255,215,0,0.6);
      }
    </style>
  `;

  // Insertar el botón al final del body
  document.body.appendChild(backBtn);
});
