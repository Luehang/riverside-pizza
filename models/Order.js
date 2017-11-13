const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
mongoose.Promise            = require('bluebird');

const productSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    cart: {type: Object, required: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    address_line1: {type: String, required: true},
    paymentId: {type: String, required: true},
    address_line2: {type: String},
    address_city: {type: String, required: true},
    address_state: {type: String, required: true},
    address_zip: {type: String, required: true},
    address_country: {type: String, required: true},
    purchase_date: {type: Date, default: Date.now},
    is_deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Order', productSchema);