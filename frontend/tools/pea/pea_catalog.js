/* ============================================================
   PEA CATALOGS — INMUTABLE (FINAL)
   Sistema: Análisis (PEA)
   Naturaleza: Auditoría operativa (no humana)

   REGLAS ABSOLUTAS:
   - El sistema guarda SOLO las claves
   - Las descripciones (*_DESC) son SOLO para UI
   - El motor NUNCA interpreta texto
   - Si no está acá, no existe
   ============================================================ */


/* ============================================================
   0) FECHA (NO ES CATÁLOGO)
   ============================================================
   - Campo obligatorio para guardar registro
   - Formato: YYYY-MM-DD (string)
   - NO se guarda hora
   - NO se interpreta calendario
   - Evidencia cronológica mínima
   ============================================================ */

export const PEA_FECHA_FORMAT = "YYYY-MM-DD";


/* =========================
   1) MOMENTO OPERATIVO
   ========================= */

export const PEA_MOMENTOS = Object.freeze([
  "ANTES",
  "DURANTE",
  "DESPUÉS"
]);

export const PEA_MOMENTOS_DESC = Object.freeze({
  ANTES: "Antes de ejecutar una operación.",
  DURANTE: "Mientras la operación está activa.",
  DESPUÉS: "Luego de cerrar la operación."
});


/* =========================
   2) PENSAMIENTOS (P)
   Lista cerrada — SIN OTRO
   ========================= */

export const PEA_PENSAMIENTOS = Object.freeze([
  // Urgencia / FOMO
  "Si espero pierdo la entrada",
  "Está yendo sin mí",
  "Tengo que entrar sí o sí",
  "Me la voy a perder",
  "No puedo quedarme afuera",

  // Recuperación / presión
  "No puedo volver a perder",
  "Debo recuperar",
  "Necesito recuperar lo perdido",
  "No puedo cerrar en pérdida",
  "Después de todo lo que perdí, esta tiene que salir",

  // Expectativa negativa
  "No lo voy a conseguir",
  "Seguro sale mal",
  "Esto nunca me sale",
  "Otra vez lo mismo",

  // Exceso de confianza
  "Esta vez es distinta",
  "Ahora sí lo tengo claro",
  "Ya entendí el mercado",
  "Hoy estoy fino",

  // Suposiciones
  "Seguro se da vuelta",
  "No puede seguir más",
  "Ya está estirado",
  "Tiene que corregir",

  // Relajación de reglas
  "No hace falta esperar la señal",
  "Puedo adelantarme",
  "No pasa nada si rompo una regla",
  "Después lo compenso",

  // Pensamientos operativos funcionales
  "Estoy siguiendo mi plan",
  "No hay señal, no opero",
  "Mi trabajo es ejecutar, no adivinar",
  "Una operación no define el día",
  "El riesgo está controlado",
  "No necesito operar ahora",
  "Espero mi setup",
  "Ejecuto sin expectativa",
  "El resultado es irrelevante, importa la ejecución",
  "Prefiero perder la oportunidad que romper el plan",
  "El mercado va a seguir ahí",
  "Mi ventaja está en esperar",
  "Hoy no es un día claro"
]);

export const PEA_PENSAMIENTOS_DESC = Object.freeze({
  "Si espero pierdo la entrada": "Urgencia por miedo a perder la oportunidad.",
  "Está yendo sin mí": "Sensación de quedar fuera del movimiento.",
  "Tengo que entrar sí o sí": "Presión interna por ejecutar.",
  "Me la voy a perder": "Miedo a no participar.",
  "No puedo quedarme afuera": "Necesidad de entrar.",
  "No puedo volver a perder": "Rechazo a aceptar otra pérdida.",
  "Debo recuperar": "Foco en recuperar pérdidas previas.",
  "Necesito recuperar lo perdido": "Carga emocional acumulada.",
  "No puedo cerrar en pérdida": "Resistencia al stop.",
  "Después de todo lo que perdí, esta tiene que salir": "Expectativa forzada.",
  "No lo voy a conseguir": "Anticipación negativa.",
  "Seguro sale mal": "Expectativa de fracaso.",
  "Esto nunca me sale": "Generalización negativa.",
  "Otra vez lo mismo": "Sensación de repetición.",
  "Esta vez es distinta": "Excepción subjetiva al plan.",
  "Ahora sí lo tengo claro": "Exceso de certeza.",
  "Ya entendí el mercado": "Sobreconfianza.",
  "Hoy estoy fino": "Euforia funcional.",
  "Seguro se da vuelta": "Suposición sin confirmación.",
  "No puede seguir más": "Límite imaginado.",
  "Ya está estirado": "Juicio subjetivo.",
  "Tiene que corregir": "Expectativa no validada.",
  "No hace falta esperar la señal": "Relajación del criterio.",
  "Puedo adelantarme": "Entrada anticipada.",
  "No pasa nada si rompo una regla": "Minimización del error.",
  "Después lo compenso": "Postergación del impacto.",
  "Estoy siguiendo mi plan": "Ejecución alineada a reglas.",
  "No hay señal, no opero": "Decisión consciente de no ejecutar.",
  "Mi trabajo es ejecutar, no adivinar": "Separación proceso–resultado.",
  "Una operación no define el día": "Desacople emocional.",
  "El riesgo está controlado": "Conciencia del riesgo asumido.",
  "No necesito operar ahora": "Ausencia de urgencia.",
  "Espero mi setup": "Paciencia operativa.",
  "Ejecuto sin expectativa": "Neutralidad operativa.",
  "El resultado es irrelevante, importa la ejecución": "Foco en conducta.",
  "Prefiero perder la oportunidad que romper el plan": "Priorización de reglas.",
  "El mercado va a seguir ahí": "Reducción de urgencia.",
  "Mi ventaja está en esperar": "Conciencia estratégica.",
  "Hoy no es un día claro": "Contexto desfavorable."
});


/* =========================
   3) ESTADO OPERATIVO (E)
   ========================= */

export const PEA_ESTADOS_OPERATIVOS = Object.freeze([
  "Calma",
  "Foco",
  "Urgencia",
  "Ansiedad",
  "Miedo",
  "Inseguridad",
  "Duda",
  "Euforia",
  "Exceso de confianza",
  "Rabia",
  "Frustración",
  "Desilusión",
  "Cansancio mental",
  "Estabilidad",
  "Serenidad",
  "Paciencia",
  "Aceptación",
  "Neutralidad operativa",
  "Bloqueo",
  "Saturación",
  "Hiperfoco",
  "Desatención",
  "Automatismo"
]);

export const PEA_ESTADOS_OPERATIVOS_DESC = Object.freeze({
  Calma: "Estado neutro.",
  Foco: "Atención alineada.",
  Urgencia: "Sensación de apuro.",
  Ansiedad: "Activación elevada.",
  Miedo: "Anticipación negativa.",
  Inseguridad: "Falta de certeza.",
  Duda: "Oscilación decisional.",
  Euforia: "Elevación emocional.",
  "Exceso de confianza": "Sobreestimación.",
  Rabia: "Reacción intensa.",
  Frustración: "Choque expectativa–resultado.",
  Desilusión: "Caída anímica.",
  "Cansancio mental": "Fatiga cognitiva.",
  Estabilidad: "Sin oscilación.",
  Serenidad: "Calma sostenida.",
  Paciencia: "Capacidad de esperar.",
  Aceptación: "Aceptación del riesgo.",
  "Neutralidad operativa": "Sin carga emocional.",
  Bloqueo: "Dificultad para ejecutar.",
  Saturación: "Exceso de estímulos.",
  Hiperfoco: "Atención excesiva.",
  Desatención: "Falta de foco.",
  Automatismo: "Ejecución automática."
});

export const PEA_INTENSIDADES = Object.freeze([1, 2, 3, 4, 5]);


/* =========================
   4) ACCIONES OPERATIVAS (A)
   ========================= */

export const PEA_ACCIONES = Object.freeze([
  "Cumplí plan",
  "Entré tarde",
  "Entré antes",
  "Entré sin señal",
  "Moví stop",
  "Aumenté tamaño",
  "Reduje tamaño",
  "No respeté tamaño",
  "Cerré antes",
  "Cerré tarde",
  "Dejé correr pérdida",
  "Re-entré sin señal",
  "Sobreoperé",
  "Operé fuera de horario",
  "No operé sin señal",
  "Respeté el stop",
  "Respeté el tamaño",
  "Esperé confirmación",
  "Cancelé operación inválida",
  "Cerré según plan",
  "No re-entré",
  "Operé solo en horario",
  "Ejecuté sin interferencia",
  "Reduje riesgo",
  "Salí por regla externa"
]);

export const PEA_ACCIONES_DESC = Object.freeze({
  "Cumplí plan": "Ejecución alineada.",
  "Entré tarde": "Timing incorrecto.",
  "Entré antes": "Anticipación.",
  "Entré sin señal": "Sin setup.",
  "Moví stop": "Stop modificado.",
  "Aumenté tamaño": "Riesgo mayor.",
  "Reduje tamaño": "Riesgo menor.",
  "No respeté tamaño": "Desviación.",
  "Cerré antes": "Salida anticipada.",
  "Cerré tarde": "Salida tardía.",
  "Dejé correr pérdida": "Stop no respetado.",
  "Re-entré sin señal": "Reentrada inválida.",
  "Sobreoperé": "Exceso de trades.",
  "Operé fuera de horario": "Fuera del plan.",
  "No operé sin señal": "Decisión correcta.",
  "Respeté el stop": "Stop intacto.",
  "Respeté el tamaño": "Riesgo correcto.",
  "Esperé confirmación": "Entrada validada.",
  "Cancelé operación inválida": "Setup descartado.",
  "Cerré según plan": "Salida prevista.",
  "No re-entré": "Evita sobreoperar.",
  "Operé solo en horario": "Marco respetado.",
  "Ejecuté sin interferencia": "Ejecución limpia.",
  "Reduje riesgo": "Riesgo reducido.",
  "Salí por regla externa": "Regla objetiva."
});


/* =========================
   5) RESULTADO
   ========================= */

export const PEA_RESULTADOS = Object.freeze([
  "Ganancia",
  "Pérdida",
  "BE",
  "NA"
]);


/* =========================
   6) CONTEXTO OPERATIVO
   ========================= */

export const PEA_ACTIVOS = Object.freeze([
  "Cripto",
  "Divisa",
  "Materia prima",
  "Futuros",
  "Acciones",
  "Índices",
  "OTROS"
]);

export const PEA_INSTRUMENTOS_POR_ACTIVO = Object.freeze({
  Cripto: [
    "Bitcoin",
    "Ethereum",
    "Altcoins"
  ],

  Divisa: [
    "EUR/USD",
    "GBP/USD",
    "USD/JPY",
    "AUD/USD",
    "USD/CAD",
    "USD/CHF",
    "OTRAS DIVISAS"
  ],

  "Materia prima": [
    "Oro",
    "Plata",
    "Petróleo",
    "Gas natural"
  ],

  Futuros: [
    "ES",
    "NQ",
    "YM",
    "RTY",
    "OTROS FUTUROS"
  ],

  Acciones: [
    "AAPL",
    "MSFT",
    "AMZN",
    "GOOGL",
    "TSLA",
    "META",
    "OTRAS ACCIONES"
  ],

  Índices: [
    "SP500",
    "NASDAQ",
    "DOW JONES",
    "DAX",
    "IBEX"
  ],

  OTROS: []
});

export const PEA_DIRECCION = Object.freeze([
  "COMPRA",
  "VENTA"
]);


/* =========================
   7) NOTA FACTUAL
   ========================= */

export const PEA_NOTA_MAX_CHARS = 180;


/* =========================
   8) RIESGO PLANIFICADO (B/R)
   ========================= */

export const PEA_RIESGO_PLANIFICADO = Object.freeze([
  "0.25","0.5","0.75","1","2","3","4","5","6","7","8","9","10",">10"
]);

export const PEA_RIESGO_PLANIFICADO_DESC = Object.freeze({
  "0.25": "B/R muy baja.",
  "0.5": "B/R baja.",
  "0.75": "B/R moderada baja.",
  "1": "Riesgo = beneficio.",
  "2": "Beneficio duplica riesgo.",
  "3": "Beneficio triplica riesgo.",
  "4": "Alta B/R.",
  "5": "Muy alta B/R.",
  "6": "Extrema.",
  "7": "Extrema.",
  "8": "Extrema.",
  "9": "Extrema.",
  "10": "Extrema.",
  ">10": "Fuera de escala."
});


/* ============================================================
   FIN DE CATÁLOGOS — BLOQUE 4 / 14
   Inmutable | Congelado | Auditable
   ============================================================ */

/* =========================
   9) MOMENTO ESTRUCTURAL
   =========================
   - Evento objetivo
   - No emocional
   - No participa en métricas
   - No participa en rankings
   - No se interpreta
*/

export const PEA_MOMENTOS_ESTRUCTURALES = Object.freeze([
  "SIN_MARCAR",
  "CAMBIO_DE_REGLAS",
  "INICIO_CUENTA_NUEVA",
  "CAMBIO_DE_MERCADO",
  "CAMBIO_DE_ACTIVO",
  "CAMBIO_DE_INSTRUMENTO",
  "NUEVA_ESTRATEGIA",
  "AJUSTE_ESTRATEGIA",
  "OPTIMIZACION_RIESGO",
  "CAMBIO_HORARIO",
  "CAMBIO_PLATAFORMA",
  "OTROS"
]);

export const PEA_MOMENTOS_ESTRUCTURALES_DESC = Object.freeze({
  SIN_MARCAR: "Sin evento estructural marcado.",
  CAMBIO_DE_REGLAS: "Cambio objetivo en reglas operativas.",
  INICIO_CUENTA_NUEVA: "Inicio de una cuenta nueva.",
  CAMBIO_DE_MERCADO: "Cambio de mercado operado.",
  CAMBIO_DE_ACTIVO: "Cambio de activo principal.",
  CAMBIO_DE_INSTRUMENTO: "Cambio de instrumento.",
  NUEVA_ESTRATEGIA: "Implementación de una nueva estrategia.",
  AJUSTE_ESTRATEGIA: "Ajuste sobre estrategia existente.",
  OPTIMIZACION_RIESGO: "Optimización del riesgo.",
  CAMBIO_HORARIO: "Cambio de horario operativo.",
  CAMBIO_PLATAFORMA: "Cambio de plataforma.",
  OTROS: "Otro evento estructural objetivo."
});
