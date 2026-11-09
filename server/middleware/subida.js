
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_GALERIA = 15;

const MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

// CONFIGURAR MULTER
const configurarUpload = (cantidad) =>
  multer({
    storage: multer.memoryStorage(),

    limits: {
      fileSize: MAX_BYTES,
      files: cantidad,
      fields: 20
    },

    fileFilter: (req, file, cb) => {
      if (MIMES.includes(file.mimetype)) {
        return cb(null, true);
      }

      cb(
        new Error(
          'Solo se permiten imágenes JPG, PNG o WEBP.'
        )
      );
    }
  });

const uploadIndividual = configurarUpload(1);
const uploadGaleria = configurarUpload(MAX_GALERIA + 1);

// MANEJAR ERRORES DE MULTER
function procesarError(err, res, next) {
  if (!err) return next();

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Cada imagen puede pesar como máximo 2 MB.'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Se superó la cantidad máxima de imágenes.'
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'No se pudieron procesar las imágenes.'
    });
  }

  return res.status(400).json({
    error: err.message
  });
}

// SUBIR UNA IMAGEN
function subirImagen(req, res, next) {
  uploadIndividual.single('imagen')(
    req,
    res,
    (err) => procesarError(err, res, next)
  );
}

// SUBIR IMAGEN PRINCIPAL Y GALERÍA
function subirGaleria(req, res, next) {
  uploadGaleria.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'galeria', maxCount: MAX_GALERIA }
  ])(
    req,
    res,
    (err) => procesarError(err, res, next)
  );
}

// COMPROBAR EL TIPO REAL DE IMAGEN
function tipoReal(buf) {
  if (!Buffer.isBuffer(buf)) {
    return null;
  }

  // JPG
  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return 'jpg';
  }

  // PNG
  if (
    buf.length >= 8 &&
    buf.subarray(0, 8).equals(
      Buffer.from([
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a
      ])
    )
  ) {
    return 'png';
  }

  // WEBP
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

// GUARDAR IMAGEN EN CLOUDINARY
async function guardarImagen(file) {
  if (!file || !file.buffer) {
    throw new Error('No se recibió ninguna imagen.');
  }

  const ext = tipoReal(file.buffer);

  if (!ext) {
    const error = new Error(
      'El archivo no es una imagen JPG, PNG o WEBP válida.'
    );

    error.status = 400;
    throw error;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'orvan',
        resource_type: 'image',
        format: ext
      },
      (error, resultado) => {
        if (error) {
          console.error(
            '[CLOUDINARY] Error al subir imagen:',
            error.message
          );

          return reject(error);
        }

        if (!resultado || !resultado.secure_url) {
          return reject(
            new Error('Cloudinary no devolvió la URL de la imagen.')
          );
        }

        resolve(resultado.secure_url);
      }
    );

    stream.on('error', reject);
    stream.end(file.buffer);
  });
}

// OBTENER IDENTIFICADOR DE CLOUDINARY
function obtenerPublicId(ruta) {
  if (typeof ruta !== 'string') {
    return null;
  }

  try {
    const url = new URL(ruta);

    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'res.cloudinary.com'
    ) {
      return null;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    const prefijo = `/${cloudName}/image/upload/`;

    if (!url.pathname.startsWith(prefijo)) {
      return null;
    }

    let identificador = url.pathname.slice(prefijo.length);

    // Quitar versión de Cloudinary.
    identificador = identificador.replace(/^v\d+\//, '');

    // Solo permitimos eliminar imágenes de ORVAN.
    if (!identificador.startsWith('orvan/')) {
      return null;
    }

    // Quitar extensión.
    identificador = identificador.replace(
      /\.(jpg|jpeg|png|webp)$/i,
      ''
    );

    return identificador;
  } catch {
    return null;
  }
}

// ELIMINAR IMAGEN DE CLOUDINARY
async function borrarImagen(ruta) {
  const publicId = obtenerPublicId(ruta);

  if (!publicId) {
    // No borrar imágenes externas ni rutas antiguas.
    return;
  }

  const resultado = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true
  });

  if (
    resultado.result !== 'ok' &&
    resultado.result !== 'not found'
  ) {
    throw new Error(
      'No se pudo eliminar la imagen de Cloudinary.'
    );
  }
}

module.exports = {
  subirImagen,
  subirGaleria,
  guardarImagen,
  borrarImagen
};
