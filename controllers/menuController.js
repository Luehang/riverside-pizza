const Product               = require('../models/Product');
const Chili                 = require('../models/Chili');
const Drink                 = require('../models/Drink');
const Profile               = require('../models/Profile');

// controllers
const functionController    = require('./functionController');
const priceToCompleteString = functionController.priceToCompleteString;

// set up menu object
const menuController = {};

// get home page
menuController.getHomePage = (req, res) => {
    
    // store flash error and success in variables
    const messages = req.flash('error');
    const successMsg = req.flash('success')[0];

    // find profile data
    Profile.findOne({'user': req.user}, (err, result) => {
        let name = null;
        let email = null;

        // if found
        if (result) name = result.first_name;

        // if user
        if (req.user) email = req.user.email;

        // render index view page
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

// get deals page
menuController.getDealsPage = (req, res) => {

    // render deals view page
    res.render('shop/deals', {
       title: 'deals' 
    });
}

// get pizza page
menuController.getPizzaPage = (req, res) => {

    // render pizza view page
    res.render('shop/pizza', {
        title: 'Pizza'
    });
}

// get chili page
menuController.getChiliPage = (req, res) => {

    // find chili data
    Chili.find(function(err, docs) {
        
        // set up to reorganize data into groups
        let productChunks = [];
        let chunkSize = 2;
        
        // convert number price to string full price ex. "2.00"
        for (var n = 0; n < docs.length; n++) {
            if (docs[n].select.length === 1) {
                docs[n].select[0].price = priceToCompleteString(docs[n].select[0].price);
            } else if (docs[n].select.length === 2) {
                docs[n].select[0].price = priceToCompleteString(docs[n].select[0].price);
                docs[n].select[1].price = priceToCompleteString(docs[n].select[1].price);
            }
        }

        // reorganize data into groups
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }

        // render chili view page
        res.render('shop/chili', {
            title: 'Chili',
            chilis: productChunks
        });
    });
}

// get drinks page
menuController.getDrinksPage = (req, res) => {

    // find drinks data
    Drink.find(function(err, docs) {

        // set up to reorganize data into groups
        let productChunks = [];
        let chunkSize = 2;

        // iterate over data and organize in groups
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }

        // render drinks view page
        res.render('shop/drinks', {
            title: 'Drinks',
            drinks: productChunks
        });
    });
}

module.exports = menuController;

