// Prueba rápida del correo:  node scripts/probarMail.js
// Envía un email de prueba al propio Gmail del estudio para comprobar que la clave funciona.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { enviar, marco } = require('../mailer');

(async () => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log('✖ Falta MAIL_USER o MAIL_PASS en server/.env');
    process.exit(1);
  }
  const ok = await enviar({
    para: process.env.MAIL_USER,
    asunto: 'Prueba de correo · ORVAN',
    texto: 'Si recibís esto, el envío de emails de ORVAN funciona.',
    html: marco('Prueba de correo', '<p>Si recibís esto, el envío de emails de ORVAN <b>funciona</b>.</p>'),
  });
  console.log(ok ? `✔ Email de prueba enviado a ${process.env.MAIL_USER}. Revisá la bandeja (y spam).` : '✖ No se pudo enviar. Mirá el mensaje de error de arriba.');
  process.exit(ok ? 0 : 1);
})();
