const { body, check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const { errorMessages } = require('../helperFunctions');
const { Asiakas } = require('../models');

// Polku /rekistoirinti/ (GET)
router.get('/', function(req, res) {
    // Jos käyttäjä on kirjautunut sisään, uudeleenohjataan etusivuun
    if (req.session.user) {
        res.redirect('/');
        return
    }
    res.render('rekisteröinti', { otsikko: 'Käyttäjän rekisteröinti', form: {}, errors: {}, user: false });
});


validateInput = [
    // Username is not empty, min length of 4, it's trimmed, lowercasered and escaped
    body('username')
        .not().isEmpty().withMessage('Käyttäjätunnus on pakollinen')
        .trim()
        .isLength({min: 4}).withMessage('Käyttäjätunnuksen minimi pituus on 4 merkkiä')
        .isLength({max: 150}).withMessage('Käyttäjätunnuksen maksimi pituus on 150 merkkiä')
        .toLowerCase(),
    // Username uses only letter, numbers and symbols: @, +, -, . and _
    check('username').custom( value => {
        if (!value.match(/^[0-9a-zäöå@+\-_.]+$/)) {
            return Promise.reject('Kieletty merkki käyttäjätunnuksessa')
        } else {
            return true
        }
    }),
    // Username is not already taken
    body('username').custom( async value => {
        käyttäjätunnus = await Asiakas.findOne({ where: {käyttäjätunnus: value}});
        if (käyttäjätunnus) {
            return Promise.reject('käyttäjätunnus on jo olemassa');
        } else {
            return true;
        }
    }),
    // First name is not empty and it's escaped
    body('first_name')
        .trim()
        .not().isEmpty().withMessage('Etunimi on pakollinen')
        .escape(),
    // Same to last name
    body('last_name')
        .trim()
        .not().isEmpty().withMessage('Sukunimi on pakollinen')
        .escape(),
    // email must be an email and it's trimmed
    body('email')
        .trim()
        .isEmail(),
    // password must be at least 5 chars long
    body('password1')
        .isLength({ min: 8 }).withMessage('Salasanan minimi pituus on 6 merkkiä.'),
    check('password1').custom((value, { req }) => {
        if (value !== req.body.password2) {
            throw new Error('Salasanat eivät täsmä');
        } else {
            return true
        }
    })
];

// Polku /rekistoirinti/ (POST)
router.post('/', validateInput, async function(req, res) {
    // Jos käyttäjä on kirjautunut sisään, uudeleenohjataan etusivuun
    if (req.session.user) {
        res.redirect('/');
        return
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Oli virheita lomakkeessa. Luodaan sopivampi olio virheille...
        errorMsg = errorMessages(errors);
        
        // Renderoidaan samaa templatea ja käytetään arvot, jotka on tullut edellisesta lomakkeesta
        res.render('rekisteröinti', { otsikko: 'Käyttäjän rekisteröinti', form: req.body, errors: errorMsg, user: false });
    } else {
        // Salataan salasanan
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(req.body.password1, salt);
        req.body.password = hash;

        // Onko tämä ensimmäinen käyttäjä (se tule olla Admin)
        let usersInDatabase = await Asiakas.findAll();
        let isFirstUser = usersInDatabase.length == 0;

        // Tallena käyttäjä
        const uusiKäyttäjä = await Asiakas.create({
            käyttäjätunnus: req.body.username,
            isAdmin: isFirstUser,
            etunimi: req.body.first_name,
            sukunimi: req.body.last_name,
            email: req.body.email,
            salasana: hash
        });

        if (uusiKäyttäjä) {
            // Myös "kirjaudutaan sisään" käyttäjä luomalla session eväste
            req.session.user = {}
            req.session.user.id = uusiKäyttäjä.dataValues.id;
            req.session.user.etunimi = uusiKäyttäjä.dataValues.etunimi;
            req.session.user.isAdmin = uusiKäyttäjä.dataValues.isAdmin;
            res.redirect('/');
        } else {
            res.send('Something went wrong!')
        }
    }
});

module.exports = router;