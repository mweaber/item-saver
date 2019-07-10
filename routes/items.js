const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

// Load Models
require("../models/Item");
const Item = mongoose.model('items');

// Item Index Page
router.get('/', ensureAuthenticated, (req, res) => {
    Item.find({ character: req.character.id })
        .sort({ date: 'desc' })
        .then(items => {
            res.render('./items/index', {
                items: items
            });
        });

});

// Add Item Form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('items/add');
});

// Edit Item Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Item.findOne({
        _id: req.params.id
    })
        .then(item => {
            if (item.character != req.character.id) {
                req.flash('error_msg', 'Not Authorized');
                res.redirect('/items');
            } else {
                res.render('items/edit', {
                    item: item
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
    if (!req.body.title) {
        errors.push({ text: "Please Add A Title" });
    }
    if (!req.body.details) {
        errors.push({ text: "Please Add Details" });
    }

    //If errors is greater than 0 we want the user to get the error message to add input 
    if (errors.length > 0) {
        res.render('items/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });

        // If all passes and errors is 0 than take the Item and save and redirect
    } else {
        const newCharacter = {
            title: req.body.title,
            details: req.body.details,
            character: req.character.id
        }
        new Item(newCharacter)
            .save()
            .then(item => {
                req.flash('success_msg', "Item Added");
                res.redirect('/items');
            });
    }
});

// Edit Form Process
router.put('/:id', ensureAuthenticated, (req, res) => {
    // Takes model, uses method findOne to match params.id to the id from the DB
    // Then will allow us to edit the values and save them to that item
    // FInally will redirect us back to the items page
    Item.findOne({
        _id: req.params.id
    })
        .then(item => {
            // New Values to be saved
            item.title = req.body.title;
            item.details = req.body.details;

            item.save()
                .then(item => {
                    req.flash('success_msg', "Item Updated");
                    res.redirect('/items')
                })
        });
});

// Delete Item
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Item.deleteOne({
        // Deleting item that matches the id from params
        _id: req.params.id
    })
        .then(() => {
            // After redirect user back to ideas page
            req.flash('success_msg', "Item Removed");
            res.redirect('/items')
        });
});


module.exports = router;