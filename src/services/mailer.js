const { appendFile, mkdir } = require('node:fs/promises');
const path = require('node:path');
const nodemailer = require('nodemailer');

/**
 * Envío del formulario de contacto, con respaldo en disco.
 *
 * El respaldo NO es opcional: durante meses este formulario perdió cada
 * prospecto porque nodemailer fallaba sin SMTP configurado y el catch de
 * routes/api.js se tragaba el error sin dejar rastro. Ahora el mensaje se
 * escribe SIEMPRE antes de intentar el envío, así que un fallo de correo
 * degrada el servicio pero no borra al interesado.
 */

const LEADS_FILE = process.env.LEADS_FILE || '/data/contactos.jsonl';

// El transporte se crea por envío y no al cargar el módulo: así, si se corrigen
// las variables de entorno y se reinicia, no queda un transporte inservible
// cacheado desde el arranque.
function crearTransporte() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function respaldar(datos) {
  const linea = JSON.stringify({ ts: new Date().toISOString(), ...datos });
  try {
    await mkdir(path.dirname(LEADS_FILE), { recursive: true });
    await appendFile(LEADS_FILE, linea + '\n', 'utf8');
  } catch (err) {
    // Si ni el respaldo se puede escribir, que al menos quede en el journal:
    // perder el dato en silencio es lo único inaceptable.
    console.error('No se pudo respaldar el contacto:', err.message);
    console.error('CONTACTO:', linea);
  }
}

async function sendContactEmail({ name, email, message, otherFields }) {
  await respaldar({ name, email, message, otherFields });

  const transporter = crearTransporte();
  if (!transporter) {
    console.warn(`SMTP_HOST no configurado: el contacto quedó solo en ${LEADS_FILE}`);
    return;
  }

  let otherHtml = '';
  if (otherFields && typeof otherFields === 'object') {
    for (const [key, value] of Object.entries(otherFields)) {
      const fieldName = key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
      const fieldValue = String(value).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
      otherHtml += `${fieldName} : ${fieldValue}<br>`;
    }
  }

  const htmlBody = `
    Una persona requiere información: <br><br>
    Nombre: ${name}<br/>
    Email: ${email}<br/>
    Mensaje: ${message}<br/>
    ${otherHtml}
  `;

  await transporter.sendMail({
    // El remitente tiene que ser la cuenta autenticada o un alias suyo: Gmail
    // reescribe cualquier otro. Por eso info@ va en `to` (es un grupo, no un
    // alias) y no aquí.
    from: `"${process.env.EMAIL_FROM_NAME || 'Formulario WEB'}" <${process.env.SMTP_USER}>`,
    replyTo: email,
    to: process.env.EMAIL_TO || process.env.SMTP_USER,
    subject: 'Mecánica G3 | Formulario WEB: Una persona requiere información',
    html: htmlBody
  });
}

module.exports = { sendContactEmail };
