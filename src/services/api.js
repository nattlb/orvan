// Todas las llamadas al servidor pasan por acá.
// En desarrollo, "proxy" en package.json redirige /api → http://localhost:4000

export const obtenerToken = () => localStorage.getItem('orvan_token');

export async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
  const cabeceras = {};
  const token = obtenerToken();
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  // Si el cuerpo es un FormData (formulario con archivos), el navegador arma solo el Content-Type
  const esFormulario = typeof FormData !== 'undefined' && cuerpo instanceof FormData;
  if (cuerpo && !esFormulario) cabeceras['Content-Type'] = 'application/json';

  let respuesta;
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo ? (esFormulario ? cuerpo : JSON.stringify(cuerpo)) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está encendido?');
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error || 'Ocurrió un error. Probá de nuevo.');
  return datos;
}
