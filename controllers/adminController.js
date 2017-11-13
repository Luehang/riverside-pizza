const csrf                  = require('csurf');
const passport              = require('passport');

const Order                 = require('../models/Order');
const Cart                  = require('../models/Cart');

const adminController = {};

adminController.getCustomerHistory = (req, res, next) => {
    Order.find({}, null, { limit: 75 }, function(err, orders) {
        if (err) {
            return res.render('admin/customerhistory', {
                messages: ["Error retrieving data."], 
                hasErrors: true
            });
        }
        orders = orders.reverse();
        let cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('admin/customerhistory', { orders: orders });
    });
}

module.exports = adminController;