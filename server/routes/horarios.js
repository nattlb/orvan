
const router = require('express').Router();
const db = require('../db');

// =====================================
// OBTENER HORARIOS PÚBLICOS DEL ESTUDIO
// GET /api/horarios?fecha=2026-11-02
// =====================================

router.get('/', async (req, res, next) => {
  try {
    const { fecha } = req.query;

    // Validar la fecha enviada por el frontend.
    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (typeof fecha !== 'string' || !formatoFecha.test(fecha)) {
      return res.status(400).json({
        error: 'Ingresá una fecha válida.',
      });
    }

    const fechaValida = new Date(`${fecha}T00:00:00Z`);

    if (
      Number.isNaN(fechaValida.getTime()) ||
      fechaValida.toISOString().slice(0, 10) !== fecha
    ) {
      return res.status(400).json({
        error: 'La fecha ingresada no es válida.',
      });
    }

    // Horarios semanales.
    const [horarios] = await db.query(
      `SELECT dia_semana, abierto, hora_apertura, hora_cierre
       FROM horarios_estudio
       ORDER BY dia_semana`
    );

    // Pausa general.
    const [pausas] = await db.query(
      `SELECT activa, hora_inicio, hora_fin
       FROM horario_pausa
       WHERE id = 1`
    );

    // Excepción que corresponde a la fecha consultada.
    const [excepciones] = await db.query(
      `SELECT id, fecha_inicio, fecha_fin, tipo,
              hora_apertura, hora_cierre, motivo
       FROM excepciones_horario
       WHERE fecha_inicio <= ?
         AND fecha_fin >= ?
       ORDER BY id DESC
       LIMIT 1`,
      [fecha, fecha]
    );

    return res.json({
      horarios,
      pausa: pausas[0] || null,
      excepcion: excepciones[0] || null,
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
