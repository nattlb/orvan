
// Todas las llamadas al servidor pasan por acá.
// En desarrollo, "proxy" en package.json redirige /api → http://localhost:4000

export const obtenerToken = () => localStorage.getItem('orvan_token');

export async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
  const cabeceras = {};
  const token = obtenerToken();

  if (token) {
    cabeceras.Authorization = `Bearer ${token}`;
  }

  // Si el cuerpo es FormData, el navegador configura el Content-Type.
  const esFormulario =
    typeof FormData !== 'undefined' && cuerpo instanceof FormData;

  if (cuerpo !== undefined && !esFormulario) {
    cabeceras['Content-Type'] = 'application/json';
  }

  let respuesta;

  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body:
        cuerpo === undefined
          ? undefined
          : esFormulario
            ? cuerpo
            : JSON.stringify(cuerpo),
    });
  } catch {
    const error = new Error(
      'No se pudo conectar con el servidor. ¿Está encendido?'
    );

    error.status = 0;
    throw error;
  }

  // Intentamos leer la respuesta como JSON.
  const tipoContenido = respuesta.headers.get('content-type') || '';

  let datos = {};

  if (tipoContenido.includes('application/json')) {
    datos = await respuesta.json().catch(() => ({}));
  } else {
    const texto = await respuesta.text().catch(() => '');
    if (texto) datos.error = texto;
  }

  // Conservamos el código HTTP para que otros archivos
  // puedan distinguir entre errores 401, 403, 500, etc.
  if (!respuesta.ok) {
    const error = new Error(
      datos.error || `Ocurrió un error (${respuesta.status}). Probá de nuevo.`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}
