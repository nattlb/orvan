
const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const db = require('../db');

const {
  subirImagen,
  guardarImagen,
  borrarImagen,
} = require('../middleware/subida');

// Validar ID
const idValido = param('id')
  .isInt({ min: 1 })
  .withMessage('Identificador inválido.')
  .toInt();

// Validar datos
const validar = (req, res) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    res.status(400).json({
      error: errores.array()[0].msg,
    });
    return false;
  }

  return true;
};

// Reglas de validación
const reglas = [
  body('nombre')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres.'),

  body('especialidad')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('La especialidad debe tener entre 3 y 100 caracteres.'),

  body('especialidad_en')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La especialidad en inglés no puede superar los 100 caracteres.'),

  body('descripcion')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres.'),

  body('descripcion_en')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción en inglés no puede superar los 1000 caracteres.'),

  body('orden')
    .isInt({ min: 0, max: 1000 })
    .withMessage('El orden debe ser un número válido.')
    .toInt(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El estado debe ser válido.')
    .toBoolean(),

  body('quitarImagen')
    .optional()
    .isBoolean()
    .withMessage('El valor para quitar la imagen no es válido.')
    .toBoolean(),
];

// LISTAR INTEGRANTES
router.get('/', async (req, res, next) => {
  try {
    const [integrantes] = await db.query(
      `SELECT
        id,
        nombre,
        especialidad,
        especialidad_en,
        descripcion,
        descripcion_en,
        imagen,
        orden,
        activo
       FROM equipo
       ORDER BY orden ASC, id ASC`
    );

    res.json({ integrantes });
  } catch (e) {
    next(e);
  }
});

// CREAR INTEGRANTE
router.post('/', subirImagen, reglas, async (req, res, next) => {
  let imagen = null;

  try {
    if (!validar(req, res)) return;

    imagen = req.file ? guardarImagen(req.file) : null;

    const [resultado] = await db.query(
      `INSERT INTO equipo
       (
         nombre,
         especialidad,
         especialidad_en,
         descripcion,
         descripcion_en,
         imagen,
         orden,
         activo
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.nombre,
        req.body.especialidad,
        req.body.especialidad_en || null,
        req.body.descripcion,
        req.body.descripcion_en || null,
        imagen,
        req.body.orden,
        req.body.activo === undefined
          ? 1
          : (req.body.activo ? 1 : 0),
      ]
    );

    res.status(201).json({
      ok: true,
      id: resultado.insertId,
      mensaje: 'Integrante creado correctamente.',
    });
  } catch (e) {
    if (imagen) borrarImagen(imagen);

    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Ya existe un integrante con ese nombre.',
      });
    }

    next(e);
  }
});

// EDITAR INTEGRANTE
router.put('/:id', subirImagen, [idValido, ...reglas], async (req, res, next) => {
  let imagenNueva = null;

  try {
    if (!validar(req, res)) return;

    const [filas] = await db.query(
      'SELECT imagen FROM equipo WHERE id = ?',
      [req.params.id]
    );

    if (!filas.length) {
      return res.status(404).json({
        error: 'El integrante no existe.',
      });
    }

    const imagenAnterior = filas[0].imagen;
    let imagenFinal = imagenAnterior;

    if (req.file) {
      imagenNueva = guardarImagen(req.file);
      imagenFinal = imagenNueva;
    } else if (req.body.quitarImagen === true) {
      imagenFinal = null;
    }

    await db.query(
      `UPDATE equipo
       SET
         nombre = ?,
         especialidad = ?,
         especialidad_en = ?,
         descripcion = ?,
         descripcion_en = ?,
         imagen = ?,
         orden = ?,
         activo = ?
       WHERE id = ?`,
      [
        req.body.nombre,
        req.body.especialidad,
        req.body.especialidad_en || null,
        req.body.descripcion,
        req.body.descripcion_en || null,
        imagenFinal,
        req.body.orden,
        req.body.activo === undefined
          ? 1
          : (req.body.activo ? 1 : 0),
        req.params.id,
      ]
    );

    // Borrar imagen anterior después de actualizar la BD
    if (imagenNueva || imagenFinal === null) {
      borrarImagen(imagenAnterior);
    }

    res.json({
      ok: true,
      mensaje: 'Integrante actualizado correctamente.',
    });
  } catch (e) {
    if (imagenNueva) borrarImagen(imagenNueva);

    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Ya existe un integrante con ese nombre.',
      });
    }

    next(e);
  }
});

// ELIMINAR INTEGRANTE
router.delete('/:id', [idValido], async (req, res, next) => {
  try {
    if (!validar(req, res)) return;

    const [filas] = await db.query(
      'SELECT imagen FROM equipo WHERE id = ?',
      [req.params.id]
    );

    if (!filas.length) {
      return res.status(404).json({
        error: 'El integrante no existe.',
      });
    }

    await db.query(
      'DELETE FROM equipo WHERE id = ?',
      [req.params.id]
    );

    try {
      borrarImagen(filas[0].imagen);
    } catch (errorImagen) {
      console.error('No se pudo borrar la imagen:', errorImagen);
    }

    res.json({
      ok: true,
      mensaje: 'Integrante eliminado correctamente.',
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
