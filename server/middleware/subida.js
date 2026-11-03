// Subida de imágenes: solo JPG, PNG o WEBP, máximo 2 MB.
// Se valida DOS veces: el tipo que declara el navegador y los primeros bytes REALES del archivo
// (así no sirve renombrar un .pdf o un .exe a .jpg).
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CARPETA = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(CARPETA, { recursive: true });

const MAX_BYTES = 2 * 1024 * 1024;
const MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(), // el archivo queda en memoria hasta que lo validamos
  limits: { fileSize: MAX_BYTES, files: 1, fields: 10 },
  fileFilter: (req, file, cb) =>
    MIMES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP.')),
});

// Middleware: recibe el campo "imagen" y traduce los errores a mensajes claros
function subirImagen(req, res, next) {
  upload.single('imagen')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'La imagen no puede superar los 2 MB.' });
    if (err instanceof multer.MulterError) return res.status(400).json({ error: 'No se pudo procesar el archivo enviado.' });
    return res.status(400).json({ error: err.message });
  });
}

// Mira los primeros bytes del archivo para saber qué es realmente
function tipoReal(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

// Guarda la imagen con un nombre aleatorio (nunca el nombre que trae el archivo) y devuelve su ruta pública
function guardarImagen(file) {
  const ext = tipoReal(file.buffer);
  if (!ext) {
    const e = new Error('El archivo no es una imagen JPG, PNG o WEBP válida.');
    e.status = 400;
    throw e;
  }
  const nombre = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(CARPETA, nombre), file.buffer);
  return `/uploads/${nombre}`;
}

// Borra una imagen guardada (solo dentro de la carpeta uploads)
function borrarImagen(ruta) {
  if (!ruta || !ruta.startsWith('/uploads/')) return;
  fs.unlink(path.join(CARPETA, path.basename(ruta)), () => {});
}

module.exports = { subirImagen, guardarImagen, borrarImagen };
