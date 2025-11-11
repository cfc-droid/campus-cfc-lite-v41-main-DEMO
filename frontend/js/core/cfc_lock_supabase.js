/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V6.1 — BLOQUEO PREVENTIVO REAL
   Sistema: Campus CFC LITE V41-DEMO
   Autor: CFC-DROID | QA-SYNC V41.6 | 2025-11-11
   Objetivo: Sesión única sin realtime, estable en Cloudflare
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
   🔐 LOGIN — Bloquea si ya hay sesión activa
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim();
  const sessionId = makeSessionId();

  console.log("🔐 Intentando login Supabase:", e, k);

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

  // 🚫 Verificar si ya hay una sesión activa
  if (row.active_session && row.session_id) {
    alert(
      "⚠️ Tu cuenta ya está activa en otro dispositivo.\nCerrá la sesión anterior antes de volver a ingresar."
    );
    return;
  }

  // ✅ Registrar nueva sesión
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

  window.location.href = "../index.html";
}

/* ==========================================================
   🔒 LOGOUT — Finaliza sesión manual
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
   ♻️ AUTOLOAD — No usa realtime
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  console.log("♻️ CFC_LOCK_SUPABASE_V6.1 activo (modo bloqueo preventivo).");
});
