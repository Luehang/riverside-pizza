const mongoose              = require('mongoose');
const { Schema }            = mongoose;
mongoose.Promise            = require('bluebird');

const profileSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    // imagePath: {type: String, default: 'img/dummy-image.png'},
    first_name: {type: String},
    last_name: {type: String},
    address_line1: {type: String},
    address_line2: {type: String},
    address_city: {type: String},
    address_state: {type: String},
    address_zip: {type: String},
    address_country: {type: String},
    created_at: {type: Date, default: Date.now},
    is_deleted: {type: String, default: false}
});

module.exports = mongoose.model('Profile', profileSchema);