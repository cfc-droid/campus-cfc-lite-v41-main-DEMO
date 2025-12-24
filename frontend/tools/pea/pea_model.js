/* ============================================================
   PEA MODEL — ESTRUCTURA CENTRAL (INMUTABLE)
   Sistema: Análisis (PEA)
   Bloque: 4/14 — MODELO DE DATOS
   Naturaleza: Auditoría operativa (no humana)

   REGLAS:
   - Este archivo define QUÉ es un registro
   - No contiene lógica
   - No contiene UI
   - No interpreta datos
   - Es la fuente única de verdad estructural
   ============================================================ */

/* =========================
   VERSIÓN DEL SCHEMA
   ========================= */

export const PEA_SCHEMA_VERSION = "PEA_SCHEMA_V1";

/* =========================
   ESTRUCTURA BASE DEL REGISTRO
   ========================= */

export const PEARecordTemplate = Object.freeze({
  schemaVersion: PEA_SCHEMA_VERSION,

  /* =========================
     IDENTIDAD DEL REGISTRO
     ========================= */
  id: "",                 // string único (ej: timestamp + random)
  createdAtISO: "",        // ISO string (new Date().toISOString())

  /* =========================
     CONTEXTO OPERATIVO
     ========================= */
  momento: "",             // ANTES | DURANTE | DESPUÉS
  instrumento: "",         // string corto (ej: EURUSD, BTC, SPX)
  direccion: "",           // LONG | SHORT | ND

  /* =========================
     RESULTADO Y RIESGO
     ========================= */
  resultado: "",           // Ganancia | Pérdida | BE | NA
  riesgoPlanificado: "",   // valores del catálogo PEA_RIESGO_PLANIFICADO

  /* =========================
     P — PENSAMIENTO
     ========================= */
  P: {
    pensamientoKey: "",    // clave exacta del catálogo
    planDefinido: false,   // boolean
    reglaAplicada: ""      // string corto (opcional, no lógico)
  },

  /* =========================
     E — ESTADO OPERATIVO
     ========================= */
  E: {
    estadoKey: "",         // clave exacta del catálogo
    intensidad: 0          // número entero 1–5
  },

  /* =========================
     A — ACCIÓN
     ========================= */
  A: {
    accionesKeys: [],      // array de claves del catálogo
    accionMasCostosa: ""   // una sola clave (opcional)
  },

  /* =========================
     NOTA FACTUAL (NO LÓGICA)
     ========================= */
  nota180: "",             // string ≤ 180 chars (NO se usa en lógica)

  /* =========================
     CAMPOS COMPUTADOS
     (rellenados por el motor)
     ========================= */
  computed: {
    patrones: [],          // máx. 2 strings
    riesgoScore: null,     // number | null
    riesgoLabel: "",       // Bajo | Medio | Alto | Crítico | ""
    accionesCorrectivas: []// reglas operativas (strings)
  }
});

/* =========================
   REGLAS DEL MODELO
   =========================
   - Todos los campos existen siempre
   - Si un dato no aplica → string vacío / null / []
   - No se agregan campos dinámicos
   - No se eliminan campos
   - Cambios incompatibles → nueva versión de schema
   ============================================================ */
