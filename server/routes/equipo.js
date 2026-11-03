
const router = require('express').Router();
const db = require('../db');

// GET /api/equipo
// Mostrar integrantes activos en la página principal
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
        orden
       FROM equipo
       WHERE activo = 1
       ORDER BY orden ASC, id ASC`
    );

    res.json({ integrantes });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
