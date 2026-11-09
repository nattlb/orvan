
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// ==================== VALIDAR SESIÓN ====================

function verificarSesion(req, res, next) {
  const autorizacion = req.headers.authorization || '';

  if (!autorizacion.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Debés iniciar sesión para ver este proyecto.'
    });
  }

  const token = autorizacion.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      error: 'No se recibió un token de sesión.'
    });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'La sesión no es válida o ha vencido.'
    });
  }
}

// ==================== PROYECTOS PÚBLICOS ====================

// Los visitantes pueden ver las tarjetas de los proyectos,
// pero no los detalles completos ni los enlaces privados.
router.get('/', async (req, res, next) => {
  try {
    const [proyectos] = await db.query(
      `SELECT id, titulo, titulo_en,
              descripcion, descripcion_en,
              tecnologias, imagen
       FROM proyectos
       ORDER BY id ASC`
    );

    res.json({ proyectos });
  } catch (error) {
    next(error);
  }
});

// ==================== DETALLE PRIVADO ====================

// Solamente los usuarios con una sesión válida
// pueden consultar los detalles de un proyecto.
router.get('/:id', verificarSesion, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'El identificador del proyecto no es válido.'
      });
    }

    const [proyectos] = await db.query(
      `SELECT id, titulo, titulo_en,
              descripcion, descripcion_en,
              objetivo, caracteristicas,
              tecnologias, url_demo, url_repositorio,
              imagen
       FROM proyectos
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (proyectos.length === 0) {
      return res.status(404).json({
        error: 'No se encontró el proyecto solicitado.'
      });
    }

    const proyecto = proyectos[0];

    // Obtener las imágenes adicionales
    const [imagenes] = await db.query(
      `SELECT id, imagen, orden
       FROM proyecto_imagenes
       WHERE proyecto_id = ?
       ORDER BY orden ASC, id ASC`,
      [id]
    );

    proyecto.imagenes = imagenes;

    res.json({ proyecto });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
