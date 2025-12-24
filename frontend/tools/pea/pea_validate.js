export function validatePEAForm() {
  const momento = document.getElementById("momento").value;
  const instrumento = document.getElementById("instrumento").value.trim();
  const direccion = document.querySelector("input[name='direccion']:checked");
  const pensamiento = document.getElementById("pensamiento").value;
  const estado = document.getElementById("estado").value;
  const intensidad = document.querySelector("input[name='intensidad']:checked");
  const acciones = document.querySelectorAll("#acciones input:checked");

  if (!momento) return false;
  if (!instrumento) return false;
  if (!direccion) return false;
  if (!pensamiento) return false;
  if (!estado) return false;
  if (!intensidad) return false;
  if (acciones.length === 0) return false;

  return true;
}
