// Crea la base "orvan", las tablas, los datos de ejemplo y el usuario administrador.
// Se puede ejecutar varias veces sin romper nada.
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    const dirBD = path.join(__dirname, '..', '..', 'database');
    await conn.query(fs.readFileSync(path.join(dirBD, 'schema.sql'), 'utf8'));
    console.log('✔ Base de datos y tablas listas');

    await conn.query('USE orvan');
    const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM proyectos');
    if (n === 0) {
      await conn.query(fs.readFileSync(path.join(dirBD, 'seed.sql'), 'utf8'));
      console.log('✔ Datos de ejemplo cargados');
    }

    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const clave = process.env.ADMIN_PASSWORD || '';
    if (!email || clave.length < 8) {
      console.log('⚠ Falta ADMIN_EMAIL o ADMIN_PASSWORD (mínimo 8 caracteres) en server/.env: no se creó el admin');
    } else {
      const [existe] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (existe.length === 0) {
        const hash = await bcrypt.hash(clave, 10);
        await conn.query(
          "INSERT INTO usuarios (nombre, email, clave_hash, rol) VALUES ('Administrador', ?, ?, 'admin')",
          [email, hash]
        );
        console.log(`✔ Administrador creado: ${email}`);
      } else {
        console.log(`✔ El administrador ${email} ya existía`);
      }
    }
    console.log('Listo. Ahora podés iniciar el servidor con: npm run dev');
  } catch (e) {
    console.error('✖ Error:', e.message);
    if (e.code === 'ECONNREFUSED') console.error('  → MySQL está apagado o el puerto es otro.');
    if (e.code === 'ER_ACCESS_DENIED_ERROR') console.error('  → Usuario o DB_PASSWORD incorrectos en server/.env');
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();