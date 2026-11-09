
const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const db = require('../db');

const {
  subirImagen,
  guardarImagen,
  borrarImagen
} = require('../middleware/subida');

// --------------------------------------------------
// VALIDACIONES
// --------------------------------------------------

const idValido = param('id')
  .isInt({ min: 1 })
  .withMessage('Identificador inválido.')
  .toInt();

const validar = (req, res) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    res.status(400).json({
      error: errores.array()[0].msg
    });

    return false;
  }

  return true;
};

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

  body('descripcion')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres.'),

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
    .toBoolean()
];

// --------------------------------------------------
// ELIMINAR IMAGEN SIN INTERRUMPIR LA OPERACIÓN
// --------------------------------------------------

async function borrarImagenSeguro(ruta) {
  if (!ruta) return;

  try {
    await borrarImagen(ruta);
  } catch (error) {
    console.error(
      '[EQUIPO] No se pudo eliminar la imagen:',
      error.message
    );
  }
}

// --------------------------------------------------
// LISTAR INTEGRANTES
// GET /api/admin/equipo
// --------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    const [integrantes] = await db.query(
      `SELECT
        id,
        nombre,
        especialidad,
        descripcion,
        imagen,
        orden,
        activo
       FROM equipo
       ORDER BY orden ASC, id ASC`
    );

    res.json({ integrantes });
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// CREAR INTEGRANTE
// POST /api/admin/equipo
// --------------------------------------------------

router.post(
  '/',
  subirImagen,
  reglas,
  async (req, res, next) => {
    let imagen = null;

    try {
      if (!validar(req, res)) return;

      // Subir fotografía a Cloudinary.
      if (req.file) {
        imagen = await guardarImagen(req.file);
      }

      // Guardar URL en TiDB Cloud.
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
         VALUES (?, ?, NULL, ?, NULL, ?, ?, ?)`,
        [
          req.body.nombre,
          req.body.especialidad,
          req.body.descripcion,
          imagen,
          req.body.orden,
          req.body.activo === undefined
            ? 1
            : (req.body.activo ? 1 : 0)
        ]
      );

      res.status(201).json({
        ok: true,
        id: resultado.insertId,
        mensaje: 'Integrante creado correctamente.'
      });

    } catch (error) {
      // Si falla la base de datos, eliminar la imagen nueva.
      await borrarImagenSeguro(imagen);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          error: 'Ya existe un integrante con ese nombre.'
        });
      }

      next(error);
    }
  }
);

// --------------------------------------------------
// EDITAR INTEGRANTE
// PUT /api/admin/equipo/:id
// --------------------------------------------------

router.put(
  '/:id',
  subirImagen,
  [idValido, ...reglas],
  async (req, res, next) => {
    let imagenNueva = null;

    try {
      if (!validar(req, res)) return;

      const [filas] = await db.query(
        'SELECT imagen, activo FROM equipo WHERE id = ?',
        [req.params.id]
      );

      if (!filas.length) {
        return res.status(404).json({
          error: 'El integrante no existe.'
        });
      }

      const imagenAnterior = filas[0].imagen;
      const activoAnterior = filas[0].activo;

      let imagenFinal = imagenAnterior;

      // Subir una fotografía nueva.
      if (req.file) {
        imagenNueva = await guardarImagen(req.file);
        imagenFinal = imagenNueva;

      } else if (req.body.quitarImagen === true) {
        // Quitar la fotografía sin eliminar al integrante.
        imagenFinal = null;
      }

      const activoFinal =
        req.body.activo === undefined
          ? activoAnterior
          : (req.body.activo ? 1 : 0);

      // Actualizar los datos en TiDB Cloud.
      await db.query(
        `UPDATE equipo
         SET
           nombre = ?,
           especialidad = ?,
           especialidad_en = NULL,
           descripcion = ?,
           descripcion_en = NULL,
           imagen = ?,
           orden = ?,
           activo = ?
         WHERE id = ?`,
        [
          req.body.nombre,
          req.body.especialidad,
          req.body.descripcion,
          imagenFinal,
          req.body.orden,
          activoFinal,
          req.params.id
        ]
      );

      // Eliminar la fotografía anterior después
      // de actualizar correctamente la base de datos.
      if (
        imagenAnterior &&
        imagenAnterior !== imagenFinal
      ) {
        await borrarImagenSeguro(imagenAnterior);
      }

      res.json({
        ok: true,
        mensaje: 'Integrante actualizado correctamente.'
      });

    } catch (error) {
      // Si falla la actualización, conservar la imagen anterior.
      if (imagenNueva) {
        await borrarImagenSeguro(imagenNueva);
      }

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          error: 'Ya existe un integrante con ese nombre.'
        });
      }

      next(error);
    }
  }
);

// --------------------------------------------------
// ELIMINAR INTEGRANTE
// DELETE /api/admin/equipo/:id
// --------------------------------------------------

router.delete(
  '/:id',
  [idValido],
  async (req, res, next) => {
    try {
      if (!validar(req, res)) return;

      const [filas] = await db.query(
        'SELECT imagen FROM equipo WHERE id = ?',
        [req.params.id]
      );

      if (!filas.length) {
        return res.status(404).json({
          error: 'El integrante no existe.'
        });
      }

      const imagenAnterior = filas[0].imagen;

      // Eliminar integrante de TiDB Cloud.
      await db.query(
        'DELETE FROM equipo WHERE id = ?',
        [req.params.id]
      );

      // Eliminar fotografía de Cloudinary.
      await borrarImagenSeguro(imagenAnterior);

      res.json({
        ok: true,
        mensaje: 'Integrante eliminado correctamente.'
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
