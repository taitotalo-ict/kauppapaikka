const { body, check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const { errorMessages } = require('../helperFunctions');
const { Asiakas } = require('../models');

// Polku /kirjaudu/ (GET)
router.get('/', async (req, res) => {
    // Jos käyttäjä on kirjautunut sisään, ei voi kirjautua uudelleen
    if (req.session.user) {
        res.redirect('/');
    } else {
        asiakkaat = await Asiakas.findAll();
        if (asiakkaat.length) {
            res.render('kirjaudu', { otsikko: 'Kirjaudu sisään', error: false, user: false });
        } else {
            res.redirect('/rekisterointi');
        }
    }
});

validateInput = [
   // Username is not empty, min length of 4, it's trimmed, lowercasered and escaped
    body('username')
        .not().isEmpty().withMessage('Käyttäjätunnus on pakollinen')
        .trim()
        .isLength({min: 4})
        .isLength({max: 150})
        .toLowerCase(),
    // Username uses only letter, numbers and symbols: @, +, -, . and _
    check('username').custom( value => {
        if (!value.match(/^[0-9a-zäöå@+\-_.]+$/)) {
            return Promise.reject()
        } else {
            return true
        }
    }),
    // Username exists
    body('username').custom( async value => {
        var käyttäjätunnus = await Asiakas.findOne({ where: {käyttäjätunnus: value}});
        if (!käyttäjätunnus) {
            return Promise.reject();
        } else {
            return true;
        }
    }),
    // password must be at least 5 chars long
    body('password')
        .isLength({ min: 8 }),
    check('password').custom( async (password, { req }) => {
        käyttäjätunnus = await Asiakas.findOne({ where: {käyttäjätunnus: req.body.username}});
        bcrypt.compare(password, käyttäjätunnus.dataValues.salasana, function(err, result) {
            if (result) {
                return true;
            }
            return false;
        });
    })
];

// Polku /kirjaudu (POST)
router.post('/', validateInput, (req, res) => {
    // Jos käyttäjä on kirjautunut sisään, ei voi kirjautua uudelleen
    if (req.session.users) {
        res.redirect('/');
        return
    }

    // Tarkista lomake
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Oli virheita lomakkeessa. Luodaan sopivampi olio virheille...
        errorMsg = errorMessages(errors);

        // Renderoidaan samaa templatea ja käytetään arvot, jotka on tullut edellisesta lomakkeesta
        res.render('kirjaudu', { otsikko: 'Kirjaudu sisään', form: req.body, errors: errorMsg, user: false });
    } else {
        // Kirjaudu sisään: Luodaan session eväste (ID ja etunimi)
        req.session.user = {}
        req.session.user.id = käyttäjätunnus.dataValues.id;
        req.session.user.etunimi = käyttäjätunnus.dataValues.etunimi;
        req.session.user.isAdmin = käyttäjätunnus.dataValues.isAdmin;
        res.redirect('/');
    }
});

module.exports = router;