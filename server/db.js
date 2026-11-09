const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mysql = require('mysql2/promise');

// Saber si estamos trabajando en producción
const produccion = process.env.NODE_ENV === 'production';

// Comprobar las credenciales
if (produccion) {
  const variables = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
  ];

  for (const variable of variables) {
    if (!process.env[variable]) {
      throw new Error(`Falta configurar ${variable}`);
    }
  }

  if (process.env.DB_SSL !== 'true') {
    throw new Error(
      'La conexión online requiere DB_SSL=true'
    );
  }
}

// Configuración de MySQL
const configuracion = {
  host: process.env.DB_HOST || 'localhost',

  port: Number(process.env.DB_PORT) || 3306,

  user: process.env.DB_USER || 'root',

  password: process.env.DB_PASSWORD || '',

  database: process.env.DB_NAME || 'orvan',

  waitForConnections: true,

  connectionLimit: 10,

  maxIdle: 10,

  idleTimeout: 60000,

  queueLimit: 50,

  connectTimeout: 10000,

  charset: 'utf8mb4',

  enableKeepAlive: true,

  keepAliveInitialDelay: 0
};

// Activar conexión cifrada para la base online
if (process.env.DB_SSL === 'true') {
  configuracion.ssl = {
    rejectUnauthorized: true
  };
}


// Crear pool de conexiones
const db = mysql.createPool(configuracion);

// Comprobar conexión
async function verificarConexion() {
  let conexion;

  try {
    conexion = await db.getConnection();

    await conexion.ping();

    console.log(
      '[DB] Conexión establecida correctamente.'
    );

    return true;

  } catch (error) {
    console.error(
      '[DB] Error de conexión:',
      error.message
    );

    return false;

  } finally {
    if (conexion) {
      conexion.release();
    }
  }
}

module.exports = db;
module.exports.verificarConexion = verificarConexion;
