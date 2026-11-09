
const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const { responderConsulta } = require('../mailer');
const { verificarToken, soloOperador } = require('../middleware/auth');

// Permite acceder al operador y al administrador
router.use(verificarToken, soloOperador);

// Listar consultas recibidas
router.get('/consultas', async (req, res, next) => {
  try {
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    const porPagina = 10;

    const q = typeof req.query.q === 'string'
  ? req.query.q.trim()
  : '';

const tipo = typeof req.query.tipo === 'string'
  ? req.query.tipo
  : '';

const estado = typeof req.query.estado === 'string'
  ? req.query.estado
  : '';

    let condiciones = [];
    let valores = [];

    if (q) {
      condiciones.push('(nombre LIKE ? OR email LIKE ? OR mensaje LIKE ?)');
      const busqueda = `%${q.trim()}%`;
      valores.push(busqueda, busqueda, busqueda);
    }

    if (tipo) {
      condiciones.push('tipo = ?');
      valores.push(tipo);
    }

    if (['nuevo', 'respondido'].includes(estado)) {
      condiciones.push('estado = ?');
      valores.push(estado);
    }

    const where = condiciones.length
      ? `WHERE ${condiciones.join(' AND ')}`
      : '';

    const [totalFilas] = await db.query(
      `SELECT COUNT(*) AS total FROM contactos ${where}`,
      valores
    );

    const [consultas] = await db.query(
      `SELECT id, nombre, email, tipo, mensaje, estado,
              respuesta, respondido_en, creado_en
       FROM contactos
       ${where}
       ORDER BY creado_en DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...valores, porPagina, (pagina - 1) * porPagina]
    );

    const total = Number(totalFilas[0].total);

    res.json({
      consultas,
      total,
      pagina,
      paginas: Math.max(1, Math.ceil(total / porPagina)),
    });
  } catch (e) {
    next(e);
  }
});

// Responder una consulta por correo
router.post(
  '/consultas/:id/responder',
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('respuesta')
      .isString()
      .trim()
      .isLength({ min: 5, max: 3000 })
      .withMessage('La respuesta debe tener entre 5 y 3000 caracteres.'),
  ],
  async (req, res, next) => {
    try {
      const errores = validationResult(req);

      if (!errores.isEmpty()) {
        return res.status(400).json({
          error: errores.array()[0].msg,
        })
      }

      const [filas] = await db.query(
        `SELECT id, nombre, email, tipo, mensaje
        FROM contactos
        WHERE id = ?`,
        [req.params.id]
);

      const consulta = filas[0];

      if (!consulta) {
        return res.status(404).json({
          error: 'La consulta no existe.',
        });
      }

      const enviado = await responderConsulta(
        consulta,
        req.body.respuesta
      );

      if (!enviado) {
        return res.status(502).json({
          error: 'No se pudo enviar el email. Revisá la configuración de Gmail del servidor.',
        });
      }

      await db.query(
        `UPDATE contactos
         SET estado = 'respondido',
             respuesta = ?,
             respondido_en = NOW()
         WHERE id = ?`,
        [req.body.respuesta, consulta.id]
      );

      const [actualizadas] = await db.query(
        `SELECT id, nombre, email, tipo, mensaje, estado,
                respuesta, respondido_en, creado_en
         FROM contactos
         WHERE id = ?`,
        [consulta.id]
      );

      res.json({
        ok: true,
        mensaje: 'Respuesta enviada correctamente.',
        consulta: actualizadas[0],
      });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
