/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V2 — Control de sesión Realtime
   Sistema: Campus CFC LITE V41-DEMO (Cloudflare SAFE)
   Auditor: QA-SYNC — 2025-11-11
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ==========================================================
   🔹 Configuración Supabase
   ========================================================== */
const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
const nowISO = () => new Date().toISOString();
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN — Activa la sesión y guarda el session_id
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const sessionId = makeSessionId();

  const { data, error } = await supabase
    .from("licenses")
    .update({
      active_session: true,
      session_id: sessionId,
      updated_at: nowISO(),
    })
    .eq("email", email)
    .eq("license_key", licenseKey)
    .select("*")
    .single();

  if (error || !data) {
    alert("❌ Licencia o email inválidos");
    console.error(error);
    return;
  }

  // ✅ Guardar localmente
  localStorage.setItem("CFC_EMAIL", email);
  localStorage.setItem("CFC_LICENSE", licenseKey);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada:", sessionId);

  // ✅ Iniciar monitor Realtime
  startRealtimeMonitor(email, sessionId);

  // ✅ Redirigir al Dashboard
  window.location.href = "../index.html";
}

/* ==========================================================
   🔒 LOGOUT — Cierra la sesión actual
   ========================================================== */
export async function CFC_logout() {
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
  alert("🔒 Sesión cerrada correctamente.");
  window.location.href = "../html/login.html";
}

/* ==========================================================
   ⚡ MONITOR EN TIEMPO REAL
   ========================================================== */
export function startRealtimeMonitor(email, localSessionId) {
  console.log("👁️ Monitor Supabase activo para:", email);

  supabase
    .channel("realtime:licenses")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "licenses",
        filter: `email=eq.${email}`,
      },
      (payload) => {
        const remote = payload.new.session_id;
        const active = payload.new.active_session;

        // 🚨 Detecta inicio desde otro dispositivo
        if (remote !== localSessionId && active) {
          console.warn("🚨 Sesión duplicada detectada");
          localStorage.clear();
          alert("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
          window.location.href = "../html/login.html";
        }
      }
    )
    .subscribe((status) => {
      console.log("🟢 Canal Realtime conectado:", status);
    });
}

/* ==========================================================
   🧩 AUTOINICIO — si ya hay sesión local
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("CFC_EMAIL");
  const sessionId = localStorage.getItem("CFC_SESSION_ID");
  if (email && sessionId) startRealtimeMonitor(email, sessionId);
});
