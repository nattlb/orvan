
require('dotenv').config();

const db = require('./db');

async function probarConexion() {
  try {
    const [resultado] = await db.query(
      'SELECT COUNT(*) AS total FROM usuarios'
    );

    console.log('Conexión con TiDB Cloud correcta');
    console.log('Usuarios encontrados:', resultado[0].total);

  } catch (error) {
    console.error('Error de conexión:', error.message);

  } finally {
    await db.end();
  }
}

probarConexion();
