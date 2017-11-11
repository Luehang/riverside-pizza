const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.Promise = require('bluebird');

const profileSchema = new Schema({
    imagePath: {type: String, default: 'img/dummy-image.png'},
    first_name: {type: String},
    last_name: {type: String},
    address_line1: {type: String},
    address_line2: {type: String},
    address_city: {type: String},
    address_state: {type: String},
    address_zip: {type: String},
    address_country: {type: String},
});

module.exports = mongoose.model('Profile', profileSchema);