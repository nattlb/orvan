const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const bcrypt = require('bcryptjs');
const { responderConsulta } = require('../mailer');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// Todo lo que está en este archivo exige sesión iniciada Y rol administrador
router.use(verificarToken, soloAdmin);

const contar = async (sql, params = []) => {
  const [filas] = await db.query(sql, params);
  return filas[0].n;
};

// ---------- GET /api/admin/resumen ----------
router.get('/resumen', async (req, res, next) => {
  try {
    const [visitas, accesos, usuarios, consultas, consultasNuevas, proyectos] = await Promise.all([
      contar('SELECT COUNT(*) AS n FROM visitas'),
      contar('SELECT COUNT(*) AS n FROM accesos'),
      contar("SELECT COUNT(*) AS n FROM usuarios WHERE rol = 'usuario'"),
      contar('SELECT COUNT(*) AS n FROM contactos'),
      contar("SELECT COUNT(*) AS n FROM contactos WHERE estado = 'nuevo'"),
      contar('SELECT COUNT(*) AS n FROM proyectos'),
    ]);
    res.json({ visitas, accesos, usuarios, consultas, consultasNuevas, proyectos });
  } catch (e) { next(e); }
});

// ---------- GET /api/admin/consultas?q=&tipo=&estado=&pagina= ----------
const TIPOS = ['Consulta general', 'Cotización de proyecto', 'Asesoría técnica'];
const ESTADOS = ['nuevo', 'respondido'];
const POR_PAGINA = 10;

router.get('/consultas', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 60);
    const tipo = TIPOS.includes(req.query.tipo) ? req.query.tipo : '';
    const estado = ESTADOS.includes(req.query.estado) ? req.query.estado : '';
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);

    const donde = [];
    const params = [];
    if (estado) { donde.push('estado = ?'); params.push(estado); }
    if (tipo) { donde.push('tipo = ?'); params.push(tipo); }
    if (q) {
      const like = `%${q.replace(/[\\%_]/g, '\\$&')}%`; // los % y _ que escriba el admin no actúan de comodín
      donde.push('(nombre LIKE ? OR email LIKE ? OR mensaje LIKE ?)');
      params.push(like, like, like);
    }
    const cond = donde.length ? `WHERE ${donde.join(' AND ')}` : '';

    const total = await contar(`SELECT COUNT(*) AS n FROM contactos ${cond}`, params);
    const [consultas] = await db.query(
      `SELECT id, nombre, email, tipo, mensaje, estado, respuesta, respondido_en, creado_en
       FROM contactos ${cond} ORDER BY creado_en DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, POR_PAGINA, (pagina - 1) * POR_PAGINA]
    );
    res.json({ consultas, total, pagina, paginas: Math.max(1, Math.ceil(total / POR_PAGINA)) });
  } catch (e) { next(e); }
});

// ---------- POST /api/admin/consultas/:id/responder ----------
router.post(
  '/consultas/:id/responder',
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('respuesta').isString().trim()
      .isLength({ min: 5, max: 3000 }).withMessage('La respuesta debe tener entre 5 y 3000 caracteres.'),
  ],
  async (req, res, next) => {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) return res.status(400).json({ error: errores.array()[0].msg });

      const [filas] = await db.query('SELECT * FROM contactos WHERE id = ?', [req.params.id]);
      const consulta = filas[0];
      if (!consulta) return res.status(404).json({ error: 'La consulta no existe.' });

      const enviado = await responderConsulta(consulta, req.body.respuesta);
      if (!enviado) {
        return res.status(502).json({ error: 'No se pudo enviar el email. Revisá la configuración de Gmail del servidor.' });
      }

      await db.query(
        "UPDATE contactos SET estado = 'respondido', respuesta = ?, respondido_en = NOW() WHERE id = ?",
        [req.body.respuesta, consulta.id]
      );
      res.json({
        ok: true,
        consulta: { id: consulta.id, estado: 'respondido', respuesta: req.body.respuesta, respondido_en: new Date().toISOString() },
      });
    } catch (e) { next(e); }
  }
);

// ================== USUARIOS ==================
const likeSeguro = (q) => `%${q.replace(/[\\%_]/g, '\\$&')}%`;

// ---------- GET /api/admin/usuarios?q=&estado=&pagina= ----------
router.get('/usuarios', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 60);
    const estado = ['activo', 'inactivo'].includes(req.query.estado) ? req.query.estado : '';
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);

    const donde = ["u.rol = 'usuario'"];
    const params = [];
    if (estado) { donde.push('u.activo = ?'); params.push(estado === 'activo' ? 1 : 0); }
    if (q) { donde.push('(u.nombre LIKE ? OR u.email LIKE ?)'); params.push(likeSeguro(q), likeSeguro(q)); }
    const cond = `WHERE ${donde.join(' AND ')}`;

    const total = await contar(`SELECT COUNT(*) AS n FROM usuarios u ${cond}`, params);
    const [usuarios] = await db.query(
      `SELECT u.id, u.nombre, u.email, u.activo, u.creado_en,
              (SELECT COUNT(*) FROM accesos a WHERE a.usuario_id = u.id) AS accesos,
              (SELECT MAX(a.fecha) FROM accesos a WHERE a.usuario_id = u.id) AS ultimo_acceso
       FROM usuarios u ${cond}
       ORDER BY u.creado_en DESC, u.id DESC LIMIT ? OFFSET ?`,
      [...params, POR_PAGINA, (pagina - 1) * POR_PAGINA]
    );
    res.json({ usuarios, total, pagina, paginas: Math.max(1, Math.ceil(total / POR_PAGINA)) });
  } catch (e) { next(e); }
});

// ---------- PATCH /api/admin/usuarios/:id  { activo: true|false } ----------
// Bloquea o reactiva una cuenta. Nunca afecta a administradores.
router.patch(
  '/usuarios/:id',
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('activo').isBoolean().withMessage('Valor inválido.').toBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) return res.status(400).json({ error: errores.array()[0].msg });

      const [r] = await db.query(
        "UPDATE usuarios SET activo = ? WHERE id = ? AND rol = 'usuario'",
        [req.body.activo ? 1 : 0, req.params.id]
      );
      if (r.affectedRows === 0) return res.status(404).json({ error: 'El usuario no existe.' });
      res.json({ ok: true });
    } catch (e) { next(e); }
  }
);

// ---------- DELETE /api/admin/usuarios/:id ----------
// Elimina la cuenta y sus accesos (ON DELETE CASCADE). Nunca borra administradores.
router.delete('/usuarios/:id', [param('id').isInt({ min: 1 }).toInt()], async (req, res, next) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ error: 'Identificador inválido.' });

    const [r] = await db.query("DELETE FROM usuarios WHERE id = ? AND rol = 'usuario'", [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'El usuario no existe.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/* ================== OPERADORES ================== */

// Listar operadores
router.get('/operadores', async (req, res, next) => {
  try {
    const [operadores] = await db.query(
      `SELECT id, nombre, email, activo, creado_en
       FROM usuarios
       WHERE rol = 'operador'
       ORDER BY creado_en DESC`
    );

    res.json({ operadores });
  } catch (e) {
    next(e);
  }
});

// Crear operador
router.post(
  '/operadores',
  [
    body('nombre')
      .isString()
      .trim()
      .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ' ]{3,60}$/)
      .withMessage('Ingresá un nombre válido de al menos 3 letras.'),

    body('email')
      .isString()
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage('Ingresá un email válido.')
      .isLength({ max: 120 }),

    body('clave')
      .isString()
      .matches(/^(?=.*\d).{8,64}$/)
      .withMessage('La contraseña debe tener al menos 8 caracteres y un número.'),
  ],
  async (req, res, next) => {
    try {
      const errores = validationResult(req);

      if (!errores.isEmpty()) {
        return res.status(400).json({
          error: errores.array()[0].msg,
        });
      }

      const nombre = req.body.nombre.trim();
      const email = req.body.email.trim().toLowerCase();
      const clave = req.body.clave;

      const [existente] = await db.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );

      if (existente.length > 0) {
        return res.status(409).json({
          error: 'Ese email ya está registrado.',
        });
      }

      const claveHash = await bcrypt.hash(clave, 10);

      const [resultado] = await db.query(
        `INSERT INTO usuarios (nombre, email, clave_hash, rol)
         VALUES (?, ?, ?, 'operador')`,
        [nombre, email, claveHash]
      );

      res.status(201).json({
        ok: true,
        operador: {
          id: resultado.insertId,
          nombre,
          email,
          rol: 'operador',
          activo: 1,
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

// Bloquear o reactivar operador
// Bloquear o reactivar operador
router.patch(
  '/operadores/:id',
  [
    param('id').isInt({ min: 1 }).toInt(),

    body('activo')
      .isBoolean()
      .withMessage('Estado inválido.')
      .toBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errores = validationResult(req);

      if (!errores.isEmpty()) {
        return res.status(400).json({
          error: errores.array()[0].msg,
        });
      }

      const [resultado] = await db.query(
        `UPDATE usuarios
         SET activo = ?
         WHERE id = ? AND rol = 'operador'`,
        [req.body.activo ? 1 : 0, req.params.id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          error: 'No se encontró ese operador.',
        });
      }

      res.json({
        ok: true,
        mensaje: req.body.activo
          ? 'Operador reactivado correctamente.'
          : 'Operador bloqueado correctamente.',
      });
    } catch (e) {
      next(e);
    }
  }
);

// ================== ESTADÍSTICAS (gráficos) ==================
const dosDigitos = (n) => String(n).padStart(2, '0');
const claveDia = (d) => `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;

// Lista de los últimos "n" días (el más viejo primero, el último es hoy)
const ultimosDias = (n) => {
  const hoy = new Date();
  const dias = [];
  for (let i = n - 1; i >= 0; i--) {
    dias.push(claveDia(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i)));
  }
  return dias;
};

// Cuenta registros por día. Los días sin datos salen con 0 para que el gráfico no tenga huecos.
// (tabla, columna y extra son constantes del código, nunca vienen del usuario)
const serieDiaria = async (tabla, columna, dias, extra = '') => {
  const [filas] = await db.query(
    `SELECT DATE_FORMAT(${columna}, '%Y-%m-%d') AS dia, COUNT(*) AS total
     FROM ${tabla}
     WHERE ${columna} >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ${extra}
     GROUP BY dia`,
    [dias - 1]
  );
  const mapa = new Map(filas.map((f) => [f.dia, Number(f.total)]));
  return ultimosDias(dias).map((dia) => ({ dia, total: mapa.get(dia) || 0 }));
};

// ---------- GET /api/admin/estadisticas?dias=7|30|90 ----------
router.get('/estadisticas', async (req, res, next) => {
  try {
    const pedido = parseInt(req.query.dias, 10);
    const dias = [7, 30, 90].includes(pedido) ? pedido : 30;

    const [porTipo] = await db.query(
      'SELECT tipo, COUNT(*) AS total FROM contactos WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL ? DAY) GROUP BY tipo',
      [dias - 1]
    );
    const [porEstado] = await db.query(
      'SELECT estado, COUNT(*) AS total FROM contactos WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL ? DAY) GROUP BY estado',
      [dias - 1]
    );
    const [visitas, accesos, registros] = await Promise.all([
      serieDiaria('visitas', 'fecha', dias),
      serieDiaria('accesos', 'fecha', dias),
      serieDiaria('usuarios', 'creado_en', dias, "AND rol = 'usuario'"),
    ]);

    // Siempre salen todos los tipos y estados, aunque tengan 0
    const consultasPorTipo = TIPOS.map((tipo) => ({
      tipo, total: Number((porTipo.find((f) => f.tipo === tipo) || {}).total || 0),
    }));
    const consultasPorEstado = ESTADOS.map((estado) => ({
      estado, total: Number((porEstado.find((f) => f.estado === estado) || {}).total || 0),
    }));

    res.json({ dias, consultasPorTipo, consultasPorEstado, visitas, accesos, registros });
  } catch (e) { next(e); }
});

// CRUD de proyectos y servicios (hereda la protección de administrador de este archivo)
router.use(require('./adminContenido'));
router.use('/equipo', require('./adminEquipo'));
router.use('/horarios', require('./adminHorarios'));

module.exports = router;