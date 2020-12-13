var express = require('express');
var router = express.Router();
const session = require('express-session');

const { Tuote } = require('../models')

/* Etusivu */
router.get('/', async (req, res) => {
  // Saadaan kaikki tuotteet
  const tuotteet = await Tuote.findAll();
  // Saadaan random tuote (false jos ei ole tuoteita)
  const korostettuTuote = tuotteet.length ? tuotteet[Math.floor(Math.random() * tuotteet.length)].dataValues : false;

  // Renderoidaan etusivu
  res.render('etusivu', { otsikko: 'Etusivu', tuote: korostettuTuote, user: req.session.user });
});

// Yhteystiedot. Melkein staattinen sivu. 
router.get('/yhteystiedot', (req, res) => {
  res.render('yhteystiedot', { otsikko: 'Yhteystiedot', user: req.session.user });
});


// Tietosuojaseloste. Melkein staattinen sivu
router.get('/tietosuojaseloste', (req, res) => {
  res.render('tietosuojaseloste', { otsikko: 'Tietosuojaseloste', user: req.session.user });
});

// Kaikki tuotteet -sivu
router.get('/tuotteet', async (req, res) => {
  res.render('tuotteet', { otsikko: 'Tuotteet', tuotteet: await Tuote.findAll(), user: req.session.user });
});


// Logout
router.get('/uloskirjautuminen', (req, res) => {
  // Jos käyttäja on kirjautunut sisään, tuhotetaan session eväste
  if (req.session.user) {
    req.session.destroy();
  }
  // Ja uudeeleen ohjataan etusivuun.
  res.redirect('/');
});

module.exports = router;
