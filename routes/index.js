const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

const Product = require('../models/Product');
const Chili = require('../models/Chili');
const Drink = require('../models/Drink');
const Order = require('../models/Order');

/* GET home page. */
router.get('/', function(req, res, next) {
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
});

router.get('/pizza', (req, res, next) => {
    res.render('shop/pizza', {
        title: 'Pizza'
    });
});

router.get('/chili', function(req, res, next) {
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
});

router.get('/drinks', (req, res, next) => {
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
});

router.post('/add-to-cart/:id', function(req, res, next) {
    const productId = req.params.id;
    const model = req.query.model;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    if (model === "chili") {
        Chili.findById(productId, (err, chili) => {
            if (err) {
                return res.redirect('/chili');
            }
            let title = "";
            if (req.body.price === "1.67") {
                title = chili.title + " 16 oz.";
            } else if (req.body.price === "2.67") {
                title = chili.title + " 32 oz.";
            }
            Product.find({title: title}, (err, product) => {
                if (err) {
                    return res.redirect('/chili');
                }
                cart.add(product[0], product[0]._id);
                req.session.cart = cart;
                res.redirect('/chili');
            });
        });
    }

    if (model === "drink") {
        Drink.findById(productId, (err, drink) => {
            if (err) {
                return res.redirect('/drinks');
            }
            let title = "";
            if (req.body.price === "1.67") {
                title = drink.title + " 16 oz.";
            } else if (req.body.price === "2.67") {
                title = drink.title + " 2 Liters";
            }
            Product.find({title: title}, (err, product) => {
                if (err) {
                    return res.redirect('/drinks');
                }
                cart.add(product[0], product[0]._id);
                req.session.cart = cart;
                res.redirect('/drinks');
            });
        });
    }

    if (model === "pizza") {
        const { pizza, toppingOne, toppingTwo, toppingThree, toppingFour,
            toppingFive, toppingSix, toppingSeven } = req.body;
        let done = false;
        let price = null;
        let pizzaTitle = "";
        const randomId = Math.floor(Math.random() * (999999999999999-111111111111111)) + 111111111111111;
        let tempArr = [toppingOne, toppingTwo, toppingThree, toppingFour,
            toppingFive, toppingSix, toppingSeven];
        let toppingsArr = [];
        for (var i = 0; i < tempArr.length; i++) {
            if (tempArr[i] !== "none") {
                toppingsArr.push(tempArr[i]);
            }
        }
        if (pizza === "small") {
            pizzaTitle += "Small Pizza";
            price = 6.99;
        }
        if (pizza === "medium") {
            pizzaTitle += "Medium Pizza";
            price = 9.80;
        }
        if (pizza === "large") {
            pizzaTitle += "Large Pizza";
            price = 12.80;
        }
        if (toppingsArr.length === 0) {
            done = true;
        }
        if (toppingsArr.length === 1) {
            pizzaTitle += ` with ${toppingsArr[0]}`;
            done = true;
        }
        if (toppingsArr.length >= 2) {
            let firstTopping = toppingsArr.splice(0,1);
            pizzaTitle += ` with ${firstTopping}, `;
            for (var i = 0; i < toppingsArr.length; i++) {
                if (i === (toppingsArr.length - 1)) {
                    pizzaTitle += `and ${toppingsArr[i]}`;
                    price += 1.25;
                } else {
                    pizzaTitle += `${toppingsArr[i]}, `;
                    price += 1.25;
                }
            }
            done = true;
        }
        const pizzaObj = {
            _id: randomId,
            title: pizzaTitle,
            price: price,
            created_on: new Date()
        };
        if (done) {
            cart.add(pizzaObj, randomId);
            req.session.cart = cart;
            res.redirect('/pizza');
        }
    }

});

// router.get('/add-to-cart/:id', function(req, res, next) {
//     const productId = req.params.id;
//     const cart = new Cart(req.session.cart ? req.session.cart : {});

//     Product.findById(productId, function(err, product) {
//         if (err) {
//             return res.redirect('/');
//         }
//         cart.add(product, product.id);
//         req.session.cart = cart;
//         // console.log(req.session.cart);
//         res.redirect('/');
//     });
// });

router.get('/reduce/:id', function(req, res, next) {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    const cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {
        products: cart.generateArray(),
        totalPrice: cart.totalPrice 
    });
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    const cart = new Cart(req.session.cart);
    let errMsg = req.flash('error')[0];
    res.render('shop/checkout', {
        total: cart.totalPrice,
        errMsg: errMsg,
        noError: !errMsg
    });
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    const cart = new Cart(req.session.cart);
    const stripe = require("stripe")(
        process.env.SECRET_KEY
    );
    
    stripe.charges.create({
        amount: cart.totalPrice * 100, // cents
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test charge."
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        // console.log(req.user);
        const order = new Order({
            user: req.user,
            cart: cart,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            address_line1: req.body.address1,
            paymentId: charge.id,
            address_line2: req.body.address2,
            address_city: req.body.city,
            address_state: req.body.state,
            address_zip: req.body.zip,
            address_country: req.body.country
        });
        order.save(function(err, result) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/checkout');
            }
            req.flash('success', 'Payment successful.  Please come pick up in 15-30 mins.');
            req.session.cart = null;
            res.redirect('/');
        });
    });
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}
