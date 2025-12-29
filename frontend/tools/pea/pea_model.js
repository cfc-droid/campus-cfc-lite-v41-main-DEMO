PEARecord = {
  id,                 // string único
  createdAtISO,       // ISO timestamp (evidencia técnica)

  fecha,              // YYYY-MM-DD (string)
  momento,            // "ANTES" | "DURANTE" | "DESPUÉS"

  activo,             // clave o string (OTROS)
  instrumento,        // clave o string (OTROS)
  direccion,          // "COMPRA" | "VENTA"

  P: {
    pensamiento_key   // string exacto del catálogo
  },

  E: {
    estado_key,       // string exacto del catálogo
    intensidad        // number: 1–5
  },

  A: {
    acciones_keys: [] // array de strings exactos del catálogo
  },

  resultado,          // "Ganancia" | "Pérdida" | "BE" | "NA"

  riesgo_planificado, // string (B/R)

  nota_factual,       // string ≤ 180 (opcional)

  meta: {
    schemaVersion: "PEA_SCHEMA_V1",
    snapshot_id: null,
    estado: "VALIDO" | "ANULADO" | "CORRECCION",
    referencia_id: null // solo si CORRECCION
  }
}
