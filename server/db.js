
require('dotenv').config();

const mysql = require('mysql2/promise');

const db = mysql.createPool({
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

  keepAliveInitialDelay: 0,
});

// Verifica la conexión con MySQL.
// No modifica ni elimina información de la base de datos.
async function verificarConexion() {
  try {
    const conexion = await db.getConnection();

    await conexion.ping();

    conexion.release();

    console.log('[DB] Conexión con MySQL establecida correctamente.');

    return true;

  } catch (error) {
    console.error(
      '[DB] No se pudo conectar con MySQL:',
      error.message
    );

    return false;
  }
}

module.exports = db;
module.exports.verificarConexion = verificarConexion;
