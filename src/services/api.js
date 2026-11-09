
// --------------------------------------------------
// SERVICIO CENTRALIZADO DE API - ORVAN
// --------------------------------------------------

// En GitHub Pages usamos el backend publicado en Render.
// En desarrollo usamos el proxy de React hacia localhost:4000.

const API_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://orvan-x9yv.onrender.com/api'
    : '/api';

// --------------------------------------------------
// TOKEN DE AUTENTICACIÓN
// --------------------------------------------------

export const obtenerToken = () =>
  localStorage.getItem('orvan_token');

// --------------------------------------------------
// SOLICITUDES A LA API
// --------------------------------------------------

export async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
  const cabeceras = {};
  const token = obtenerToken();

  if (token) {
    cabeceras.Authorization = `Bearer ${token}`;
  }

  // FormData se utiliza para subir archivos.
  const esFormulario =
    typeof FormData !== 'undefined' &&
    cuerpo instanceof FormData;

  if (cuerpo !== undefined && !esFormulario) {
    cabeceras['Content-Type'] = 'application/json';
  }

  let respuesta;

  try {
    respuesta = await fetch(`${API_BASE}${ruta}`, {
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
      'No se pudo conectar con el servidor de ORVAN. Probá nuevamente.'
    );

    error.status = 0;
    throw error;
  }

  // --------------------------------------------------
  // LEER RESPUESTA DEL SERVIDOR
  // --------------------------------------------------

  const tipoContenido =
    respuesta.headers.get('content-type') || '';

  let datos = {};

  if (tipoContenido.includes('application/json')) {
    datos = await respuesta.json().catch(() => ({}));
  } else {
    const texto = await respuesta.text().catch(() => '');

    if (texto) {
      datos.error = texto;
    }
  }

  // --------------------------------------------------
  // MANEJO DE ERRORES
  // --------------------------------------------------

  if (!respuesta.ok) {
    const error = new Error(
      datos.error ||
      `Ocurrió un error (${respuesta.status}). Probá de nuevo.`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}
