const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

// Load Models
require('../models/Characters');
const Character = mongoose.model('characters');

// Character Index Page
router.get('/', ensureAuthenticated, (req, res) => {
    Character.find({ user: req.user.id})
        .sort({date: 'desc'})
        .then( characters => {
            res.render('./characters/indexChar', {
                characters: characters
            });
        });
});

// Add Character Form
router.get('/addChar', ensureAuthenticated, (req, res) => {
    res.render('characters/addChar');
});

// Edit Character Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Character.findOne({
        _id: req.params.id
    })
        .then(character => {
            if (character.user != req.user.id) {
                req.flash('error_msg', 'Not Authorized');
                res.redirect('/characters');
            } else {
                res.render('characters/editChar', {
                    character: character
                });
            }

        })

});

// Process Form
// Made empty array to hold errors
// That made if statements to say if there is no title or details to 
// push error message to the array. 
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];
    if (!req.body.charName) {
        errors.push({ text: "Please Add A Character Name" });
    }
    if (!req.body.charClass) {
        errors.push({ text: "Please Add A Character Class" });
    }
    if (!req.body.charRace) {
        errors.push({ text: "Please Add A Character Race" });
    }

    //If errors is greater than 0 we want the user to get the error message to add input 
    if (errors.length > 0) {
        res.render('characters/addChar', {
            errors: errors,
            charName: req.body.charName,
            charClass: req.body.charClass,
            charRace: req.body.charRace
        });

        // If all passes and errors is 0 than take the Item and save and redirect
    } else {
        const newUser = {
            charName: req.body.charName,
            charClass: req.body.charClass,
            charRace: req.body.charRace,
            user: req.user.id
        }
        new Character(newUser)
            .save()
            .then(character => {
                req.flash('success_msg', "Character Added");
                res.redirect('/characters');
            });
    }
});

// Edit Form Process
router.put('/:id', ensureAuthenticated, (req, res) => {
    // Takes model, uses method findOne to match params.id to the id from the DB
    // Then will allow us to edit the values and save them to that item
    // FInally will redirect us back to the items page
    Character.findOne({
        _id: req.params.id
    })
        .then(character => {
            // New Values to be saved
            character.charName = req.body.charName;
            character.charClass = req.body.charClass;
            character.charRace = req.body.charRace;

            character.save()
                .then(character => {
                    req.flash('success_msg', "Character Updated");
                    res.redirect('/characters')
                })
        });
});

// Delete Item
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Character.deleteOne({
        // Deleting item that matches the id from params
        _id: req.params.id
    })
        .then(() => {
            // After redirect user back to ideas page
            req.flash('success_msg', "Character Removed");
            res.redirect('/characters')
        });
});


module.exports = router;