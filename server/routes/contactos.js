
const router = require('express').Router();
const { body, validationResult } = require('express-validator');

const db = require('../db');
const {
  avisarNuevaConsulta,
  confirmarAlCliente,
} = require('../mailer');

const TIPOS = [
  'Consulta general',
  'Cotización de proyecto',
  'Asesoría técnica',
];

// ---------- POST /api/contactos ----------
// Ruta pública utilizada por el formulario de contacto.

router.post(
  '/',
  [
    body('nombre')
      .isString()
      .withMessage('El nombre debe ser texto.')
      .trim()
      .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' ]{3,60}$/)
      .withMessage('Ingresá tu nombre (solo letras, mínimo 3 caracteres).'),

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
      .withMessage('El mensaje debe tener entre 10 y 1000 caracteres.'),

    // Campo trampa antispam.
    // Puede estar vacío o no ser enviado.
    body('sitio_web')
      .optional({ checkFalsy: true })
      .isString()
      .withMessage('El campo antispam no es válido.')
      .isLength({ max: 200 })
      .withMessage('El campo antispam es demasiado largo.'),
  ],

  async (req, res, next) => {
    try {
      // Comprobar errores de validación.
      const errores = validationResult(req);

      if (!errores.isEmpty()) {
        return res.status(400).json({
          error: errores.array()[0].msg,
        });
      }

      const {
        nombre,
        email,
        tipo,
        mensaje,
        sitio_web,
      } = req.body;

      // Si el campo trampa está completado, probablemente sea un bot.
      // Respondemos como si el envío hubiera sido aceptado,
      // pero no guardamos la consulta ni enviamos correos.
      if (sitio_web && sitio_web.trim() !== '') {
        return res.status(201).json({
          ok: true,
          mensaje: 'Consulta enviada correctamente.',
        });
      }

      // Guardar la consulta en la base de datos.
      const [resultado] = await db.query(
        `INSERT INTO contactos
          (nombre, email, tipo, mensaje)
         VALUES (?, ?, ?, ?)`,
        [
          nombre,
          email,
          tipo,
          mensaje,
        ]
      );

      // Datos de la consulta para las notificaciones.
      const consulta = {
        nombre,
        email,
        tipo,
        mensaje,
      };

      // Enviar los correos sin bloquear la respuesta al cliente.
      // Si el servicio de correo falla, la consulta permanece guardada.
      Promise.all([
        avisarNuevaConsulta(consulta),
        confirmarAlCliente(consulta),
      ]).catch((error) => {
        console.error(
          'Error al enviar los correos de contacto:',
          error
        );
      });

      return res.status(201).json({
        ok: true,
        id: resultado.insertId,
        mensaje: 'Consulta enviada correctamente. Te responderemos por email a la brevedad.',
      });

    } catch (error) {
      console.error('Error al guardar la consulta:', error);
      next(error);
    }
  }
);

module.exports = router;
