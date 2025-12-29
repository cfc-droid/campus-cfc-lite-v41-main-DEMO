/* =========================================================
   PEA — HASH DE INTEGRIDAD
   Archivo: pea_hash.js
   Rol: generar firma SHA-256 local para exports
   ========================================================= */

export async function generatePEAHash(inputString) {
  if (typeof inputString !== "string") {
    throw new Error("Hash input inválido");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(inputString);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return hashHex;
}
