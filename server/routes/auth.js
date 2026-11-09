
const router = require('express').Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const db = require('../db');
const { verificarToken } = require('../middleware/auth');

// --------------------------------------------------
// CONFIGURACIÓN
// --------------------------------------------------

// Hash falso para mantener un tiempo de comparación
// similar cuando el email no existe.
const HASH_FALSO = bcrypt.hashSync('no-existe', 10);

// --------------------------------------------------
// FUNCIONES AUXILIARES
// --------------------------------------------------

// Generar token JWT.
const firmar = (usuario) =>
  jwt.sign(
    {
      id: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2h',
    }
  );

// Datos públicos del usuario.
// Nunca enviar contraseñas ni hashes al frontend.
const publico = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol,
});

// Revisar errores de validación.
const revisar = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: errores.array()[0].msg,
    });
  }

  next();
};

// Registrar errores del backend sin mostrar
// contraseñas, tokens ni consultas completas.
const registrarError = (operacion, error) => {
  console.error(`[AUTH ${operacion}] Error:`, {
    codigo: error.code || 'SIN_CODIGO',
    mensaje: error.message,
    sqlState: error.sqlState || null,
  });
};

// --------------------------------------------------
// REGISTRO
// POST /api/auth/registro
// --------------------------------------------------

router.post(
  '/registro',
  [
    body('nombre')
      .isString()
      .withMessage('El nombre debe ser texto.')
      .bail()
      .trim()
      .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' ]{3,60}$/)
      .withMessage(
        'Ingresá tu nombre (solo letras, mínimo 3 caracteres).'
      ),

    body('email')
      .isString()
      .withMessage('El email debe ser texto.')
      .bail()
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage('Ingresá un email válido.')
      .bail()
      .isLength({ max: 120 })
      .withMessage('El email es demasiado largo.'),

    body('clave')
      .isString()
      .withMessage('La contraseña debe ser texto.')
      .bail()
      .matches(/^(?=.*\d).{8,64}$/)
      .withMessage(
        'La contraseña debe tener entre 8 y 64 caracteres y al menos un número.'
      ),
  ],

  revisar,

  async (req, res, next) => {
    let conexion;

    try {
      const { nombre, email, clave } = req.body;

      // Iniciar transacción.
      conexion = await db.getConnection();
      await conexion.beginTransaction();

      // Comprobar si el email existe.
      const [existe] = await conexion.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );

      if (existe.length > 0) {
        await conexion.rollback();

        return res.status(409).json({
          error: 'Ese email ya está registrado.',
        });
      }

      // Encriptar contraseña.
      const hash = await bcrypt.hash(clave, 10);

      // Crear usuario.
      const [resultado] = await conexion.query(
        `INSERT INTO usuarios
          (nombre, email, clave_hash)
         VALUES (?, ?, ?)`,
        [nombre, email, hash]
      );

      const usuario = {
        id: resultado.insertId,
        nombre,
        email,
        rol: 'usuario',
      };

      // Registrar acceso inicial.
      await conexion.query(
        'INSERT INTO accesos (usuario_id) VALUES (?)',
        [usuario.id]
      );

      // Confirmar transacción.
      await conexion.commit();

      return res.status(201).json({
        token: firmar(usuario),
        usuario: publico(usuario),
      });

    } catch (error) {
      if (conexion) {
        try {
          await conexion.rollback();
        } catch (errorRollback) {
          registrarError('ROLLBACK', errorRollback);
        }
      }

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          error: 'Ese email ya está registrado.',
        });
      }

      registrarError('REGISTRO', error);
      next(error);

    } finally {
      if (conexion) {
        conexion.release();
      }
    }
  }
);

// --------------------------------------------------
// INICIO DE SESIÓN
// POST /api/auth/login
// --------------------------------------------------

router.post(
  '/login',
  [
    body('email')
      .isString()
      .withMessage('El email debe ser texto.')
      .bail()
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage('Ingresá un email válido.')
      .bail()
      .isLength({ max: 120 })
      .withMessage('El email es demasiado largo.'),

    body('clave')
      .isString()
      .withMessage('La contraseña debe ser texto.')
      .bail()
      .notEmpty()
      .withMessage('Ingresá tu contraseña.')
      .bail()
      .isLength({ max: 64 })
      .withMessage('La contraseña es demasiado larga.'),
  ],

  revisar,

  async (req, res, next) => {
    try {
      const { email, clave } = req.body;

      // Buscar usuario en la base de datos.
      const [filas] = await db.query(
        `SELECT id, nombre, email, rol, activo, clave_hash
         FROM usuarios
         WHERE email = ?`,
        [email]
      );

      const usuario = filas[0];

      // Comparar contraseña.
      const coincide = await bcrypt.compare(
        clave,
        usuario ? usuario.clave_hash : HASH_FALSO
      );

      if (!usuario || !usuario.activo || !coincide) {
        return res.status(401).json({
          error: 'Email o contraseña incorrectos.',
        });
      }

      // Registrar inicio de sesión.
      // Si falla, el error se registra para diagnosticarlo.
      await db.query(
        'INSERT INTO accesos (usuario_id) VALUES (?)',
        [usuario.id]
      );

      // Generar token JWT.
      const token = firmar(usuario);

      return res.json({
        token,
        usuario: publico(usuario),
      });

    } catch (error) {
      // Diagnóstico del error de inicio de sesión.
      registrarError('LOGIN', error);

      next(error);
    }
  }
);

// --------------------------------------------------
// USUARIO ACTUAL
// GET /api/auth/me
// --------------------------------------------------

router.get(
  '/me',
  verificarToken,

  async (req, res, next) => {
    try {
      const [filas] = await db.query(
        `SELECT id, nombre, email, rol, activo
         FROM usuarios
         WHERE id = ?`,
        [req.usuario.id]
      );

      const usuario = filas[0];

      if (!usuario || !usuario.activo) {
        return res.status(401).json({
          error: 'Cuenta no disponible.',
        });
      }

      return res.json({
        usuario: publico(usuario),
      });

    } catch (error) {
      registrarError('ME', error);
      next(error);
    }
  }
);

// --------------------------------------------------
// EXPORTAR RUTAS
// --------------------------------------------------

module.exports = router;
