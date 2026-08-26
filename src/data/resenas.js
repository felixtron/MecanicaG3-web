/**
 * Reseñas destacadas de Google Maps.
 *
 * Se llenan a mano a propósito. Dos razones:
 *
 * 1. Raspar Google Maps va contra sus términos y el marcado cambia sin aviso,
 *    así que un scraper se rompe solo. La vía sostenible es la Places API
 *    (Place Details devuelve hasta 5 reseñas) o una curaduría como esta.
 * 2. Curar deja elegir las que hablan de lo que vende: empleo, práctica real
 *    y horarios compatibles con trabajar.
 *
 * NO se marcan con `aggregateRating` en el schema: Google considera
 * "self-serving" que un negocio marque reseñas sobre sí mismo en su propio
 * sitio. No genera rich result y puede acarrear una acción manual.
 * Aquí sirven como prueba social para personas, que es lo que convierte.
 *
 * Campos: autor, estrellas (1-5), texto, fecha (texto libre, ej. "Marzo 2026").
 */

const PERFIL_GOOGLE = 'https://share.google/hDLhuiW8wvCAA9Swi';

/** @type {{autor: string, estrellas: number, texto: string, fecha: string}[]} */
const resenas = [
  // Pendiente: pegar aquí las reseñas seleccionadas de Google Maps.
  // Ejemplo de forma:
  // { autor: 'Nombre A.', estrellas: 5, texto: '…', fecha: 'Marzo 2026' },
];

module.exports = { resenas, PERFIL_GOOGLE };
