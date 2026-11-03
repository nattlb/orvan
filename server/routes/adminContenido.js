
const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const db = require('../db');

const {
  subirImagen,
  guardarImagen,
  borrarImagen,
} = require('../middleware/subida');

// ====================== FUNCIONES AUXILIARES ======================

const primerError = (req) => {
  const errores = validationResult(req);

  return errores.isEmpty()
    ? null
    : errores.array()[0].msg;
};

const idValido = param('id')
  .isInt({ min: 1 })
  .withMessage('Identificador inválido.')
  .toInt();

const manejarError = (error, res, next) => {
  if (error.status) {
    return res.status(error.status).json({
      error: error.message,
    });
  }

  next(error);
};

// El borrado de un archivo no debe interrumpir la respuesta de la API.
const borrarImagenSeguro = (imagen) => {
  if (!imagen) return;

  try {
    borrarImagen(imagen);
  } catch (error) {
    console.error('No se pudo borrar la imagen:', error);
  }
};

// ====================== PROYECTOS ======================

const reglasProyecto = [
  body('titulo')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres.'),

  body('descripcion')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres.'),

  body('tecnologias')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Las tecnologías no pueden superar los 200 caracteres.'),

  body('url_demo')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La URL es demasiado larga.')
    .bail()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false,
    })
    .withMessage('La URL debe comenzar con http:// o https://'),

  body('quitarImagen')
    .optional()
    .isBoolean()
    .withMessage('El valor para quitar la imagen no es válido.')
    .toBoolean(),
];

// LISTAR PROYECTOS
router.get('/proyectos', async (req, res, next) => {
  try {
    const [proyectos] = await db.query(
      `SELECT id, titulo, descripcion, tecnologias,
              url_demo, imagen, creado_en
       FROM proyectos
       ORDER BY id ASC`
    );

    res.json({ proyectos });
  } catch (error) {
    next(error);
  }
});

// CREAR PROYECTO
router.post(
  '/proyectos',
  subirImagen,
  reglasProyecto,
  async (req, res, next) => {
    let imagen = null;

    try {
      const error = primerError(req);

      if (error) {
        return res.status(400).json({ error });
      }

      imagen = req.file ? guardarImagen(req.file) : null;

      const [resultado] = await db.query(
        `INSERT INTO proyectos
         (titulo, descripcion, tecnologias, url_demo, imagen)
         VALUES (?, ?, ?, ?, ?)`,
        [
          req.body.titulo,
          req.body.descripcion,
          req.body.tecnologias || '',
          req.body.url_demo || null,
          imagen,
        ]
      );

      res.status(201).json({
        ok: true,
        id: resultado.insertId,
        mensaje: 'Proyecto creado correctamente.',
      });
    } catch (error) {
      if (imagen) borrarImagenSeguro(imagen);

      manejarError(error, res, next);
    }
  }
);

// EDITAR PROYECTO
router.put(
  '/proyectos/:id',
  subirImagen,
  [idValido, ...reglasProyecto],
  async (req, res, next) => {
    let imagenNueva = null;

    try {
      const error = primerError(req);

      if (error) {
        return res.status(400).json({ error });
      }

      const [filas] = await db.query(
        'SELECT imagen FROM proyectos WHERE id = ?',
        [req.params.id]
      );

      if (!filas.length) {
        return res.status(404).json({
          error: 'El proyecto no existe.',
        });
      }

      const imagenAnterior = filas[0].imagen;
      let imagenFinal = imagenAnterior;

      // Reemplazar imagen
      if (req.file) {
        imagenNueva = guardarImagen(req.file);
        imagenFinal = imagenNueva;
      }

      // Quitar imagen
      else if (req.body.quitarImagen === true) {
        imagenFinal = null;
      }

      await db.query(
        `UPDATE proyectos
         SET titulo = ?, descripcion = ?, tecnologias = ?,
             url_demo = ?, imagen = ?
         WHERE id = ?`,
        [
          req.body.titulo,
          req.body.descripcion,
          req.body.tecnologias || '',
          req.body.url_demo || null,
          imagenFinal,
          req.params.id,
        ]
      );

      // La actualización terminó correctamente.
      // Ahora sí podemos borrar la imagen anterior.
      if (imagenNueva || imagenFinal === null) {
        borrarImagenSeguro(imagenAnterior);
      }

      res.json({
        ok: true,
        mensaje: 'Proyecto actualizado correctamente.',
      });
    } catch (error) {
      // Si falla la actualización, conservamos la imagen anterior
      // y eliminamos únicamente la imagen nueva.
      if (imagenNueva) borrarImagenSeguro(imagenNueva);

      manejarError(error, res, next);
    }
  }
);

// ELIMINAR PROYECTO
router.delete(
  '/proyectos/:id',
  idValido,
  async (req, res, next) => {
    try {
      const error = primerError(req);

      if (error) {
        return res.status(400).json({ error });
      }

      const [filas] = await db.query(
        'SELECT imagen FROM proyectos WHERE id = ?',
        [req.params.id]
      );

      if (!filas.length) {
        return res.status(404).json({
          error: 'El proyecto no existe.',
        });
      }

      await db.query(
        'DELETE FROM proyectos WHERE id = ?',
        [req.params.id]
      );

      borrarImagenSeguro(filas[0].imagen);

      res.json({
        ok: true,
        mensaje: 'Proyecto eliminado correctamente.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// ====================== SERVICIOS ======================

const reglasServicio = [
  body('titulo')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres.'),

  body('descripcion')
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres.'),
];

// LISTAR SERVICIOS
router.get('/servicios', async (req, res, next) => {
  try {
    const [servicios] = await db.query(
      `SELECT id, titulo, descripcion
       FROM servicios
       ORDER BY id ASC`
    );

    res.json({ servicios });
  } catch (error) {
    next(error);
  }
});

// CREAR SERVICIO
router.post(
  '/servicios',
  reglasServicio,
  async (req, res, next) => {
    try {
      const error = primerError(req);

      if (error) {
        return res.status(400).json({ error });
      }

      const [resultado] = await db.query(
        'INSERT INTO servicios (titulo, descripcion) VALUES (?, ?)',
        [
          req.body.titulo,
          req.body.descripcion,
        ]
      );

      res.status(201).json({
        ok: true,
        id: resultado.insertId,
        mensaje: 'Servicio creado correctamente.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// EDITAR SERVICIO
router.put(
  '/servicios/:id',
  [idValido, ...reglasServicio],
  async (req, res, next) => {
    try {
      const error = primerError(req);

      if (error) {
        return res.status(400).json({ error });
      }

      const [existentes] = await db.query(
        'SELECT id FROM servicios WHERE id = ?',
        [req.params.id]
      );

      if (!existentes.length) {
        return res.status(404).json({
          error: 'El servicio no existe.',
        });
      }

      await db.query(
        `UPDATE servicios
         SET titulo = ?, descripcion = ?
         WHERE id = ?`,
        [
          req.body.titulo,
          req.body.descripcion,
          req.params.id,
        ]
      );

      res.json({
        ok: true,
        mensaje: 'Servicio actualizado correctamente.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// ELIMINAR SERVICIO
router.delete(
  '/servicios/:id',
  idValido,
  async (req, res, next) => {
    try {
      const error = primerError(req);

      if (error) {
        return res.status(400).json({ error });
      }

      const [resultado] = await db.query(
        'DELETE FROM servicios WHERE id = ?',
        [req.params.id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          error: 'El servicio no existe.',
        });
      }

      res.json({
        ok: true,
        mensaje: 'Servicio eliminado correctamente.',
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
