
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CARPETA = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(CARPETA, { recursive: true });

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_GALERIA = 15;

const MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const configurarUpload = (cantidad) =>
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: MAX_BYTES,
      files: cantidad,
      fields: 20,
    },
    fileFilter: (req, file, cb) => {
      if (MIMES.includes(file.mimetype)) {
        return cb(null, true);
      }

      cb(new Error(
        'Solo se permiten imágenes JPG, PNG o WEBP.'
      ));
    },
  });

const uploadIndividual = configurarUpload(1);
const uploadGaleria = configurarUpload(MAX_GALERIA + 1);

// Manejo de errores de Multer
function procesarError(err, res, next) {
  if (!err) return next();

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Cada imagen puede pesar como máximo 2 MB.',
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Se superó la cantidad máxima de imágenes.',
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'No se pudieron procesar las imágenes.',
    });
  }

  return res.status(400).json({
    error: err.message,
  });
}

// Una imagen: mantiene compatibilidad con el sistema actual
function subirImagen(req, res, next) {
  uploadIndividual.single('imagen')(
    req,
    res,
    (err) => procesarError(err, res, next)
  );
}

// Imagen principal + hasta 15 imágenes adicionales
function subirGaleria(req, res, next) {
  uploadGaleria.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'galeria', maxCount: MAX_GALERIA },
  ])(
    req,
    res,
    (err) => procesarError(err, res, next)
  );
}

// Comprobar los bytes reales del archivo
function tipoReal(buf) {
  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return 'jpg';
  }

  if (
    buf.length >= 8 &&
    buf.subarray(0, 8).equals(
      Buffer.from([
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a,
      ])
    )
  ) {
    return 'png';
  }

  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

// Guardar imagen validada
function guardarImagen(file) {
  const ext = tipoReal(file.buffer);

  if (!ext) {
    const error = new Error(
      'El archivo no es una imagen JPG, PNG o WEBP válida.'
    );

    error.status = 400;
    throw error;
  }

  const nombre = `${crypto.randomBytes(12).toString('hex')}.${ext}`;

  fs.writeFileSync(
    path.join(CARPETA, nombre),
    file.buffer
  );

  return `/uploads/${nombre}`;
}

// Eliminar imagen dentro de uploads
function borrarImagen(ruta) {
  if (
    typeof ruta !== 'string' ||
    !ruta.startsWith('/uploads/')
  ) {
    return;
  }

  fs.unlink(
    path.join(CARPETA, path.basename(ruta)),
    (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error al borrar imagen:', err);
      }
    }
  );
}

module.exports = {
  subirImagen,
  subirGaleria,
  guardarImagen,
  borrarImagen,
};
