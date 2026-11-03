// Reglas de validación. Se usan en Contacto y en el Registro / Login.
// Cada regla devuelve true si está bien, o el mensaje de error.
// "todos" son los valores del formulario completo (sirve para comparar campos entre sí).
export const REGLAS = {
  nombre: (v) =>
    /^[A-Za-zÁÉÍÓÚáéíóúÑñ' ]{3,60}$/.test(v.trim()) || 'Ingresá tu nombre (solo letras, mínimo 3).',
  email: (v) =>
    (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && v.trim().length <= 120) || 'Ingresá un email válido.',
  tipo: (v) => !!v || 'Elegí un tipo de consulta.',
  mensaje: (v) =>
    (v.trim().length >= 10 && v.length <= 1000) || 'El mensaje debe tener entre 10 y 1000 caracteres.',
  clave: (v) => /^(?=.*\d).{8,64}$/.test(v) || 'Mínimo 8 caracteres y al menos un número.',
  confirmar: (v, todos) => v === todos.clave || 'Las contraseñas no coinciden.',
};

// Valida UN campo. Devuelve el mensaje de error, o '' si está bien.
export function validarCampo(campo, valores) {
  const regla = REGLAS[campo];
  if (!regla) return '';
  const r = regla(valores[campo] ?? '', valores);
  return r === true ? '' : r;
}

// Valida varios campos. Devuelve { campo: 'mensaje' } solo con los que fallaron.
export function validar(valores, campos) {
  const errores = {};
  campos.forEach((c) => {
    const e = validarCampo(c, valores);
    if (e) errores[c] = e;
  });
  return errores;
}

// Fuerza de una contraseña: 0 (vacía), 1 débil, 2 media, 3 fuerte
export function fuerzaClave(v) {
  if (!v) return 0;
  let puntos = 0;
  if (v.length >= 8) puntos++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) puntos++;
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) puntos++;
  return Math.max(puntos, 1);
}
