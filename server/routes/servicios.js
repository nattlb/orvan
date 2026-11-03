const router = require('express').Router();
const db = require('../db');

// ---------- GET /api/servicios (público) ----------
router.get('/', async (req, res, next) => {
  try {
    const [servicios] = await db.query(
      `SELECT
        id,
        titulo,
        titulo_en,
        descripcion,
        descripcion_en
       FROM servicios
       ORDER BY id ASC`
    );

    res.json({ servicios });
  } catch (e) {
    next(e);
  }
});

module.exports = router;