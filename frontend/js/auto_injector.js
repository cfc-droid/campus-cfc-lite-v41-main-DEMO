/* =========================================================
   ✅ CFC_FUNC_5_2_AUTOLOAD_V20251106_SAFEFIX_PLUS — Versión corregida
   📄 Archivo: /frontend/js/auto_injector.js
   🔒 CFC-SYNC V8.2 | QA-SYNC V11.0 — 2025-11-19
   ---------------------------------------------------------
   ✔️ Se elimina theme.js (no existe en tu repositorio)
   ✔️ Sin errores 404 → sin “Unexpected token '<'”
   ✔️ Inyección segura y validada
   ✔️ 100% compatible con Cloudflare Pages
========================================================= */

(function () {
  // 🧩 Base dinámica según dominio
  const base = window.location.hostname.includes("pages.dev")
    ? "/frontend/js/"
    : "../js/";

  // 🧩 Inyección segura con validación previa (HEAD)
  const injectScript = async (file, description = "") => {
    const src = base + file;

    try {
      const res = await fetch(src, { method: "HEAD" });

      if (!res.ok) {
        console.warn(
          `⚠️ [SAFEFIX_PLUS] Omitido ${file} — No encontrado (${res.status})`
        );
        return;
      }

      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      document.head.appendChild(s);

    } catch (err) {
      console.warn(`⚠️ [SAFEFIX_PLUS] Falla al cargar ${file}:`, err);
    }
  };

  // 🧩 Núcleo base (corregido)
  injectScript("theme_chapter_v2.js?v=20251106", "Modo claro/oscuro modular");
  injectScript("badge.js?v=20251102", "Badge motivacional persistente");

  console.log(
    "🧩 CFC_SYNC checkpoint: auto_injector.js | SAFEFIX_PLUS V8.2 OK",
    new Date().toLocaleString()
  );
})();

/* =========================================================
   ✅ CFC_FUNC_9_9_FIX_FINAL_V41.25 — Inyección botón “Continuar”
   🔒 QA-SYNC V41.25 — CFC-SYNC V9.0
========================================================= */

(function () {
  const script = document.createElement("script");
  script.src = "../../js/chapter_nav.js?v=20251107";
  script.defer = true;
  document.body.appendChild(script);

  console.log(
    "🧩 CFC_SYNC checkpoint:",
    "chapter_nav.js inyectado correctamente"
  );
})();

/* =========================================================
   🟣 SUBPASO 4.8 REAL — Registrar módulo actual COMPLETO
   🔥 CFC_STATS_V5.1_SUBPASO_4.8_REAL — 2025-12-09
   ---------------------------------------------------------
   ✔ Detecta módulo actual /modules/x/
   ✔ Guarda: número + nombre corto + nombre completo
   ✔ 100% aislado y sin afectar ningún otro sistema
========================================================= */

(function () {
  try {
    const match = window.location.pathname.match(/\/modules\/(\d+)(?:\/|$)/);
    if (!match) return;

    const moduleNumber = parseInt(match[1], 10);

    // Nombre corto
    const shortName = `Módulo ${moduleNumber}`;

    // Tabla oficial completa EXACTA que figura en modules/index.html
    const CFC_MODULES_FULL = {
      1: "Módulo 1 – Introducción a la Psicología del Trader",
      2: "Módulo 2 – Neurociencia del Trading",
      3: "Módulo 3 – Fundamentos de Psicología Profunda",
      4: "Módulo 4 – Modelo Mental del Trader Profesional",
      5: "Módulo 5 – Herramientas Avanzadas de Regulación Emocional",
      6: "Módulo 6 – Psicología de la Gestión del Capital",
      7: "Módulo 7 – Estrategias Psicológicas por Etapas",
      8: "Módulo 8 – Integración Estrategia–Psicología",
      9: "Módulo 9 – Casos de Estudio y Simulaciones Reales",
      10: "Módulo 10 – Optimización Mental y Rendimiento Peak",
      11: "Módulo 11 – Ecosistema de Apoyo y Herramientas",
      12: "Módulo 12 – Maestría Continua y Legado",
      13: "Módulo 13 – Psicología del Error y Reprogramación Mental",
      14: "Módulo 14 – El Mapa del Autocontrol Extremo",
      15: "Módulo 15 – Arquitectura del Trading Mental Automático",
      16: "Módulo 16 – Reversión Psicológica y Superación del Burnout",
      17: "Módulo 17 – Psicología del Trader de Alto Impacto",
      18: "Módulo 18 – La Mentalidad del Mentor Trader",
      19: "Módulo 19 – Integración Total Cuerpo–Mente–Mercado",
      20: "Módulo 20 – Legado Final del Trader Consciente"
    };

    const fullName = CFC_MODULES_FULL[moduleNumber];

    // Leer stats previo
    let stats = {};
    try {
      stats = JSON.parse(localStorage.getItem("CFC_stats") || "{}");
    } catch {
      stats = {};
    }

    // Guardado FULL
    stats.currentModuleNumber = moduleNumber;
    stats.currentModule = shortName;
    stats.currentModuleFullName = fullName;

    localStorage.setItem("CFC_stats", JSON.stringify(stats));

    console.log("📌 CFC_STATS_V5.1_SUBPASO_4.8_REAL — Módulo registrado:");
    console.log("   → Número:", moduleNumber);
    console.log("   → Corto :", shortName);
    console.log("   → Completo :", fullName);

  } catch (err) {
    console.error("❌ Error SUBPASO 4.8 REAL:", err);
  }
})();

/* =========================================================
   🔒 CFC_LOCK: V41.3-MOD_CURRENT-20251209
========================================================= */
