
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
});

const db = require('../db');
const bcrypt = require('bcryptjs');

async function crearAdmin() {
  try {
    const email = (process.env.ADMIN_EMAIL || '')
      .trim()
      .toLowerCase();

    const clave = process.env.ADMIN_PASSWORD || '';

    if (!email || clave.length < 8) {
      throw new Error(
        'Revisá ADMIN_EMAIL y ADMIN_PASSWORD en server/.env'
      );
    }

    // Comprobar si el administrador ya existe
    const [usuarios] = await db.query(
      'SELECT id, rol FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarios.length > 0) {
      console.log('El correo ya está registrado.');
      console.log('Rol actual:', usuarios[0].rol);
      return;
    }

    // Cifrar la contraseña
    const hash = await bcrypt.hash(clave, 10);

    // Crear administrador
    await db.query(
      `INSERT INTO usuarios
       (nombre, email, clave_hash, rol)
       VALUES (?, ?, ?, ?)`,
      ['Administrador', email, hash, 'admin']
    );

    console.log('Administrador creado correctamente.');

  } catch (error) {
    console.error('Error:', error.message);

  } finally {
    await db.end();
  }
}

crearAdmin();
