const express = require('express');
const router = express.Router();

const defaultMeta = {
  title: 'Escuela de Mecánica Automotriz G3 | Certificación Automotriz en Toluca',
  description: 'Escuela de Mecánica Automotriz G3 en Toluca, Estado de México. Formamos técnicos certificados en mecánica automotriz, electrónica y diagnóstico de vehículos de combustión, híbridos y eléctricos desde 1999.',
  canonicalPath: '',
  extraCss: [],
  extraJs: []
};

// Home
router.get('/', (req, res) => {
  res.render('index', {
    ...defaultMeta,
    title: 'Escuela de Mecánica Automotriz G3 | Certificación Automotriz en Toluca',
    description: 'Escuela de Mecánica Automotriz G3 en Toluca. Más de 4500 egresados, 20+ años formando técnicos certificados en mecánica automotriz, electrónica y diagnóstico vehicular.',
    canonicalPath: '/',
    extraCss: [
      'plugins/revolution/css/settings.css',
      'plugins/revolution/css/navigation.css'
    ],
    extraJs: [
      'plugins/lightgallery/js/lightgallery-all.js',
      'plugins/revolution/js/jquery.themepunch.tools.min.js',
      'plugins/revolution/js/jquery.themepunch.revolution.min.js',
      'plugins/revolution/js/extensions/revolution.extension.actions.min.js',
      'plugins/revolution/js/extensions/revolution.extension.carousel.min.js',
      'plugins/revolution/js/extensions/revolution.extension.kenburn.min.js',
      'plugins/revolution/js/extensions/revolution.extension.layeranimation.min.js',
      'plugins/revolution/js/extensions/revolution.extension.migration.min.js',
      'plugins/revolution/js/extensions/revolution.extension.navigation.min.js',
      'plugins/revolution/js/extensions/revolution.extension.parallax.min.js',
      'plugins/revolution/js/extensions/revolution.extension.slideanims.min.js',
      'plugins/revolution/js/extensions/revolution.extension.video.min.js',
      'js/rev.slider.js'
    ],
    inlineJs: `jQuery(document).ready(function() { 'use strict'; dz_rev_slider_1(); });`
  });
});

// Contact
router.get('/contacto', (req, res) => {
  res.render('contact', {
    ...defaultMeta,
    title: 'Contacto | Escuela de Mecánica Automotriz G3 en Toluca',
    description: 'Contáctanos para información sobre inscripciones, programas y certificaciones. Visítanos en Marcelino Juárez #200, Col. Juárez, Toluca. Tel: (722) 212 8955.',
    canonicalPath: '/contacto',
    extraCss: [
      'plugins/revolution/css/settings.css',
      'plugins/revolution/css/navigation.css'
    ],
    useRecaptcha: true
  });
});

// Who we are
router.get('/quienes-somos', (req, res) => {
  res.render('who-we-are', {
    ...defaultMeta,
    title: 'Quiénes Somos | Escuela de Mecánica Automotriz G3',
    description: 'Conoce la historia, misión y valores de Escuela de Mecánica Automotriz G3. Desde 1999 formando profesionales certificados en mecánica automotriz en Toluca.',
    canonicalPath: '/quienes-somos',
    extraCss: [
      'plugins/revolution/css/settings.css',
      'plugins/revolution/css/navigation.css'
    ]
  });
});

// Tecnico en mecanica
router.get('/tecnico-en-mecanica', (req, res) => {
  res.render('tecnicoenmecanica', {
    ...defaultMeta,
    title: 'Técnico en Mecánica Automotriz | Programa y Horarios | G3',
    description: 'Programa de Técnico en Mecánica Automotriz: modalidades matutina, vespertina y sabatina. Aprende diagnóstico, electrónica y reparación automotriz con certificación STPS y CONOCER.',
    canonicalPath: '/tecnico-en-mecanica',
    extraCss: [
      'plugins/revolution/css/settings.css',
      'plugins/revolution/css/navigation.css'
    ],
    extraJs: [
      'plugins/lightgallery/js/lightgallery-all.js',
      'plugins/revolution/js/jquery.themepunch.tools.min.js',
      'plugins/revolution/js/jquery.themepunch.revolution.min.js',
      'plugins/revolution/js/extensions/revolution.extension.actions.min.js',
      'plugins/revolution/js/extensions/revolution.extension.carousel.min.js',
      'plugins/revolution/js/extensions/revolution.extension.kenburn.min.js',
      'plugins/revolution/js/extensions/revolution.extension.layeranimation.min.js',
      'plugins/revolution/js/extensions/revolution.extension.migration.min.js',
      'plugins/revolution/js/extensions/revolution.extension.navigation.min.js',
      'plugins/revolution/js/extensions/revolution.extension.parallax.min.js',
      'plugins/revolution/js/extensions/revolution.extension.slideanims.min.js',
      'plugins/revolution/js/extensions/revolution.extension.video.min.js',
      'js/rev.slider.js'
    ],
    inlineJs: `jQuery(document).ready(function() { 'use strict'; dz_rev_slider_1(); });`
  });
});

// Registro
router.get('/registro', (req, res) => {
  res.render('registro', {
    ...defaultMeta,
    title: 'Inscríbete | Registro en Escuela de Mecánica Automotriz G3',
    description: 'Inscríbete en el programa de Técnico en Mecánica Automotriz. Elige tu horario y modalidad. Inscripciones abiertas en Escuela G3 Toluca.',
    canonicalPath: '/registro'
  });
});

// Politica de privacidad
router.get('/politica-de-privacidad', (req, res) => {
  res.render('politica-privacidad', {
    ...defaultMeta,
    title: 'Aviso de Privacidad | Escuela de Mecánica Automotriz G3',
    description: 'Aviso de privacidad de Escuela de Mecánica Automotriz G3. Conoce cómo protegemos tus datos personales conforme a la Ley Federal de Protección de Datos.',
    canonicalPath: '/politica-de-privacidad'
  });
});

// Coming soon
router.get('/proximamente', (req, res) => {
  res.render('coming-soon', {
    ...defaultMeta,
    title: 'Próximamente | Escuela de Mecánica Automotriz G3',
    description: 'Esta sección estará disponible próximamente. Escuela de Mecánica Automotriz G3 trabaja para ofrecerte más contenido.',
    canonicalPath: '/proximamente',
    extraCss: ['css/coming-soon.css']
  });
});

// Our team
router.get('/nuestro-equipo', (req, res) => {
  res.render('our-team', {
    ...defaultMeta,
    title: 'Nuestro Equipo | Escuela de Mecánica Automotriz G3',
    description: 'Conoce al equipo de profesionales de Escuela de Mecánica Automotriz G3: dirección, coordinación académica, instructores certificados y control escolar.',
    canonicalPath: '/nuestro-equipo'
  });
});

// --- Redirects 301 for old .html URLs ---
const redirects = {
  '/index.html': '/',
  '/contact.html': '/contacto',
  '/who-we-are.html': '/quienes-somos',
  '/our-team.html': '/nuestro-equipo',
  '/tecnicoenmecanica.html': '/tecnico-en-mecanica',
  '/registro.html': '/registro',
  '/politica_privacidad.html': '/politica-de-privacidad',
  '/coming-soon-1.html': '/proximamente',
  '/xabout-1.html': '/quienes-somos'
};

Object.entries(redirects).forEach(([oldPath, newPath]) => {
  router.get(oldPath, (req, res) => res.redirect(301, newPath));
});

module.exports = router;
