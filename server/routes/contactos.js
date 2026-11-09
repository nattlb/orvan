
const router = require('express').Router();
const { body, validationResult } = require('express-validator');

const db = require('../db');

const {
  avisarNuevaConsulta,
  confirmarAlCliente
} = require('../mailer');

// ==================== TIPOS DE CONSULTA ====================

const TIPOS = [
  'Consulta general',
  'Cotización de proyecto',
  'Asesoría técnica'
];

// ==================== VALIDACIONES ====================

const validarContacto = [
  body('nombre')
    .isString()
    .withMessage('El nombre debe ser texto.')
    .trim()
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' ]{3,60}$/)
    .withMessage(
      'Ingresá tu nombre (solo letras, mínimo 3 caracteres).'
    ),

  body('email')
    .isString()
    .withMessage('El email debe ser texto.')
    .trim()
    .toLowerCase()
    .isLength({ max: 120 })
    .withMessage('El email es demasiado largo.')
    .isEmail()
    .withMessage('Ingresá un email válido.'),

  body('tipo')
    .isString()
    .withMessage('El tipo de consulta no es válido.')
    .isIn(TIPOS)
    .withMessage('Elegí un tipo de consulta válido.'),

  body('mensaje')
    .isString()
    .withMessage('El mensaje debe ser texto.')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage(
      'El mensaje debe tener entre 10 y 1000 caracteres.'
    ),

  // Campo oculto para detectar bots
  body('sitio_web')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('El campo antispam no es válido.')
    .isLength({ max: 200 })
    .withMessage('El campo antispam es demasiado largo.')
];

// ==================== CREAR CONSULTA ====================

// POST /api/contactos

router.post('/', validarContacto, async (req, res, next) => {
  try {
    // Comprobar los datos recibidos
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        ok: false,
        error: errores.array()[0].msg
      });
    }

    const {
      nombre,
      email,
      tipo,
      mensaje,
      sitio_web
    } = req.body;

    // Evitar registros automáticos de bots
    if (sitio_web && sitio_web.trim() !== '') {
      return res.status(201).json({
        ok: true,
        mensaje: 'Consulta recibida.'
      });
    }

    // ==================== GUARDAR EN TIDB ====================

    const [resultado] = await db.query(
      `INSERT INTO contactos
        (nombre, email, tipo, mensaje)
       VALUES (?, ?, ?, ?)`,
      [nombre, email, tipo, mensaje]
    );

    const consulta = {
      nombre,
      email,
      tipo,
      mensaje
    };

    // ==================== ENVIAR CORREOS ====================

    // Esperamos ambos resultados para saber si se enviaron.
    // Un fallo del correo no elimina la consulta guardada.
    const resultados = await Promise.allSettled([
      avisarNuevaConsulta(consulta),
      confirmarAlCliente(consulta)
    ]);

    const avisoEnviado =
      resultados[0].status === 'fulfilled' &&
      resultados[0].value === true;

    const confirmacionEnviada =
      resultados[1].status === 'fulfilled' &&
      resultados[1].value === true;

    // Registrar fallos para poder diagnosticarlos
    if (!avisoEnviado) {
      console.warn(
        '[CONTACTOS] No se pudo enviar el aviso al estudio.'
      );
    }

    if (!confirmacionEnviada) {
      console.warn(
        '[CONTACTOS] No se pudo enviar la confirmación al cliente.'
      );
    }

    // ==================== RESPUESTA AL VISITANTE ====================

    if (avisoEnviado && confirmacionEnviada) {
      return res.status(201).json({
        ok: true,
        id: resultado.insertId,
        emailEnviado: true,
        mensaje:
          'Consulta recibida correctamente. Te enviamos una confirmación por email.'
      });
    }

    // La consulta existe en la base de datos,
    // aunque alguna notificación haya fallado.
    return res.status(201).json({
      ok: true,
      id: resultado.insertId,
      emailEnviado: false,
      mensaje:
        'Recibimos tu consulta, pero hubo un problema con las notificaciones por correo. Nuestro equipo podrá revisarla desde el panel.'
    });

  } catch (error) {
    console.error(
      '[CONTACTOS] Error al procesar la consulta:',
      error
    );

    next(error);
  }
});

module.exports = router;
