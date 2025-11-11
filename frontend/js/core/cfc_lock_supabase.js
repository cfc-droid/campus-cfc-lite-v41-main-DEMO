/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V7.3C — CLOUDSAFE+ DIRECTIONAL
   Sistema: Campus CFC LITE V41-DEMO
   Autor: CFC-DROID | QA-SYNC V41.3 | 2025-11-11
   Objetivo: Sesión única — cierre automático al iniciar desde otro dispositivo
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ==========================================================
// 🔑 Configuración Supabase
// ==========================================================
const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================================
// 🕒 Utilidades
// ==========================================================
const nowISO = () => new Date().toISOString();
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

// ==========================================================
// 🔐 LOGIN — Crea sesión única y cierra las anteriores
// ==========================================================
export async function CFC_login(email, licenseKey) {
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim();
  const sessionId = makeSessionId();

  console.log("🟡 Login iniciado:", e, k);

  // 1️⃣ Buscar licencia
  const { data: rows, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("email", e);

  if (error) {
    alert("❌ Error de conexión con Supabase.");
    console.error(error);
    return;
  }

  const row = rows.find((r) => r.license_key === k);
  if (!row) {
    alert("⚠️ Licencia o correo inválido.");
    return;
  }

  // 2️⃣ Cerrar sesiones previas
  await supabase
    .from("licenses")
    .update({
      active_session: false,
      session_id: null,
      updated_at: nowISO(),
    })
    .eq("email", e);

  // 3️⃣ Activar nueva sesión
  const { error: updateError } = await supabase
    .from("licenses")
    .update({
      active_session: true,
      session_id: sessionId,
      updated_at: nowISO(),
    })
    .eq("id", row.id);

  if (updateError) {
    alert("❌ No se pudo iniciar sesión.");
    console.error(updateError);
    return;
  }

  // 4️⃣ Guardar datos locales
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión creada:", sessionId);

  // 5️⃣ Iniciar monitor realtime
  startRealtimeMonitor(e, sessionId);

  // 6️⃣ Redirigir al Campus
  window.location.href = "../index.html";
}

// ==========================================================
// 🔒 LOGOUT — Manual o remoto
// ==========================================================
export async function CFC_logout(manual = true) {
  const email = localStorage.getItem("CFC_EMAIL");
  if (!email) return;

  await supabase
    .from("licenses")
    .update({
      active_session: false,
      session_id: null,
      updated_at: nowISO(),
    })
    .eq("email", email);

  localStorage.clear();
  if (manual) alert("🔒 Sesión cerrada correctamente.");
  window.location.href = "../html/login.html";
}

// ==========================================================
// ⚡ MONITOR — Cloudflare Safe+ Directional
// Cierra automáticamente si detecta otra sesión activa
// ==========================================================
export function startRealtimeMonitor(email, localSessionId) {
  console.log("👁️ Realtime activo para:", email);

  // 🔄 Limpieza previa (evita duplicaciones)
  supabase.removeAllChannels();

  // Canal individual por usuario
  const channel = supabase
    .channel(`licenses-${email}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "licenses",
        filter: `email=eq.${email}`,
      },
      (payload) => {
        const newSessionId = payload?.new?.session_id;
        const active = payload?.new?.active_session;

        // Cierra solo si se detecta una sesión nueva diferente
        if (active && newSessionId && newSessionId !== localSessionId) {
          console.warn("🚨 Sesión remota detectada → cierre local automático");
          localStorage.clear();
          alert("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
          window.location.href = "../html/login.html";
        }
      }
    )
    .subscribe((status) => {
      console.log("🟢 Canal Realtime:", status);
      if (status === "SUBSCRIBED") {
        console.log("✅ Suscripción confirmada para:", email);
      }
    });

  // 🔁 Reconexión segura cada 60 s (modo Cloudflare SAFE)
  setInterval(() => {
    if (channel.state !== "joined" && channel.state !== "subscribed") {
      console.warn("🔄 Reintentando conexión Realtime segura...");
      channel.unsubscribe();
      startRealtimeMonitor(email, localSessionId);
    }
  }, 60000);
}

// ==========================================================
// ♻️ AUTOLOAD — Restaurar sesión previa si existe
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const e = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (e && sid) {
    console.log("♻️ Restaurando sesión previa:", sid);
    startRealtimeMonitor(e, sid);
  }
});
