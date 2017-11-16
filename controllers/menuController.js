const Product               = require('../models/Product');
const Chili                 = require('../models/Chili');
const Drink                 = require('../models/Drink');
const Profile               = require('../models/Profile');

const menuController = {};

menuController.getHomePage = (req, res) => {
    const messages = req.flash('error');
    const successMsg = req.flash('success')[0];
    Profile.findOne({'user': req.user}, (err, result) => {
        let name = null;
        let email = null;
        if (result) name = result.first_name;
        if (req.user) email = req.user.email;
        res.render('shop/index', { 
            title: 'Home', 
            name: name,
            email: email,
            successMsg: successMsg,
            noMessages: !successMsg,
            messages: messages, 
            hasErrors: messages.length > 0
        });
    });
}

menuController.getDealsPage = (req, res) => {
    res.render('shop/deals', {
       title: 'deals' 
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