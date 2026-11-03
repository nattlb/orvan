
const router = require('express').Router();
const db = require('../db');

// ---------- GET /api/proyectos ----------
// Consulta pública: cualquier visitante puede ver los proyectos.
router.get('/', async (req, res, next) => {
  try {
    const [filas] = await db.query(
      `SELECT
        id,
        titulo,
        titulo_en,
        descripcion,
        descripcion_en,
        tecnologias,
        url_demo,
        imagen
      FROM proyectos
      ORDER BY id ASC`
    );

    res.json({ proyectos: filas });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
