/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V6.1_AUTO_RESET — Sesión única estable
   Sistema: Campus CFC LITE V41-DEMO
   Auditor: QA-SYNC — 2025-11-11
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const nowISO = () => new Date().toISOString();
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN — Bloqueo + limpieza automática
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim();
  const sessionId = makeSessionId();

  console.log("🔐 Intentando login Supabase:", e, k);

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
    alert("❌ Email o licencia inválida.");
    return;
  }

  // 2️⃣ Limpiar sesiones antiguas (+2 h)
  const lastUpdate = new Date(row.updated_at || 0).getTime();
  const twoHours = 1000 * 60 * 60 * 2;
  const now = Date.now();

  if (row.active_session && now - lastUpdate > twoHours) {
    console.warn("🧹 Sesión expirada detectada (>2 h), limpiando...");
    await supabase
      .from("licenses")
      .update({
        active_session: false,
        session_id: null,
        updated_at: nowISO(),
      })
      .eq("email", e);
    row.active_session = false;
  }

  // 3️⃣ Verificar si sigue activa
  if (row.active_session && row.session_id) {
    alert(
      "⚠️ Tu cuenta ya está activa en otro dispositivo.\nCerrá la sesión anterior antes de volver a ingresar."
    );
    return;
  }

  // 4️⃣ Registrar nueva sesión
  const { error: updateError } = await supabase
    .from("licenses")
    .update({
      active_session: true,
      session_id: sessionId,
      updated_at: nowISO(),
    })
    .eq("id", row.id);

  if (updateError) {
    alert("❌ Error al registrar la sesión.");
    console.error(updateError);
    return;
  }

  // 5️⃣ Guardar local y redirigir
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada:", sessionId);
  window.location.href = "../index.html";
}

/* ==========================================================
   🔒 LOGOUT — Manual o al salir del Campus
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
   ♻️ AUTOLOAD + AUTOLOGOUT en cierre de pestaña
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  console.log("♻️ CFC_LOCK_SUPABASE_V6.1_AUTO_RESET activo (modo estable).");

  // 🔁 Logout automático al cerrar pestaña/navegador
  window.addEventListener("beforeunload", async () => {
    const email = localStorage.getItem("CFC_EMAIL");
    if (email) {
      await supabase
        .from("licenses")
        .update({
          active_session: false,
          session_id: null,
          updated_at: nowISO(),
        })
        .eq("email", email);
      localStorage.clear();
    }
  });
});
