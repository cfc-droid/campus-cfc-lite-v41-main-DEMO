/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V7.4C — CLOUDSAFE+ QA-SYNC
   Sistema: Campus CFC LITE V41-DEMO
   Autor: CFC-DROID | QA-SYNC V41.4 | 2025-11-11
   Objetivo: Sesión única con cierre automático y logging extendido
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

const logQA = (msg) =>
  console.log(`[QA_SYNC ${new Date().toLocaleTimeString()}] ${msg}`);

// ==========================================================
// 🔐 LOGIN — Crea sesión única y cierra las anteriores
// ==========================================================
export async function CFC_login(email, licenseKey) {
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim();
  const sessionId = makeSessionId();

  logQA(`🟡 Login iniciado para ${e}`);

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

  // 4️⃣ Guardar local
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  logQA(`✅ Sesión creada con ID ${sessionId}`);

  // 5️⃣ Iniciar monitor realtime
  startRealtimeMonitor(e, sessionId);

  // 6️⃣ Redirigir
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
// ⚡ MONITOR — QA-SYNC Directional (Cierre remoto en 100 ms)
// ==========================================================
export function startRealtimeMonitor(email, localSessionId) {
  logQA(`👁️ Iniciando monitor Realtime para ${email}`);

  supabase.removeAllChannels(); // Limpieza

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
        const newActive = payload?.new?.active_session;
        const oldSessionId = payload?.old?.session_id;

        // Log detallado QA
        logQA(
          `📡 Evento recibido: newSID=${newSessionId} | oldSID=${oldSessionId} | active=${newActive}`
        );

        // Cierra sesión local si detecta cambio de session_id
        if (newSessionId && newSessionId !== localSessionId) {
          logQA("🚨 Cambio remoto detectado → cerrando sesión local");
          localStorage.clear();
          alert("⚠️ Tu sesión se cerró porque iniciaste en otro dispositivo.");
          window.location.href = "../html/login.html";
        }
      }
    )
    .subscribe((status) => {
      logQA(`🟢 Estado del canal: ${status}`);
      if (status === "SUBSCRIBED") logQA("✅ Realtime suscrito correctamente");
    });

  // 🔁 Reconexión segura cada 45s (Cloudflare SAFE)
  setInterval(() => {
    if (channel.state !== "joined" && channel.state !== "subscribed") {
      logQA("🔄 Reintentando conexión Realtime...");
      channel.unsubscribe();
      startRealtimeMonitor(email, localSessionId);
    }
  }, 45000);
}

// ==========================================================
// ♻️ AUTOLOAD — Restaurar sesión previa si existe
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const e = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (e && sid) {
    logQA(`♻️ Restaurando sesión previa (${sid})`);
    startRealtimeMonitor(e, sid);
  }
});
