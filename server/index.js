
require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { verificarCorreo } = require('./mailer');

// --------------------------------------------------
// CONFIGURACIÓN INICIAL
// --------------------------------------------------

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error(
    'Falta JWT_SECRET (mínimo 16 caracteres).'
  );

  process.exit(1);
}

const app = express();
const PUERTO = process.env.PORT || 4000;

console.log('[CONFIG] TRUST_PROXY:', process.env.TRUST_PROXY);

// Render utiliza un proxy delante del servidor.
// Configurar TRUST_PROXY=true solo en un entorno
// donde el proxy esté correctamente controlado.
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

console.log(
  '[CONFIG] Express trust proxy:',
  app.get('trust proxy')
);

// --------------------------------------------------
// CORS - CONEXIÓN CON EL FRONTEND
// --------------------------------------------------

const origenesPermitidos = [
  'http://localhost:3000',
  'https://nattlb.github.io',
];

app.use(
  cors({
    origin: (origen, callback) => {
      if (!origen || origenesPermitidos.includes(origen)) {
        return callback(null, true);
      }

      return callback(new Error('Origen no permitido por CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
// LÍMITE DE CONSULTAS
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

  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({
      error: 'El formato de los datos enviados no es válido.',
    });
  }

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

const servidor = app.listen(PUERTO, '0.0.0.0', async () => {
  console.log(
    `[SERVER] API de ORVAN escuchando en el puerto ${PUERTO}`
  );

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
    console.error(
      '[SERVER] Cierre forzado por tiempo de espera.'
    );
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', cerrarServidor);
process.on('SIGTERM', cerrarServidor);
