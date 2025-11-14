// =====================================================
// ✅ CFC_FUNC_41_5_FIX3_JS_V41.5 — Filtros + QA Visual
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("thoughts");
  const list = document.getElementById("list");
  const toneSelect = document.getElementById("toneSelect");
  const icons = document.querySelectorAll(".icon-option");
  const filterIcon = document.getElementById("filterIcon");
  const filterTone = document.getElementById("filterTone");
  const filterStart = document.getElementById("filterStart");
  const filterEnd = document.getElementById("filterEnd");
  const applyFiltersBtn = document.getElementById("applyFilters");
  const resetFiltersBtn = document.getElementById("resetFilters");
  const filtersBlock = document.getElementById("filtersBlock");

  let selectedIcon = "🧠";
  let selectedTone = "";

  // =====================================================
  // 0️⃣ Diagnóstico visual de carga
  // =====================================================
  const banner = document.createElement("div");
  banner.style.position = "fixed";
  banner.style.top = "10px";
  banner.style.left = "50%";
  banner.style.transform = "translateX(-50%)";
  banner.style.padding = "8px 16px";
  banner.style.borderRadius = "8px";
  banner.style.zIndex = "9999";
  banner.style.fontFamily = "Poppins, sans-serif";
  banner.style.fontSize = "14px";
  banner.style.fontWeight = "600";
  banner.style.color = "#000";
  banner.style.transition = "all 0.6s ease";

  if (!filtersBlock) {
    banner.textContent = "⚠️ Filtros NO detectados (HTML antiguo o cacheado)";
    banner.style.background = "#ffcc00";
    console.warn("⚠️ CFC_SYNC: filtros no cargados (HTML cacheado)");
  } else {
    banner.textContent = "✅ Filtros cargados correctamente";
    banner.style.background = "#00ff99";
    console.log("✅ CFC_SYNC: filtros visibles en DOM");
  }
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 4000);

  // =====================================================
  // 1️⃣ Cargar Bitácora desde localStorage
  // =====================================================
  const loadBitacora = () => {
    setTimeout(() => {
      const data = JSON.parse(localStorage.getItem("bitacora")) || [];
      renderBitacora(data);
    }, 300);
  };

  // =====================================================
  // 2️⃣ Guardar nueva reflexión
  // =====================================================
  window.saveThought = () => {
    const entry = textarea.value.trim();
    if (!entry) return alert("⚠️ Escribí algo antes de guardar.");
    const data = JSON.parse(localStorage.getItem("bitacora")) || [];
    data.push({
      icon: selectedIcon,
      tone: selectedTone,
      entry,
      date: new Date().toLocaleString(),
      timestamp: Date.now()
    });
    localStorage.setItem("bitacora", JSON.stringify(data));
    textarea.value = "";
    renderBitacora(data);
    alert("💾 Pensamiento guardado en tu Bitácora Mental.");
  };

  // =====================================================
  // 3️⃣ Renderizado
  // =====================================================
  const renderBitacora = (data) => {
    list.innerHTML = data.length
      ? data.map((d,i)=>`
        <li>
          <div class="thought-header">${d.icon||"🧠"} <strong>${d.date}</strong></div>
          <div class="thought-text">${d.tone?`<em>${d.tone}</em><br>`:""}${d.entry}</div>
          <div class="thought-actions">
            <button class="edit-btn" onclick="editEntry(${i})">✏️</button>
            <button class="delete-btn" onclick="deleteEntry(${i})">🗑️</button>
          </div>
        </li>`).join("")
      : `<li style="color:#777;">Sin registros disponibles...</li>`;
  };

  // =====================================================
  // 4️⃣ Editar / Eliminar
  // =====================================================
  window.editEntry = (i)=>{
    const data=JSON.parse(localStorage.getItem("bitacora"))||[];
    const item=data[i]; if(!item) return;
    textarea.value=item.entry;
    selectedTone=item.tone; toneSelect.value=item.tone;
    selectedIcon=item.icon;
    data.splice(i,1);
    localStorage.setItem("bitacora",JSON.stringify(data));
    renderBitacora(data);
  };
  window.deleteEntry = (i)=>{
    if(!confirm("¿Eliminar esta reflexión?")) return;
    const data=JSON.parse(localStorage.getItem("bitacora"))||[];
    data.splice(i,1);
    localStorage.setItem("bitacora",JSON.stringify(data));
    renderBitacora(data);
  };

  // =====================================================
  // 5️⃣ Selección de ícono y tono
  // =====================================================
  icons.forEach(icon=>{
    icon.addEventListener("click",()=>{
      icons.forEach(i=>i.style.opacity="0.6");
      icon.style.opacity="1";
      selectedIcon=icon.textContent;
      console.log("🧩 CFC_SYNC: Ícono →",selectedIcon);
    });
  });
  toneSelect.addEventListener("change",e=>{
    selectedTone=e.target.value;
    console.log("🧩 CFC_SYNC: Tono →",selectedTone);
  });

  // =====================================================
  // 6️⃣ Filtros
  // =====================================================
  if(applyFiltersBtn && resetFiltersBtn){
    applyFiltersBtn.addEventListener("click",()=>{
      const data=JSON.parse(localStorage.getItem("bitacora"))||[];
      const start=filterStart.value?new Date(filterStart.value).getTime():null;
      const end=filterEnd.value?new Date(filterEnd.value).getTime()+86400000:null;
      const iconFilter=filterIcon.value;
      const toneFilter=filterTone.value;
      const filtered=data.filter(d=>{
        const ts=d.timestamp||new Date(d.date).getTime();
        const byDate=(!start||ts>=start)&&(!end||ts<=end);
        const byIcon=!iconFilter||d.icon===iconFilter;
        const byTone=!toneFilter||d.tone===toneFilter;
        return byDate&&byIcon&&byTone;
      });
      renderBitacora(filtered);
    });
    resetFiltersBtn.addEventListener("click",()=>{
      filterStart.value=filterEnd.value=filterIcon.value=filterTone.value="";
      loadBitacora();
    });
  }

  // =====================================================
  // 7️⃣ Inicialización
  // =====================================================
  loadBitacora();
  console.log("🧩 CFC_SYNC checkpoint: bitacora.js — FIX3 OK");
});
/* 🔒 CFC_LOCK: V41.5_BITACORA_FIX3_JS_20251106 */

/* ============================================================
   CFC-SYNC — HEARTBEAT DOMINIO (B)
============================================================ */
setInterval(() => {
  if (!window.CFC_DOMAIN_OK) {
    window.location.href = "/frontend/blocked.html";
  }
}, 10000);

/* ============================================================
   CFC-SYNC — ROOT GUARD + COMPATIBILIDAD (C)(F)
============================================================ */
import "/frontend/js/core/cfc_lock_identity.js";

/* ============================================================
   CFC-SYNC — HEARTCORE MONITOR (G)
============================================================ */
setInterval(() => {
  const sessionId = localStorage.getItem("CFC_SESSION_ID");
  if (!sessionId) {
    const ov = document.createElement("div");
    ov.style.cssText =
      "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.85);color:#ffd700;font-family:Poppins,sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:22px;";
    ov.innerHTML = `<div>⚠️ Sesión inválida</div><div style="font-size:16px;margin-top:10px;">Redirigiendo…</div>`;
    document.body.appendChild(ov);
    setTimeout(() => (window.location.href = "/html/login.html"), 1500);
  }
}, 5000);
