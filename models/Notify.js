const mongoose              = require('mongoose');
const { Schema }            = mongoose;
mongoose.Promise            = require('bluebird');

const notifySchema = new Schema({
    first_name: {type: String},
    last_name: {type: String},
    address_line1: {type: String},
    address_line2: {type: String},
    address_city: {type: String},
    address_state: {type: String},
    address_zip: {type: String},
    address_country: {type: String},
    created_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Notify', notifySchema);