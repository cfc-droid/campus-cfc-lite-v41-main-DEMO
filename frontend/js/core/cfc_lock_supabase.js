/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V7.5C — CLOUDSAFE+ AUTO-FORCE DETECTOR
   Sistema: Campus CFC LITE V41-DEMO
   Autor: CFC-DROID | QA-SYNC V41.5 | 2025-11-11
   Objetivo: Cierre inmediato de sesión anterior (Realtime + Polling backup)
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
// ⚡ MONITOR — Cierre remoto + Backup por verificación periódica
// ==========================================================
export function startRealtimeMonitor(email, localSessionId) {
  logQA(`👁️ Iniciando monitor Realtime para ${email}`);
  supabase.removeAllChannels();

  // 🔹 Canal realtime principal
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
        const newSID = payload?.new?.session_id;
        const oldSID = payload?.old?.session_id;
        const active = payload?.new?.active_session;

        logQA(
          `📡 Evento realtime: oldSID=${oldSID}, newSID=${newSID}, active=${active}`
        );

        if (newSID && newSID !== localSessionId) {
          logQA("🚨 Detectado cambio de sesión realtime → cierre local");
          forceCloseSession();
        }
      }
    )
    .subscribe((status) => {
      logQA(`🟢 Estado del canal: ${status}`);
    });

  // 🔹 Backup: chequeo manual cada 10 s (por si falla el WS)
  setInterval(async () => {
    try {
      const { data } = await supabase
        .from("licenses")
        .select("session_id, active_session")
        .eq("email", email)
        .single();

      if (!data) return;
      const { session_id: remoteSID, active_session } = data;

      if (remoteSID && remoteSID !== localSessionId && active_session) {
        logQA("⚡ Detección por verificación manual → cierre local");
        forceCloseSession();
      }
    } catch (err) {
      logQA("⚠️ Error en verificación manual: " + err.message);
    }
  }, 10000);

  // 🔁 Reconexión Cloudflare cada 45 s
  setInterval(() => {
    if (channel.state !== "joined" && channel.state !== "subscribed") {
      logQA("🔄 Reintentando conexión Realtime...");
      channel.unsubscribe();
      startRealtimeMonitor(email, localSessionId);
    }
  }, 45000);
}

// ==========================================================
// 🔧 Cierre local forzado
// ==========================================================
function forceCloseSession() {
  localStorage.clear();
  alert("⚠️ Tu sesión se cerró porque iniciaste en otro dispositivo.");
  window.location.href = "../html/login.html";
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
