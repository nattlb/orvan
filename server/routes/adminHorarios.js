
const router = require('express').Router();
const { param, validationResult } = require('express-validator');
const db = require('../db');

const { verificarToken, soloAdmin } = require('../middleware/auth');

router.use(verificarToken, soloAdmin);

// =====================================
// OBTENER HORARIOS DEL ESTUDIO
// GET /api/admin/horarios
// =====================================

router.get('/', async (req, res, next) => {
  try {
    const [horarios] = await db.query(
      `SELECT dia_semana, abierto, hora_apertura, hora_cierre
       FROM horarios_estudio
       ORDER BY dia_semana`
    );

    const [pausas] = await db.query(
      `SELECT activa, hora_inicio, hora_fin
       FROM horario_pausa
       WHERE id = 1`
    );

    const [excepciones] = await db.query(
      `SELECT id, fecha_inicio, fecha_fin, tipo,
              hora_apertura, hora_cierre, motivo
       FROM excepciones_horario
       ORDER BY fecha_inicio DESC`
    );

    res.json({
      horarios,
      pausa: pausas[0] || null,
      excepciones,
    });
  } catch (e) {
    next(e);
  }
});


// =====================================
// MODIFICAR HORARIO DE UN DÍA
// PUT /api/admin/horarios/dias/:dia
// =====================================

router.put(
  '/dias/:dia',
  [param('dia').isInt({ min: 0, max: 6 }).toInt()],
  async (req, res, next) => {
    try {
      const errores = validationResult(req);

      if (!errores.isEmpty()) {
        return res.status(400).json({
          error: 'Día de la semana inválido.',
        });
      }

      const { abierto, hora_apertura, hora_cierre } = req.body;

      if (typeof abierto !== 'boolean') {
        return res.status(400).json({
          error: 'Indicá si el estudio estará abierto o cerrado.',
        });
      }

      const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

      if (abierto) {
        if (
          typeof hora_apertura !== 'string' ||
          typeof hora_cierre !== 'string' ||
          !formatoHora.test(hora_apertura) ||
          !formatoHora.test(hora_cierre) ||
          hora_apertura >= hora_cierre
        ) {
          return res.status(400).json({
            error: 'Ingresá un horario válido de apertura y cierre.',
          });
        }
      }

      const [existentes] = await db.query(
        'SELECT id FROM horarios_estudio WHERE dia_semana = ?',
        [req.params.dia]
      );

      if (!existentes.length) {
        return res.status(404).json({
          error: 'No se encontró ese día.',
        });
      }

      const apertura = abierto ? hora_apertura : null;
      const cierre = abierto ? hora_cierre : null;

      await db.query(
        `UPDATE horarios_estudio
         SET abierto = ?, hora_apertura = ?, hora_cierre = ?
         WHERE dia_semana = ?`,
        [abierto ? 1 : 0, apertura, cierre, req.params.dia]
      );

      await db.query(
        `INSERT INTO historial_horarios
         (usuario_id, accion, detalle)
         VALUES (?, ?, ?)`,
        [
          req.usuario.id,
          'Modificación de horario',
          `Día ${req.params.dia}: ${
            abierto
              ? `abierto de ${apertura} a ${cierre}`
              : 'cerrado'
          }`,
        ]
      );

      res.json({
        ok: true,
        mensaje: 'Horario actualizado correctamente.',
      });
    } catch (e) {
      next(e);
    }
  }
);


// =====================================
// MODIFICAR PAUSA GENERAL
// PUT /api/admin/horarios/pausa
// =====================================

router.put('/pausa', async (req, res, next) => {
  try {
    const { activa, hora_inicio, hora_fin } = req.body;

    if (typeof activa !== 'boolean') {
      return res.status(400).json({
        error: 'Indicá si la pausa estará activa.',
      });
    }

    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (
      activa &&
      (
        typeof hora_inicio !== 'string' ||
        typeof hora_fin !== 'string' ||
        !formatoHora.test(hora_inicio) ||
        !formatoHora.test(hora_fin) ||
        hora_inicio >= hora_fin
      )
    ) {
      return res.status(400).json({
        error: 'Ingresá un horario de pausa válido.',
      });
    }

    const inicio = activa ? hora_inicio : null;
    const fin = activa ? hora_fin : null;

    await db.query(
      `UPDATE horario_pausa
       SET activa = ?,
           hora_inicio = ?,
           hora_fin = ?,
           actualizado_por = ?
       WHERE id = 1`,
      [activa ? 1 : 0, inicio, fin, req.usuario.id]
    );

    await db.query(
      `INSERT INTO historial_horarios
       (usuario_id, accion, detalle)
       VALUES (?, ?, ?)`,
      [
        req.usuario.id,
        'Modificación de pausa general',
        activa
          ? `Pausa configurada de ${inicio} a ${fin}`
          : 'Pausa general desactivada',
      ]
    );

    res.json({
      ok: true,
      mensaje: 'Pausa general actualizada correctamente.',
    });
  } catch (e) {
    next(e);
  }
});


// =====================================
// CREAR EXCEPCIÓN DE HORARIO
// POST /api/admin/horarios/excepciones
// =====================================

router.post('/excepciones', async (req, res, next) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      tipo,
      hora_apertura,
      hora_cierre,
      motivo,
    } = req.body;

    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (
      typeof fecha_inicio !== 'string' ||
      typeof fecha_fin !== 'string' ||
      !formatoFecha.test(fecha_inicio) ||
      !formatoFecha.test(fecha_fin)
    ) {
      return res.status(400).json({
        error: 'Ingresá fechas válidas.',
      });
    }

    const inicio = new Date(`${fecha_inicio}T00:00:00Z`);
    const fin = new Date(`${fecha_fin}T00:00:00Z`);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fin.getTime()) ||
      inicio.toISOString().slice(0, 10) !== fecha_inicio ||
      fin.toISOString().slice(0, 10) !== fecha_fin ||
      fecha_inicio > fecha_fin
    ) {
      return res.status(400).json({
        error: 'El período de fechas no es válido.',
      });
    }

    if (!['cerrado', 'horario_especial'].includes(tipo)) {
      return res.status(400).json({
        error: 'Seleccioná un tipo de excepción válido.',
      });
    }

    if (
      typeof motivo !== 'string' ||
      !motivo.trim() ||
      motivo.trim().length > 200
    ) {
      return res.status(400).json({
        error: 'Ingresá un motivo de hasta 200 caracteres.',
      });
    }

    if (
      tipo === 'horario_especial' &&
      (
        typeof hora_apertura !== 'string' ||
        typeof hora_cierre !== 'string' ||
        !formatoHora.test(hora_apertura) ||
        !formatoHora.test(hora_cierre) ||
        hora_apertura >= hora_cierre
      )
    ) {
      return res.status(400).json({
        error: 'Ingresá un horario especial válido.',
      });
    }

    const [solapadas] = await db.query(
      `SELECT id
       FROM excepciones_horario
       WHERE fecha_inicio <= ?
         AND fecha_fin >= ?`,
      [fecha_fin, fecha_inicio]
    );

    if (solapadas.length > 0) {
      return res.status(409).json({
        error: 'Ya existe una excepción dentro de ese período.',
      });
    }

    const apertura = tipo === 'horario_especial'
      ? hora_apertura
      : null;

    const cierre = tipo === 'horario_especial'
      ? hora_cierre
      : null;

    await db.query(
      `INSERT INTO excepciones_horario
       (fecha_inicio, fecha_fin, tipo, hora_apertura,
        hora_cierre, motivo, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        fecha_inicio,
        fecha_fin,
        tipo,
        apertura,
        cierre,
        motivo.trim(),
        req.usuario.id,
      ]
    );

    await db.query(
      `INSERT INTO historial_horarios
       (usuario_id, accion, detalle)
       VALUES (?, ?, ?)`,
      [
        req.usuario.id,
        'Creación de excepción',
        `${tipo}: ${fecha_inicio} al ${fecha_fin}. Motivo: ${motivo.trim()}`,
      ]
    );

    res.status(201).json({
      ok: true,
      mensaje: 'Excepción creada correctamente.',
    });
  } catch (e) {
    next(e);
  }
});


/* =====================================
   EDITAR EXCEPCIÓN
   PUT /api/admin/horarios/excepciones/:id
===================================== */

router.put('/excepciones/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: 'Identificador de excepción inválido.',
      });
    }

    const {
      fecha_inicio,
      fecha_fin,
      tipo,
      hora_apertura,
      hora_cierre,
      motivo,
    } = req.body;

    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (
      typeof fecha_inicio !== 'string' ||
      typeof fecha_fin !== 'string' ||
      !formatoFecha.test(fecha_inicio) ||
      !formatoFecha.test(fecha_fin)
    ) {
      return res.status(400).json({
        error: 'Ingresá fechas válidas.',
      });
    }

    const inicio = new Date(`${fecha_inicio}T00:00:00Z`);
    const fin = new Date(`${fecha_fin}T00:00:00Z`);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fin.getTime()) ||
      inicio.toISOString().slice(0, 10) !== fecha_inicio ||
      fin.toISOString().slice(0, 10) !== fecha_fin ||
      fecha_inicio > fecha_fin
    ) {
      return res.status(400).json({
        error: 'El período de fechas no es válido.',
      });
    }

    if (!['cerrado', 'horario_especial'].includes(tipo)) {
      return res.status(400).json({
        error: 'Seleccioná un tipo de excepción válido.',
      });
    }

    if (
      typeof motivo !== 'string' ||
      !motivo.trim() ||
      motivo.trim().length > 200
    ) {
      return res.status(400).json({
        error: 'Ingresá un motivo de hasta 200 caracteres.',
      });
    }

    if (
      tipo === 'horario_especial' &&
      (
        typeof hora_apertura !== 'string' ||
        typeof hora_cierre !== 'string' ||
        !formatoHora.test(hora_apertura) ||
        !formatoHora.test(hora_cierre) ||
        hora_apertura >= hora_cierre
      )
    ) {
      return res.status(400).json({
        error: 'Ingresá un horario especial válido.',
      });
    }

    const [existentes] = await db.query(
      'SELECT id FROM excepciones_horario WHERE id = ?',
      [id]
    );

    if (!existentes.length) {
      return res.status(404).json({
        error: 'No se encontró la excepción.',
      });
    }

    const [solapadas] = await db.query(
      `SELECT id
       FROM excepciones_horario
       WHERE id != ?
         AND fecha_inicio <= ?
         AND fecha_fin >= ?`,
      [id, fecha_fin, fecha_inicio]
    );

    if (solapadas.length > 0) {
      return res.status(409).json({
        error: 'El período coincide con otra excepción.',
      });
    }

    const apertura = tipo === 'horario_especial'
      ? hora_apertura
      : null;

    const cierre = tipo === 'horario_especial'
      ? hora_cierre
      : null;

    await db.query(
      `UPDATE excepciones_horario
       SET fecha_inicio = ?,
           fecha_fin = ?,
           tipo = ?,
           hora_apertura = ?,
           hora_cierre = ?,
           motivo = ?
       WHERE id = ?`,
      [
        fecha_inicio,
        fecha_fin,
        tipo,
        apertura,
        cierre,
        motivo.trim(),
        id,
      ]
    );

    await db.query(
      `INSERT INTO historial_horarios
       (usuario_id, accion, detalle)
       VALUES (?, ?, ?)`,
      [
        req.usuario.id,
        'Modificación de excepción',
        `Excepción ${id} modificada: ${fecha_inicio} al ${fecha_fin}. Motivo: ${motivo.trim()}`,
      ]
    );

    res.json({
      ok: true,
      mensaje: 'Excepción modificada correctamente.',
    });
  } catch (e) {
    next(e);
  }
});


/* =====================================
   ELIMINAR EXCEPCIÓN
   DELETE /api/admin/horarios/excepciones/:id
===================================== */

router.delete('/excepciones/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: 'Identificador de excepción inválido.',
      });
    }

    const [excepciones] = await db.query(
      `SELECT fecha_inicio, fecha_fin, motivo
       FROM excepciones_horario
       WHERE id = ?`,
      [id]
    );

    if (!excepciones.length) {
      return res.status(404).json({
        error: 'No se encontró la excepción.',
      });
    }

    const excepcion = excepciones[0];

    await db.query(
      'DELETE FROM excepciones_horario WHERE id = ?',
      [id]
    );

    await db.query(
      `INSERT INTO historial_horarios
       (usuario_id, accion, detalle)
       VALUES (?, ?, ?)`,
      [
        req.usuario.id,
        'Eliminación de excepción',
        `Excepción ${id} eliminada: ${excepcion.fecha_inicio} al ${excepcion.fecha_fin}. Motivo: ${excepcion.motivo}`,
      ]
    );

    res.json({
      ok: true,
      mensaje: 'Excepción eliminada correctamente.',
    });
  } catch (e) {
    next(e);
  }
});

// Obtener historial de cambios de horarios
router.get('/historial', async (req, res) => {
  try {
    const [historial] = await db.query(`
      SELECT
        h.id,
        h.accion,
        h.detalle,
        h.creado_en,
        u.nombre AS usuario
      FROM historial_horarios h
      LEFT JOIN usuarios u ON h.usuario_id = u.id
      ORDER BY h.creado_en DESC
      LIMIT 100
    `);

    res.json(historial);
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res.status(500).json({
      error: 'No se pudo cargar el historial de horarios.'
    });
  }
});

module.exports = router;
