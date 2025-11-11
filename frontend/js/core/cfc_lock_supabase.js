/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V6.2 — Sesión Única Realtime + Cloudflare SAFE + CORS FIX
   Sistema: Campus CFC LITE V41-DEMO
   Auditor: QA-SYNC — 2025-11-11
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ==========================================================
   🌐 Configuración Supabase (modo seguro Cloudflare)
   ========================================================== */
const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

/* 🧩 FIX — Autenticación reforzada con cabeceras CORS seguras */
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  },
});

/* ==========================================================
   🕓 Utilidades
   ========================================================== */
const nowISO = () => new Date().toISOString();
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN — Crea sesión única y cierra las anteriores
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const sessionId = makeSessionId();
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim();

  console.log("🔐 Intentando login Supabase CLOUDSAFE:", e, k);

  // 1️⃣ Buscar licencia válida
  const { data: rows, error: lookupError } = await supabase
    .from("licenses")
    .select("id,email,license_key,active_session,session_id");

  if (lookupError) {
    console.error("❌ Error al consultar Supabase:", lookupError);
    alert("Error de conexión con Supabase (CORS o clave).");
    return;
  }

  const row = rows?.find((r) => {
    const dbEmail = String(r.email || "").trim().toLowerCase();
    const dbKey = String(r.license_key || "").trim();
    return (
      dbEmail === e &&
      (dbKey === k || dbKey === String(Number(k)) || String(Number(dbKey)) === k)
    );
  });

  if (!row) {
    alert("❌ Email o licencia inválida.");
    return;
  }

  // 2️⃣ Cerrar sesiones anteriores del mismo usuario
  await supabase
    .from("licenses")
    .update({
      active_session: false,
      session_id: null,
      updated_at: nowISO(),
    })
    .eq("email", e);

  // 3️⃣ Registrar nueva sesión activa
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
    alert("Error al registrar sesión en Supabase.");
    return;
  }

  // 4️⃣ Guardar localmente
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada correctamente:", sessionId);

  // 5️⃣ Activar monitor Realtime
  startRealtimeMonitor(e, sessionId);

  // 6️⃣ Redirigir
  window.location.href = "../index.html";
}

/* ==========================================================
   🔒 LOGOUT — Finaliza sesión manual o remota
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
   ⚡ MONITOR — Cierra si otro dispositivo inicia sesión
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
    .subscribe((status) => {
      console.log("🟢 Canal Realtime conectado:", status);
    });

  setInterval(() => {
    if (channel.state !== "joined") {
      console.warn("🔄 Reintentando conexión Realtime...");
      startRealtimeMonitor(email, localSessionId);
    }
  }, 60000);
}

/* ==========================================================
   🧩 AUTOLOAD — Restaura sesión previa y mantiene monitor
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (email && sid) {
    console.log("♻️ Restaurando sesión previa:", sid);
    startRealtimeMonitor(email, sid);
  }
});
