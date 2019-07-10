const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Character Page   
const CharSchema = new Schema ({
    charName: {
        type: String,
        required: true
    },
    charClass: {
        type: String,
        required: true
    },
    charRace: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    item:{
        type: Object,
    }

});

mongoose.model('characters', CharSchema);