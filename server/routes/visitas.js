const router = require('express').Router();
const db = require('../db');

// ---------- POST /api/visitas (público) ----------
// La página lo llama una vez por sesión del navegador: es el contador de visitas generales.
router.post('/', async (req, res, next) => {
  try {
    await db.query('INSERT INTO visitas () VALUES ()');
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
