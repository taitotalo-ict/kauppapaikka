const { body, check, validationResult } = require('express-validator');
var express = require('express');
var router = express.Router();
var multer  = require('multer');  // Multer moduuli -> Mahdollista tiedostoa lataminen palvelimeen (Kuville)
const publicFolder = 'public/';
const uploadsFolder = 'uploads/';
var upload = multer({ storage: multer.diskStorage({
  // Mihin tallennetaan palvelimeen ladattua tiedostoa
  destination: function (req, file, cb) {
    cb(null, publicFolder + uploadsFolder )
  },
  // Rätälöitu tiedoston nimi: aikaleima_alkuperäinenTiedostonNimi
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
}) });
 
const { errorMessages } = require('../helperFunctions');
const { Asiakas, Tuote }  = require('../models');


// Polku /tuote/uusi (GET)
router.get('/uusi', async function(req, res) {
  // Jos käyttäjä ei ole kirjautunut sisään tai se ei ole admin, uudeleenohjataan etusivuun
  if (!req.session.user || !req.session.user.isAdmin) {
    res.redirect('/');
    return
  }

  // Renderoidaan lomake
  res.render('lisätätuote', { otsikko: 'Lisätä tuote', user: req.session.user});
});

// Tarkistuksen lista uudelle tuotteelle
validateInput = [
  // Nimi is not empty, min length of 4, it's trimmed, lowercasered and escaped
  body('nimi')
      .not().isEmpty().withMessage('Nimi on pakollinen')
      .trim()
      .isLength({min: 4}).withMessage('Nimen minimi pituus on 4 merkkiä')
      .isLength({max: 150}).withMessage('Nimen maksimi pituus on 150 merkkiä')
];


// Polku /tuote/uusi (POST)
router.post('/uusi', upload.single('kuva'), validateInput, async function(req, res) {
  // Jos käyttäjä ei ole kirjautunut sisään tai se ei ole admin, uudeleenohjataan etusivuun
  if (!req.session.user || !req.session.user.isAdmin) {
    res.redirect('/');
    return
  }
  
  // Tarkistetaan lomakkeen arvot
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      // Oli virheita lomakkeessa. Luodaan sopivampi olio virheille...
      errorMsg = errorMessages(errors);

      // Renderoidaan samaa templatea ja käytetään arvot, jotka on tullut edellisesta lomakkeesta
      res.render('lisätätuote', { otsikko: 'Lisätä tuote', form: req.body, errors: errorMsg, user: req.session.user });
  } else {
    // Luodaan tuote
    Tuote.create({
      nimi: req.body.nimi,
      lisätiedot: req.body.lisätiedot,
      hinta: parseFloat(req.body.hinta).toFixed(2).replace(',','.'),  // Hinnat säilytetään USAn muodolla, eli käytetään piste. Esityksessä pitää vaihtaa suomeen muotoon.
      määrä: req.body.määrä,
      kuva: uploadsFolder + req.file.filename
    });

    // Uudelleenohjataan samaan sivuun (mutta GET)
    res.redirect(req.baseUrl + req.path);
  }
});


// Polku /tuote/:id (GET)
router.get('/:id', async function(req, res) {
  // Onko ID numero? Jos ei, se on väärin
  if (! parseInt(req.params.id)) {
    res.send('Väärä TuoteID:ta!');
    return
  }
  
  res.render('tuote_yksityiskohdat', { 
    otsikko: 'Tuotteeen yksityiskohdat', 
    tuote: await Tuote.findByPk(req.params.id), 
    user: req.session.user 
  });
});

module.exports = router;
