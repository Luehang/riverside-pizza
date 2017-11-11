const Product = require('../models/Product');
const Chili = require('../models/Chili');
const Drink = require('../models/Drink');

const menuController = {};

menuController.getHomePage = (req, res) => {
    const successMsg = req.flash('success')[0];
    Product.find(function(err, docs) {
        let productChunks = [];
        let chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', { 
            title: 'Shopping Cart', 
            products: productChunks,
            successMsg: successMsg,
            noMessages: !successMsg
        });
    });
}

menuController.getPizzaPage = (req, res) => {
    res.render('shop/pizza', {
        title: 'Pizza'
    });
}

menuController.getChiliPage = (req, res) => {
    Chili.find(function(err, docs) {
        let productChunks = [];
        let chunkSize = 2;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/chili', {
            title: 'Chili',
            chilis: productChunks
        });
    });
}

menuController.getDrinksPage = (req, res) => {
    Drink.find(function(err, docs) {
        let productChunks = [];
        let chunkSize = 2;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/drinks', {
            title: 'Drinks',
            drinks: productChunks
        });
    });
}



module.exports = menuController;