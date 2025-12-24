/* ============================================================
   PEA CATALOGS — INMUTABLE (FINAL)
   Sistema: Análisis (PEA)
   Naturaleza: Auditoría operativa (no humana)
   NOTA:
   - El sistema guarda SOLO las claves
   - Las descripciones son SOLO para UI
   - El motor nunca interpreta texto
   ============================================================ */

/* =========================
   MOMENTO OPERATIVO
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
   PENSAMIENTOS (INTERPRETACIÓN)
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
  "Mi trabajo es ejecutar, no adivinar": "Separación entre proceso y resultado.",
  "Una operación no define el día": "Desacople emocional.",
  "El riesgo está controlado": "Conciencia del riesgo asumido.",
  "No necesito operar ahora": "Ausencia de urgencia.",
  "Espero mi setup": "Paciencia operativa.",
  "Ejecuto sin expectativa": "Neutralidad frente al resultado.",
  "El resultado es irrelevante, importa la ejecución": "Foco en conducta.",
  "Prefiero perder la oportunidad que romper el plan": "Priorización de reglas.",
  "El mercado va a seguir ahí": "Reducción de urgencia.",
  "Mi ventaja está en esperar": "Conciencia estratégica.",
  "Hoy no es un día claro": "Evaluación de contexto desfavorable."
});

/* =========================
   ESTADO OPERATIVO
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
  Calma: "Estado neutro, sin presión.",
  Foco: "Atención alineada al plan.",

  Urgencia: "Sensación de apuro.",
  Ansiedad: "Activación elevada.",
  Miedo: "Anticipación negativa.",
  Inseguridad: "Falta de certeza.",
  Duda: "Oscilación decisional.",

  Euforia: "Elevación emocional.",
  "Exceso de confianza": "Sobreestimación de capacidad.",

  Rabia: "Reacción emocional intensa.",
  Frustración: "Choque expectativa–resultado.",
  Desilusión: "Caída anímica.",
  "Cansancio mental": "Fatiga cognitiva.",

  Estabilidad: "Estado sin oscilación emocional.",
  Serenidad: "Calma sostenida.",
  Paciencia: "Capacidad de esperar sin urgencia.",
  Aceptación: "Aceptación del riesgo y del resultado.",
  "Neutralidad operativa": "Ausencia de carga emocional.",

  Bloqueo: "Dificultad para ejecutar.",
  Saturación: "Exceso de estímulos.",
  Hiperfoco: "Atención excesiva en un solo punto.",
  Desatención: "Falta de foco en variables clave.",
  Automatismo: "Ejecución sin análisis consciente."
});

/* =========================
   ACCIONES OPERATIVAS
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

  "Reducí riesgo",
  "Salí por regla externa"
]);

export const PEA_ACCIONES_DESC = Object.freeze({
  "Cumplí plan": "Ejecución alineada al plan.",

  "Entré tarde": "Entrada fuera del timing.",
  "Entré antes": "Entrada anticipada.",
  "Entré sin señal": "Entrada sin setup.",

  "Moví stop": "Modificación del stop.",
  "Aumenté tamaño": "Incremento de riesgo.",
  "Reduje tamaño": "Reducción del tamaño.",
  "No respeté tamaño": "Desviación del riesgo.",

  "Cerré antes": "Salida anticipada.",
  "Cerré tarde": "Salida demorada.",
  "Dejé correr pérdida": "No se respetó el stop.",

  "Re-entré sin señal": "Nueva entrada sin criterio.",
  "Sobreoperé": "Exceso de operaciones.",
  "Operé fuera de horario": "Fuera del plan temporal.",

  "No operé sin señal": "Decisión consciente de no ejecutar.",
  "Respeté el stop": "El stop no fue modificado.",
  "Respeté el tamaño": "Riesgo ejecutado según plan.",
  "Esperé confirmación": "Entrada validada por reglas.",
  "Cancelé operación inválida": "Setup descartado correctamente.",
  "Cerré según plan": "Salida definida previamente.",
  "No re-entré": "Evitó sobreoperar.",
  "Operé solo en horario": "Respeto del marco temporal.",
  "Ejecuté sin interferencia": "Ejecución limpia.",

  "Reducí riesgo": "Disminución voluntaria del riesgo.",
  "Salí por regla externa": "Salida por condición objetiva predefinida."
});

/* =========================
   RESULTADO
   ========================= */

export const PEA_RESULTADOS = Object.freeze([
  "Ganancia",
  "Pérdida",
  "BE",
  "NA"
]);

/* =========================
   RIESGO / BENEFICIO
   ========================= */

export const PEA_RIESGO_PLANIFICADO = Object.freeze([
  "0.25","0.5","0.75","1","2","3","4","5","6","7","8","9","10",">10"
]);

export const PEA_RIESGO_PLANIFICADO_DESC = Object.freeze({
  "0.25": "Relación beneficio/riesgo muy baja.",
  "0.5": "Relación beneficio/riesgo baja.",
  "0.75": "Relación beneficio/riesgo moderada baja.",
  "1": "Riesgo = beneficio.",
  "2": "Beneficio duplica el riesgo.",
  "3": "Beneficio triplica el riesgo.",
  "4": "Alta relación B/R.",
  "5": "Muy alta relación B/R.",
  "6": "Relación extrema.",
  "7": "Relación extrema.",
  "8": "Relación extrema.",
  "9": "Relación extrema.",
  "10": "Relación extrema.",
  ">10": "Fuera de escala habitual."
});

/* ============================================================
   REGLAS DEL CATÁLOGO
   - Si no está acá, no existe
   - Se guarda SOLO la clave
   - No se edita en runtime
   ============================================================ */
