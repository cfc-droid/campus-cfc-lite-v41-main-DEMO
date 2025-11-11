/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V6.2 — Cloudsafe + Force Override
   Sistema: Campus CFC LITE V41-DEMO
   Autor: CFC-DROID | QA-SYNC V41.6 | 2025-11-11
   Objetivo: Sesión única con opción de cierre remoto manual
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const nowISO = () => new Date().toISOString();
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN — Crea sesión única y permite forzar cierre remoto
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim();
  const sessionId = makeSessionId();

  console.log("🔐 Intentando login Supabase CLOUDSAFE:", e, k);

  const { data: rows, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("email", e);

  if (error) {
    console.error("❌ Error Supabase:", error);
    alert("Error de conexión con Supabase.");
    return;
  }

  const row = rows.find((r) => r.license_key === k);
  if (!row) {
    alert("❌ Email o licencia inválida.");
    return;
  }

  // 🚫 Si ya hay una sesión activa, ofrecer cierre remoto
  if (row.active_session && row.session_id) {
    const confirmar = confirm(
      "⚠️ Ya hay una sesión activa en otro dispositivo.\n¿Deseás cerrarla y continuar aquí?"
    );
    if (!confirmar) {
      alert("Operación cancelada. Cerrá la otra sesión primero.");
      return;
    }

    // 🧹 Forzar cierre remoto
    await supabase
      .from("licenses")
      .update({
        active_session: false,
        session_id: null,
        updated_at: nowISO(),
      })
      .eq("email", e);

    console.log("🧹 Sesión remota cerrada manualmente.");
  }

  // 🔄 Registrar nueva sesión
  const { error: updateError } = await supabase
    .from("licenses")
    .update({
      active_session: true,
      session_id: sessionId,
      updated_at: nowISO(),
    })
    .eq("id", row.id);

  if (updateError) {
    console.error("❌ Error al actualizar sesión:", updateError);
    alert("Error al registrar la sesión.");
    return;
  }

  // 💾 Guardar local
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada:", sessionId);

  startRealtimeMonitor(e, sessionId);
  window.location.href = "../index.html";
}

/* ==========================================================
   🔒 LOGOUT — Manual o remoto
   ========================================================== */
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

/* ==========================================================
   ⚡ MONITOR — Prevención Realtime
   ========================================================== */
export function startRealtimeMonitor(email, localSessionId) {
  console.log("👁️ Realtime activo para:", email);

  const channel = supabase
    .channel("licenses-stream")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "licenses",
        filter: `email=eq.${email}`,
      },
      (payload) => {
        const remoteSID = payload?.new?.session_id;
        const active = payload?.new?.active_session;
        if (active && remoteSID && remoteSID !== localSessionId) {
          console.warn("🚨 Sesión duplicada detectada (auto-cierre)");
          localStorage.clear();
          alert(
            "⚠️ Tu sesión fue cerrada automáticamente porque iniciaste en otro dispositivo."
          );
          window.location.href = "../html/login.html";
        }
      }
    )
    .subscribe((status) =>
      console.log("🟢 Canal Realtime conectado:", status)
    );

  // 🔁 Reconexión cada 60 s
  setInterval(() => {
    if (channel.state !== "joined") {
      console.warn("🔄 Reintentando conexión Realtime...");
      startRealtimeMonitor(email, localSessionId);
    }
  }, 60000);
}

/* ==========================================================
   ♻️ AUTOLOAD
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (email && sid) {
    console.log("♻️ Restaurando sesión previa:", sid);
    startRealtimeMonitor(email, sid);
  }
});
