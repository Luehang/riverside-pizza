const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
mongoose.Promise            = require('bluebird');

const promoSchema = new Schema({
    code: {type: String, required: true},
    description: {type: String, required: true},
    percent: {type: Number, required: true},
    min: {type: Number, required: false},
    start_date: {type: Date, required: true},
    end_date: {type: Date, required: true},
    used: {type: Number, default: 0},
    limit: {type: Number, default: 1000},
    created_at: {type: Date, default: Date.now},
    is_deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Promo', promoSchema);