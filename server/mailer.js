
require('dotenv').config();

const nodemailer = require('nodemailer');

// --------------------------------------------------
// CONFIGURACIÓN
// --------------------------------------------------

const MAIL_USER = (process.env.MAIL_USER || '').trim();
const MAIL_PASS = (process.env.MAIL_PASS || '').trim();

const configurado = Boolean(MAIL_USER && MAIL_PASS);

const transporte = configurado
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    })
  : null;

// --------------------------------------------------
// SEGURIDAD Y FORMATO
// --------------------------------------------------

// Escapa los datos para evitar que el contenido del visitante
// pueda insertar HTML en los correos.

const esc = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[caracter]);

// Comprueba que el destinatario tenga formato de email válido.

const emailValido = (email) =>
  typeof email === 'string' &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// --------------------------------------------------
// DISEÑO DE LOS CORREOS ORVAN
// --------------------------------------------------

const marco = (titulo, cuerpo) => `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#F0F6FF;padding:24px">
    <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #DBEAFE">

      <div style="background:#0A1736;color:#ffffff;padding:20px 24px;letter-spacing:.3em;font-size:18px">
        ORVAN
      </div>

      <div style="padding:24px;color:#0F172A;font-size:15px;line-height:1.6">
        <h2 style="margin:0 0 12px;font-size:18px;color:#1D4ED8">
          ${titulo}
        </h2>

        ${cuerpo}
      </div>

      <div style="padding:14px 24px;background:#F0F6FF;color:#334155;font-size:12px">
        ORVAN · Desarrollo web fullstack
      </div>

    </div>
  </div>
`;

// --------------------------------------------------
// ENVÍO GENERAL DE EMAILS
// --------------------------------------------------

async function enviar({
  para,
  asunto,
  texto,
  html,
  responderA,
}) {
  if (!configurado || !transporte) {
    console.warn(
      '[MAIL] No se envió el correo: faltan MAIL_USER o MAIL_PASS.'
    );

    return false;
  }

  if (!emailValido(para)) {
    console.error('[MAIL] Destinatario inválido.');

    return false;
  }

  if (responderA && !emailValido(responderA)) {
    console.error('[MAIL] Dirección replyTo inválida.');

    return false;
  }

  try {
    const resultado = await transporte.sendMail({
      from: `"ORVAN" <${MAIL_USER}>`,
      to: para.trim(),
      subject: asunto,
      text: texto,
      html,
      ...(responderA ? { replyTo: responderA.trim() } : {}),
    });

    console.log(
      `[MAIL] Correo enviado correctamente: ${resultado.messageId}`
    );

    return true;

  } catch (error) {
    console.error(
      '[MAIL] Error al enviar el correo:',
      error.message
    );

    return false;
  }
}

// --------------------------------------------------
// AVISO AL ESTUDIO: NUEVA CONSULTA
// --------------------------------------------------

function avisarNuevaConsulta(consulta) {
  return enviar({
    para: MAIL_USER,

    responderA: consulta.email,

    asunto: `[ORVAN] ${consulta.tipo}: ${consulta.nombre}`,

    texto: `
Nueva consulta desde ORVAN

Nombre: ${consulta.nombre}
Email: ${consulta.email}
Tipo: ${consulta.tipo}

Mensaje:
${consulta.mensaje}
    `,

    html: marco(
      'Nueva consulta desde el sitio',

      `
        <p>
          <b>Nombre:</b> ${esc(consulta.nombre)}<br>
          <b>Email:</b> ${esc(consulta.email)}<br>
          <b>Tipo:</b> ${esc(consulta.tipo)}
        </p>

        <p style="background:#F0F6FF;border-radius:10px;padding:14px;white-space:pre-wrap">
          ${esc(consulta.mensaje)}
        </p>

        <p style="color:#334155;font-size:13px">
          Podés responder directamente a este correo para contactar al cliente.
        </p>
      `
    ),
  });
}

// --------------------------------------------------
// CONFIRMACIÓN AL CLIENTE
// --------------------------------------------------

function confirmarAlCliente(consulta) {
  return enviar({
    para: consulta.email,

    asunto: 'Recibimos tu consulta · ORVAN',

    texto: `
Hola ${consulta.nombre}.

Recibimos tu consulta (${consulta.tipo}).

Nuestro equipo la revisará y te responderá por este medio a la brevedad.

Equipo ORVAN
    `,

    html: marco(
      `Hola ${esc(consulta.nombre)}, recibimos tu consulta`,

      `
        <p>
          Gracias por comunicarte con ORVAN.
        </p>

        <p>
          Recibimos tu consulta sobre
          <b>${esc(consulta.tipo)}</b>.
        </p>

        <p>
          Nuestro equipo la revisará y te responderá por este medio a la brevedad.
        </p>

        <p style="background:#F0F6FF;border-radius:10px;padding:14px;white-space:pre-wrap;color:#334155">
          ${esc(consulta.mensaje)}
        </p>

        <p>Equipo ORVAN</p>
      `
    ),
  });
}

// --------------------------------------------------
// RESPUESTA DEL ADMINISTRADOR
// --------------------------------------------------

function responderConsulta(consulta, respuesta) {
  return enviar({
    para: consulta.email,

    responderA: MAIL_USER,

    asunto: `Re: ${consulta.tipo} · ORVAN`,

    texto: `
Hola ${consulta.nombre}.

${respuesta}

Equipo ORVAN

----------------------------

Tu consulta original:
${consulta.mensaje}
    `,

    html: marco(
      `Hola ${esc(consulta.nombre)}`,

      `
        <p style="white-space:pre-wrap">
          ${esc(respuesta)}
        </p>

        <p>Equipo ORVAN</p>

        <hr style="border:none;border-top:1px solid #DBEAFE;margin:20px 0">

        <p style="color:#334155;font-size:13px;margin:0 0 6px">
          Tu consulta original (${esc(consulta.tipo)}):
        </p>

        <p style="background:#F0F6FF;border-radius:10px;padding:14px;white-space:pre-wrap;color:#334155;font-size:13px">
          ${esc(consulta.mensaje)}
        </p>
      `
    ),
  });
}

// --------------------------------------------------
// VERIFICAR CONEXIÓN CON GMAIL
// --------------------------------------------------

async function verificarCorreo() {
  if (!configurado || !transporte) {
    console.warn(
      '[MAIL] Gmail no está configurado. Revisá server/.env.'
    );

    return false;
  }

  try {
    await transporte.verify();

    console.log('[MAIL] Conexión con Gmail verificada correctamente.');

    return true;

  } catch (error) {
    console.error(
      '[MAIL] No se pudo conectar con Gmail:',
      error.message
    );

    return false;
  }
}

// --------------------------------------------------
// EXPORTACIONES
// --------------------------------------------------

module.exports = {
  enviar,
  esc,
  marco,
  avisarNuevaConsulta,
  confirmarAlCliente,
  responderConsulta,
  verificarCorreo,
};
