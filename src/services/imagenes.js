
const URL_SERVIDOR =
  process.env.NODE_ENV === 'production'
    ? 'https://orvan-x9yv.onrender.com'
    : 'http://localhost:4000';

export function obtenerImagen(ruta) {
  if (!ruta || typeof ruta !== 'string') {
    return '';
  }

  const imagen = ruta.trim();

  if (
    imagen.startsWith('http://') ||
    imagen.startsWith('https://') ||
    imagen.startsWith('data:') ||
    imagen.startsWith('blob:')
  ) {
    return imagen;
  }

  if (
    imagen.startsWith('/uploads/') ||
    imagen.startsWith('uploads/')
  ) {
    return URL_SERVIDOR + '/' + imagen.replace(/^\/+/, '');
  }

  return (
    (process.env.PUBLIC_URL || '').replace(/\/$/, '') +
    '/' +
    imagen.replace(/^\/+/, '')
  );
}
