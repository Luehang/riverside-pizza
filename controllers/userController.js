const csrf                  = require('csurf');
const passport              = require('passport');

const Order                 = require('../models/Order');
const Cart                  = require('../models/Cart');

const userController = {};

userController.getOrderHistoryPage = (req, res) => {
    Order.find({user: req.user}, null, { limit: 50 }, function(err, orders) {
        if (err) {
            return res.render('user/orderhistory', {
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
        res.render('user/orderhistory', { orders: orders });
    });
}

userController.getSignUpPage = (req, res) => {
    const messages = req.flash('error');
    res.render('user/signup', {
        csrfToken: req.csrfToken(), 
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

userController.getSignInPage = (req, res) => {
    const messages = req.flash('error');
    res.render('user/signin', {
        csrfToken: req.csrfToken(), 
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

module.exports = userController;