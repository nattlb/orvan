require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const { verificarCorreo } = require('./mailer');

// --------------------------------------------------
// CONFIGURACIÓN INICIAL
// --------------------------------------------------

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error(
    'Falta JWT_SECRET en server/.env (mínimo 16 caracteres).'
  );

  process.exit(1);
}

const app = express();
const PUERTO = process.env.PORT || 4000;
console.log('[CONFIG] TRUST_PROXY:', process.env.TRUST_PROXY);

// Configuración de proxy confiable.
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 'loopback');
}

console.log('[CONFIG] Express trust proxy:', app.get('trust proxy'));

// --------------------------------------------------
// SEGURIDAD Y MIDDLEWARES
// --------------------------------------------------

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

// Evita solicitudes con cuerpos JSON demasiado grandes.
app.use(express.json({ limit: '50kb' }));

// --------------------------------------------------
// LÍMITE DE INTENTOS DE AUTENTICACIÓN
// --------------------------------------------------

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
      error: 'Demasiados intentos. Probá de nuevo en unos minutos.',
    },
  })
);

// --------------------------------------------------
// LÍMITE DE CONSULTAS DEL FORMULARIO
// --------------------------------------------------

app.use(
  '/api/contactos',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
      error: 'Enviaste muchas consultas. Probá de nuevo más tarde.',
    },
  })
);

// --------------------------------------------------
// CARPETA DE IMÁGENES
// --------------------------------------------------

const carpetaUploads = path.join(__dirname, 'uploads');

fs.mkdirSync(carpetaUploads, {
  recursive: true,
});

app.use(
  '/uploads',
  express.static(carpetaUploads, {
    dotfiles: 'deny',
    index: false,
  })
);

// --------------------------------------------------
// LÍMITE DE VISITAS
// --------------------------------------------------

app.use(
  '/api/visitas',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
      error: 'Demasiadas solicitudes de visitas.',
    },
  })
);

// --------------------------------------------------
// RUTA DE SALUD
// --------------------------------------------------

app.get('/api/salud', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'Servidor ORVAN funcionando correctamente.',
  });
});

// --------------------------------------------------
// RUTAS DE LA API
// --------------------------------------------------

app.use('/api/auth', require('./routes/auth'));
app.use('/api/contactos', require('./routes/contactos'));
app.use('/api/proyectos', require('./routes/proyectos'));
app.use('/api/visitas', require('./routes/visitas'));
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/equipo', require('./routes/equipo'));
app.use('/api/horarios', require('./routes/horarios'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/operador', require('./routes/operador'));

// --------------------------------------------------
// RUTAS INEXISTENTES
// --------------------------------------------------

app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada.',
  });
});

// --------------------------------------------------
// MANEJO DE ERRORES
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error('[SERVER] Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  // JSON mal formado.
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({
      error: 'El formato de los datos enviados no es válido.',
    });
  }

  // Cuerpo demasiado grande.
  if (err.status === 413) {
    return res.status(413).json({
      error: 'La solicitud es demasiado grande.',
    });
  }

  return res.status(500).json({
    error: 'Error interno del servidor.',
  });
});

// --------------------------------------------------
// INICIAR SERVIDOR
// --------------------------------------------------

const servidor = app.listen(PUERTO, async () => {
  console.log(
    `API de ORVAN escuchando en http://localhost:${PUERTO}`
  );

  // Gmail es un servicio complementario:
  // si falla, el servidor continúa funcionando.
  const correoOk = await verificarCorreo();

  if (!correoOk) {
    console.warn(
      '[SERVER] El servidor funciona, pero el correo no está disponible.'
    );
  }
});

// --------------------------------------------------
// CIERRE ORDENADO
// --------------------------------------------------

function cerrarServidor() {
  console.log('\n[SERVER] Cerrando servidor ORVAN...');

  servidor.close(() => {
    console.log('[SERVER] Servidor cerrado correctamente.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[SERVER] Cierre forzado por tiempo de espera.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', cerrarServidor);
process.on('SIGTERM', cerrarServidor);
