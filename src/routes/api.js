const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const { sendContactEmail } = require('../services/mailer');
const { subscribe } = require('../services/mailchimp');

const router = express.Router();

// POST /api/contact - Contact form handler (replaces script/contact.php)
router.post('/contact', [
  body('dzName').trim().notEmpty().escape(),
  body('dzEmail').isEmail().normalizeEmail(),
  body('dzMessage').trim().notEmpty().escape(),
  body('g-recaptcha-response').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ status: 0, msg: 'Por favor completa todos los campos correctamente.' });
    }

    // Verify reCAPTCHA
    const recaptchaResponse = req.body['g-recaptcha-response'];
    const recaptchaVerify = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: recaptchaResponse,
          remoteip: req.ip
        }
      }
    );

    if (!recaptchaVerify.data.success) {
      return res.json({ status: 0, msg: 'ReCaptcha no fue validado.' });
    }

    const { dzName, dzEmail, dzMessage, dzOther } = req.body;

    await sendContactEmail({
      name: dzName,
      email: dzEmail,
      message: dzMessage,
      otherFields: dzOther
    });

    res.json({ status: 1, msg: 'Gracias se envió tu mensaje correctamente, estaremos en contacto pronto.' });
  } catch (error) {
    console.error('Contact form error:', error.message);
    res.json({ status: 0, msg: 'Ocurrió un error, por favor inténtalo más tarde.' });
  }
});

// POST /api/subscribe - MailChimp subscription (replaces script/mailchamp.php)
router.post('/subscribe', [
  body('dzEmail').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ status: 0, msg: 'Please enter valid email address.' });
    }

    const httpCode = await subscribe(req.body.dzEmail);

    if (httpCode === 200) {
      res.json({ status: 1, msg: 'You have successfully subscribed.' });
    } else {
      res.json({ status: 0, msg: 'Some problem occurred, please try again.' });
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return res.json({ status: 0, msg: 'You are already subscribed.' });
    }
    console.error('Subscribe error:', error.message);
    res.json({ status: 0, msg: 'Some problem occurred, please try again.' });
  }
});

module.exports = router;
