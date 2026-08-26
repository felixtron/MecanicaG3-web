/**
 * Aviso de convocatoria que aparece en todo el sitio.
 *
 * Vive aquí y no en la plantilla porque cambia cada ciclo escolar: así se
 * actualiza (o se apaga con `activa: false`) sin tocar HTML ni arriesgar el
 * maquetado.
 */
const convocatoria = {
  activa: true,
  titulo: 'Inscripciones abiertas todo septiembre',
  detalle: 'Ciclo 2026–2028 · Clases desde el 29 y 31 de agosto · Todavía te puedes inscribir',
  ctaTexto: 'Pregunta por WhatsApp',
  ctaUrl:
    'https://wa.me/527296676977?text=Hola%2C%20quiero%20informes%20de%20la%20carrera%20de%20T%C3%A9cnico%20en%20Mec%C3%A1nica%20Automotriz',
  ctaExterno: true,
};

module.exports = { convocatoria };
