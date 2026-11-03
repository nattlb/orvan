
const jwt = require('jsonwebtoken');
const db = require('../db');

// --------------------------------------------------
// VERIFICAR TOKEN Y ESTADO DE LA CUENTA
// --------------------------------------------------

async function verificarToken(req, res, next) {
  const cabecera = req.headers.authorization || '';

  const token = cabecera.startsWith('Bearer ')
    ? cabecera.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Necesitás iniciar sesión.',
    });
  }

  try {
    // Verificar firma y vencimiento del JWT.
    const datos = jwt.verify(token, process.env.JWT_SECRET);

    // Consultar el estado real del usuario.
    const [filas] = await db.query(
      `SELECT id, nombre, email, rol, activo
       FROM usuarios
       WHERE id = ?`,
      [datos.id]
    );

    const usuario = filas[0];

    // Rechazar cuentas inexistentes o desactivadas.
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        error: 'Tu cuenta no está disponible. Iniciá sesión nuevamente.',
      });
    }

    // Utilizar los permisos actuales de MySQL,
    // no los permisos antiguos guardados en el token.
    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    return next();

  } catch (error) {
    // Los errores de JWT se distinguen de los errores de MySQL.
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        error: 'Tu sesión venció o no es válida. Iniciá sesión nuevamente.',
      });
    }

    console.error('[AUTH] Error al verificar sesión:', error);

    return res.status(500).json({
      error: 'No se pudo verificar tu sesión.',
    });
  }
}

// --------------------------------------------------
// SOLO ADMINISTRADOR
// --------------------------------------------------

function soloAdmin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({
      error: 'No tenés permiso para acceder.',
    });
  }

  return next();
}

// --------------------------------------------------
// OPERADOR O ADMINISTRADOR
// --------------------------------------------------

function soloOperador(req, res, next) {
  if (
    !req.usuario ||
    !['operador', 'admin'].includes(req.usuario.rol)
  ) {
    return res.status(403).json({
      error: 'No tenés permiso para acceder.',
    });
  }

  return next();
}

// --------------------------------------------------
// EXPORTAR MIDDLEWARES
// --------------------------------------------------

module.exports = {
  verificarToken,
  soloAdmin,
  soloOperador,
};
