const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');

const drinkSchema = new Schema({
    imagePath: {type: String, default: "img/no-image.png"},
    title: {type: String, required: true},
    description: {type: String},
    select: {type: Array, required: true},
    created_at: {type: Date, default: Date.now},
    is_deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Drink', drinkSchema);