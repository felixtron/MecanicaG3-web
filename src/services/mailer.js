const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendContactEmail({ name, email, message, otherFields }) {
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
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
    replyTo: email,
    to: process.env.EMAIL_TO,
    subject: 'Mecánica G3 | Formulario WEB: Una persona requiere información',
    html: htmlBody
  });
}

module.exports = { sendContactEmail };
