/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V6.3 — Sesión Única Realtime + Fallback Local
   Sistema: Campus CFC LITE V41-DEMO
   Auditor: QA-SYNC — 2025-11-11
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const nowISO = () => new Date().toISOString();
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN — Crea sesión única y cierra las anteriores
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const sessionId = makeSessionId();
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim();

  console.log("🔐 Intentando login Supabase CLOUDSAFE:", e, k);

  const { data: rows, error: lookupError } = await supabase
    .from("licenses")
    .select("id,email,license_key,active_session,session_id");

  if (lookupError) {
    alert("Error de conexión con Supabase.");
    return;
  }

  const row = rows.find(
    (r) =>
      r.email.trim().toLowerCase() === e &&
      (r.license_key.trim() === k || String(Number(r.license_key)) === k)
  );

  if (!row) {
    alert("❌ Email o licencia inválida.");
    return;
  }

  // 🔄 Fuerza update en el registro del usuario
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
    alert("Error al actualizar sesión en Supabase.");
    return;
  }

  // 🧠 Guardar localmente
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada correctamente:", sessionId);

  // 🕐 Delay pequeño para permitir que el evento Realtime llegue al cliente anterior
  setTimeout(() => {
    startRealtimeMonitor(e, sessionId);
  }, 1500);

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
   ⚡ MONITOR — Detecta cambio de sesión y cierra la vieja
   ========================================================== */
export function startRealtimeMonitor(email, localSessionId) {
  console.log("👁️ Monitor activo para:", email);

  const channel = supabase
    .channel("licenses-monitor")
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
        console.log("🔁 Evento Realtime recibido:", remoteSID, active);

        if (active && remoteSID && remoteSID !== localSessionId) {
          console.warn("🚨 Sesión reemplazada — cierre automático local");
          localStorage.clear();
          alert("⚠️ Tu sesión fue cerrada automáticamente porque iniciaste en otro dispositivo.");
          window.location.href = "../html/login.html";
        }
      }
    )
    .subscribe((status) => {
      console.log("🟢 Canal Realtime conectado:", status);
    });

  // 🧩 Fallback: chequeo local cada 15 s
  setInterval(async () => {
    const { data, error } = await supabase
      .from("licenses")
      .select("session_id,active_session")
      .eq("email", email)
      .single();

    if (!error && data?.session_id && data.session_id !== localSessionId) {
      console.warn("🧨 Fallback detectó sesión remota activa — cierre local");
      localStorage.clear();
      alert("⚠️ Tu sesión fue cerrada automáticamente (detección local).");
      window.location.href = "../html/login.html";
    }
  }, 15000);
}

/* ==========================================================
   🧩 AUTOLOAD — Restaura sesión previa
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (email && sid) startRealtimeMonitor(email, sid);
});
