
const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const db = require('../db');

const {
  subirGaleria,
  guardarImagen,
  borrarImagen
} = require('../middleware/subida');

// ==================================================
// FUNCIONES AUXILIARES
// ==================================================

const MAX_GALERIA = 15;

const primerError = (req) => {
  const errores = validationResult(req);
  return errores.isEmpty() ? null : errores.array()[0].msg;
};

const idValido = param('id')
  .isInt({ min: 1 })
  .withMessage('Identificador inválido.')
  .toInt();

const manejarError = (error, res, next) => {
  if (error.status) {
    return res.status(error.status).json({
      error: error.message
    });
  }

  next(error);
};

// Eliminar imágenes de Cloudinary sin interrumpir
// las operaciones de la base de datos.
async function borrarImagenSeguro(imagen) {
  if (!imagen) return;

  try {
    await borrarImagen(imagen);
  } catch (error) {
    console.error(
      '[CONTENIDO] No se pudo borrar la imagen:',
      error.message
    );
  }
}

async function borrarVariasImagenes(imagenes) {
  for (const imagen of imagenes) {
    await borrarImagenSeguro(imagen);
  }
}

const crearError = (mensaje, status = 400) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const textoOpcional = (valor) =>
  typeof valor === 'string' ? valor.trim() : '';

const archivosGaleria = (req) =>
  req.files?.galeria || [];

const archivoPrincipal = (req) =>
  req.files?.imagen?.[0] || null;

// ==================================================
// VALIDAR IMÁGENES
// ==================================================

function imagenValida(file) {
  const buf = file.buffer;

  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return true;
  }

  if (
    buf.length >= 8 &&
    buf.subarray(0, 8).equals(
      Buffer.from([
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a
      ])
    )
  ) {
    return true;
  }

  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return true;
  }

  return false;
}

function validarArchivos(req) {
  const archivos = [
    ...(archivoPrincipal(req) ? [archivoPrincipal(req)] : []),
    ...archivosGaleria(req)
  ];

  if (archivos.some((archivo) => !imagenValida(archivo))) {
    throw crearError(
      'Uno de los archivos no es una imagen JPG, PNG o WEBP válida.'
    );
  }
}

// ==================================================
// IMÁGENES DE GALERÍA
// ==================================================

function obtenerIdsEliminar(valor) {
  if (!valor) return [];

  let ids;

  try {
    ids = JSON.parse(valor);
  } catch {
    throw crearError(
      'La lista de imágenes a eliminar no es válida.'
    );
  }

  if (
    !Array.isArray(ids) ||
    ids.length > MAX_GALERIA ||
    ids.some((id) => !Number.isSafeInteger(id) || id < 1)
  ) {
    throw crearError(
      'Los identificadores de imágenes no son válidos.'
    );
  }

  return [...new Set(ids)];
}

async function obtenerGaleria(proyectoId, conexion = db) {
  const [imagenes] = await conexion.query(
    `SELECT id, proyecto_id, imagen, orden
     FROM proyecto_imagenes
     WHERE proyecto_id = ?
     ORDER BY orden ASC, id ASC`,
    [proyectoId]
  );

  return imagenes;
}

async function obtenerProyectos() {
  const [proyectos] = await db.query(
    `SELECT id, titulo, titulo_en,
            descripcion, descripcion_en,
            objetivo, caracteristicas,
            tecnologias, url_demo, url_repositorio,
            imagen, creado_en
     FROM proyectos
     ORDER BY id ASC`
  );

  for (const proyecto of proyectos) {
    proyecto.imagenes = await obtenerGaleria(proyecto.id);
  }

  return proyectos;
}

// ==================================================
// VALIDACIONES DE PROYECTOS
// ==================================================

const reglasProyecto = [
  body('titulo')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage(
      'El título debe tener entre 3 y 100 caracteres.'
    ),

  body('descripcion')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage(
      'La descripción debe tener entre 10 y 1000 caracteres.'
    ),

  body('objetivo')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 3000 })
    .withMessage(
      'El objetivo no puede superar los 3000 caracteres.'
    ),

  body('caracteristicas')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 5000 })
    .withMessage(
      'Las características no pueden superar los 5000 caracteres.'
    ),

  body('tecnologias')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage(
      'Las tecnologías no pueden superar los 200 caracteres.'
    ),

  body('url_demo')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage(
      'La URL de la demo es demasiado larga.'
    )
    .bail()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false
    })
    .withMessage(
      'La demo debe tener una URL HTTP o HTTPS válida.'
    ),

  body('url_repositorio')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage(
      'La URL del repositorio es demasiado larga.'
    )
    .bail()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false
    })
    .withMessage(
      'El repositorio debe tener una URL HTTP o HTTPS válida.'
    ),

  body('quitarImagen')
    .optional()
    .isBoolean()
    .withMessage(
      'El valor para quitar la imagen no es válido.'
    )
    .toBoolean()
];

// ==================================================
// LISTAR PROYECTOS
// ==================================================

router.get('/proyectos', async (req, res, next) => {
  try {
    const proyectos = await obtenerProyectos();

    res.json({ proyectos });
  } catch (error) {
    next(error);
  }
});

// ==================================================
// CREAR PROYECTO
// ==================================================

router.post(
  '/proyectos',
  subirGaleria,
  reglasProyecto,
  async (req, res, next) => {
    const archivosGuardados = [];

    let conexion;
    let transaccion = false;

    try {
      const error = primerError(req);

      if (error) {
        return res.status(400).json({ error });
      }

      validarArchivos(req);

      if (archivosGaleria(req).length > MAX_GALERIA) {
        throw crearError(
          'Solo se permiten 15 imágenes adicionales.'
        );
      }

      let imagenPrincipal = null;

      // Subir imagen principal a Cloudinary.
      if (archivoPrincipal(req)) {
        imagenPrincipal = await guardarImagen(
          archivoPrincipal(req)
        );

        archivosGuardados.push(imagenPrincipal);
      }

      // Subir imágenes de galería.
      const imagenesNuevas = [];

      for (const archivo of archivosGaleria(req)) {
        const ruta = await guardarImagen(archivo);

        archivosGuardados.push(ruta);
        imagenesNuevas.push(ruta);
      }

      // Iniciar transacción en TiDB Cloud.
      conexion = await db.getConnection();
      await conexion.beginTransaction();
      transaccion = true;

      const [resultado] = await conexion.query(
        `INSERT INTO proyectos
         (
           titulo,
           descripcion,
           objetivo,
           caracteristicas,
           tecnologias,
           url_demo,
           url_repositorio,
           imagen
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.titulo,
          req.body.descripcion,
          textoOpcional(req.body.objetivo),
          textoOpcional(req.body.caracteristicas),
          textoOpcional(req.body.tecnologias),
          textoOpcional(req.body.url_demo) || null,
          textoOpcional(req.body.url_repositorio) || null,
          imagenPrincipal
        ]
      );

      const proyectoId = resultado.insertId;

      for (let i = 0; i < imagenesNuevas.length; i++) {
        await conexion.query(
          `INSERT INTO proyecto_imagenes
           (proyecto_id, imagen, orden)
           VALUES (?, ?, ?)`,
          [
            proyectoId,
            imagenesNuevas[i],
            i
          ]
        );
      }

      await conexion.commit();
      transaccion = false;

      res.status(201).json({
        ok: true,
        id: proyectoId,
        mensaje: 'Proyecto creado correctamente.'
      });

    } catch (error) {
      if (transaccion && conexion) {
        try {
          await conexion.rollback();
        } catch (rollbackError) {
          console.error(
            'Error al revertir proyecto:',
            rollbackError
          );
        }
      }

      // Si falla la operación, limpiar las imágenes nuevas.
      await borrarVariasImagenes(archivosGuardados);

      manejarError(error, res, next);

    } finally {
      if (conexion) conexion.release();
    }
  }
);

// ==================================================
// EDITAR PROYECTO
// ==================================================

router.put(
  '/proyectos/:id',
  subirGaleria,
  [idValido, ...reglasProyecto],
  async (req, res, next) => {
    const archivosGuardados = [];
    const archivosParaBorrar = [];

    let conexion;
    let transaccion = false;

    try {
      const error = primerError(req);

      if (error) {
        return res.status(400).json({ error });
      }

      validarArchivos(req);

      const idsEliminar = obtenerIdsEliminar(
        req.body.imagenesEliminar
      );

      conexion = await db.getConnection();
      await conexion.beginTransaction();
      transaccion = true;

      const [filas] = await conexion.query(
        `SELECT imagen
         FROM proyectos
         WHERE id = ?
         FOR UPDATE`,
        [req.params.id]
      );

      if (!filas.length) {
        throw crearError(
          'El proyecto no existe.',
          404
        );
      }

      const imagenAnterior = filas[0].imagen;
      let imagenFinal = imagenAnterior;

      const galeriaActual = await obtenerGaleria(
        req.params.id,
        conexion
      );

      const imagenesEliminar = galeriaActual.filter(
        (item) => idsEliminar.includes(item.id)
      );

      if (imagenesEliminar.length !== idsEliminar.length) {
        throw crearError(
          'Una de las imágenes seleccionadas no pertenece al proyecto.'
        );
      }

      const cantidadFinal =
        galeriaActual.length -
        imagenesEliminar.length +
        archivosGaleria(req).length;

      if (cantidadFinal > MAX_GALERIA) {
        throw crearError(
          'Un proyecto puede tener como máximo 15 imágenes adicionales.'
        );
      }

      // Reemplazar imagen principal.
      if (archivoPrincipal(req)) {
        imagenFinal = await guardarImagen(
          archivoPrincipal(req)
        );

        archivosGuardados.push(imagenFinal);

        if (imagenAnterior) {
          archivosParaBorrar.push(imagenAnterior);
        }

      } else if (req.body.quitarImagen === true) {
        imagenFinal = null;

        if (imagenAnterior) {
          archivosParaBorrar.push(imagenAnterior);
        }
      }

      await conexion.query(
        `UPDATE proyectos
         SET titulo = ?,
             descripcion = ?,
             objetivo = ?,
             caracteristicas = ?,
             tecnologias = ?,
             url_demo = ?,
             url_repositorio = ?,
             imagen = ?
         WHERE id = ?`,
        [
          req.body.titulo,
          req.body.descripcion,
          textoOpcional(req.body.objetivo),
          textoOpcional(req.body.caracteristicas),
          textoOpcional(req.body.tecnologias),
          textoOpcional(req.body.url_demo) || null,
          textoOpcional(req.body.url_repositorio) || null,
          imagenFinal,
          req.params.id
        ]
      );

      // Quitar imágenes seleccionadas de la galería.
      for (const item of imagenesEliminar) {
        await conexion.query(
          `DELETE FROM proyecto_imagenes
           WHERE id = ? AND proyecto_id = ?`,
          [item.id, req.params.id]
        );

        archivosParaBorrar.push(item.imagen);
      }

      const restantes = galeriaActual.filter(
        (item) => !idsEliminar.includes(item.id)
      );

      let orden = restantes.reduce(
        (maximo, item) => Math.max(maximo, item.orden),
        -1
      ) + 1;

      // Agregar nuevas imágenes a la galería.
      for (const archivo of archivosGaleria(req)) {
        const ruta = await guardarImagen(archivo);

        archivosGuardados.push(ruta);

        await conexion.query(
          `INSERT INTO proyecto_imagenes
           (proyecto_id, imagen, orden)
           VALUES (?, ?, ?)`,
          [
            req.params.id,
            ruta,
            orden
          ]
        );

        orden++;
      }

      await conexion.commit();
      transaccion = false;

      // Borrar las imágenes antiguas solamente
      // después de confirmar los cambios.
      await borrarVariasImagenes(archivosParaBorrar);

      res.json({
        ok: true,
        mensaje: 'Proyecto actualizado correctamente.'
      });

    } catch (error) {
      if (transaccion && conexion) {
        try {
          await conexion.rollback();
        } catch (rollbackError) {
          console.error(
            'Error al revertir cambios:',
            rollbackError
          );
        }
      }

      await borrarVariasImagenes(archivosGuardados);

      manejarError(error, res, next);

    } finally {
      if (conexion) conexion.release();
    }
  }
);

// ==================================================
// ELIMINAR PROYECTO
// ==================================================

router.delete(
  '/proyectos/:id',
  idValido,
  async (req, res, next) => {
    let conexion;
    let transaccion = false;

    try {
      const error = primerError(req);

      if (error) {
        return res.status(400).json({ error });
      }

      conexion = await db.getConnection();
      await conexion.beginTransaction();
      transaccion = true;

      const [filas] = await conexion.query(
        `SELECT imagen
         FROM proyectos
         WHERE id = ?
         FOR UPDATE`,
        [req.params.id]
      );

      if (!filas.length) {
        throw crearError(
          'El proyecto no existe.',
          404
        );
      }

      const galeria = await obtenerGaleria(
        req.params.id,
        conexion
      );

      await conexion.query(
        'DELETE FROM proyectos WHERE id = ?',
        [req.params.id]
      );

      await conexion.commit();
      transaccion = false;

      // Eliminar fotografías de Cloudinary.
      await borrarImagenSeguro(filas[0].imagen);

      await borrarVariasImagenes(
        galeria.map((item) => item.imagen)
      );

      res.json({
        ok: true,
        mensaje: 'Proyecto eliminado correctamente.'
      });

    } catch (error) {
      if (transaccion && conexion) {
        try {
          await conexion.rollback();
        } catch (rollbackError) {
          console.error(
            'Error al revertir eliminación:',
            rollbackError
          );
        }
      }

      manejarError(error, res, next);

    } finally {
      if (conexion) conexion.release();
    }
  }
);

// ==================================================
// SERVICIOS
// ==================================================
// Conservamos la administración original de servicios.

const reglasServicio = [
  body('titulo')
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage(
      'El título debe tener entre 3 y 100 caracteres.'
    ),

  body('descripcion')
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage(
      'La descripción debe tener entre 10 y 500 caracteres.'
    )
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
        `INSERT INTO servicios
         (titulo, descripcion)
         VALUES (?, ?)`,
        [
          req.body.titulo,
          req.body.descripcion
        ]
      );

      res.status(201).json({
        ok: true,
        id: resultado.insertId,
        mensaje: 'Servicio creado correctamente.'
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
          error: 'El servicio no existe.'
        });
      }

      await db.query(
        `UPDATE servicios
         SET titulo = ?,
             descripcion = ?
         WHERE id = ?`,
        [
          req.body.titulo,
          req.body.descripcion,
          req.params.id
        ]
      );

      res.json({
        ok: true,
        mensaje: 'Servicio actualizado correctamente.'
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
          error: 'El servicio no existe.'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Servicio eliminado correctamente.'
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
