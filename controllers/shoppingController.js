const Product               = require('../models/Product');
const Chili                 = require('../models/Chili');
const Drink                 = require('../models/Drink');
const Cart                  = require('../models/Cart');
const Order                 = require('../models/Order');
const Profile               = require('../models/Profile');

const functionController    = require('./functionController');
const nearestHundredths     = functionController.nearestHundredths;
const shoppingController = {};

shoppingController.addToCart = (req, res) => {
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
}

shoppingController.reduceItems = (req, res) => {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
}

shoppingController.removeAllItems = (req, res) => {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
}

shoppingController.getShoppingCart = (req, res) => {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    const cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalAfterTax: cart.totalAfterTax,
        tax: cart.tax
    });
}

shoppingController.getCheckOutPage = (req, res) => {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    const cart = new Cart(req.session.cart);
    let errMsg = req.flash('error')[0];
    Profile.findOne({user: req.user}, (err, results) => {
        res.render('shop/checkout', {
            total: cart.totalAfterTax,
            userInfo: results,
            errMsg: errMsg,
            noError: !errMsg
        });
    });
}

// shoppingController.middleCheckOut = (req, res, next) => {
//     if (!req.session.cart) {
//         return res.redirect('/shopping-cart');
//     }
//     if (req.body.saveInfo === "save") {
//         Profile.findByIdAndUpdate(req.user._id, { $set: {
//             user: req.user,
//             first_name: req.body.firstName,
//             last_name: req.body.lastName,
//             address_line1: req.body.address1,
//             address_line2: req.body.address2,
//             address_city: req.body.city,
//             address_state: req.body.state,
//             address_zip: req.body.zip,
//             address_country: req.body.country
//         }}, {upsert: true}, (err, profile) => {
//             next();
//         });
//         // const profile = new Profile({
//         //     user: req.user,
//         //     first_name: req.body.firstName,
//         //     last_name: req.body.lastName,
//         //     address_line1: req.body.address1,
//         //     paymentId: charge.id,
//         //     address_line2: req.body.address2,
//         //     address_city: req.body.city,
//         //     address_state: req.body.state,
//         //     address_zip: req.body.zip,
//         //     address_country: req.body.country
//         // });
//         // profile.save((err, result) => {
//         //     next();
//         // });
//     }
//     if (req.body.updateInfo === "update" || req.body.saveInfo === "save") {
//         Profile.findByIdAndUpdate(req.user._id, { $set: {
//             user: req.user,
//             first_name: req.body.firstName,
//             last_name: req.body.lastName,
//             address_line1: req.body.address1,
//             address_line2: req.body.address2,
//             address_city: req.body.city,
//             address_state: req.body.state,
//             address_zip: req.body.zip,
//             address_country: req.body.country
//         }}, {upsert: true}, (err, profile) => {
//             next();
//         });
//     }
//     next();
// }

shoppingController.postCheckOut = (req, res) => {
    const {
        firstName,
        lastName,
        address1,
        address2,
        city,
        state,
        zip,
        country
    } = req.body;
    const cart = new Cart(req.session.cart);
    const stripe = require("stripe")(
        process.env.SECRET_KEY
    );
    
    let totalNum = Number.parseFloat(cart.totalAfterTax) * 100;
    totalNum = Number.parseFloat(nearestHundredths(totalNum));
    
    stripe.charges.create({
        amount: totalNum, // cents
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
            first_name: firstName,
            last_name: lastName,
            address_line1: address1,
            paymentId: charge.id,
            address_line2: address2,
            address_city: city,
            address_state: state,
            address_zip: zip,
            address_country: country
        });
        if (req.body.updateInfo === "update" || req.body.saveInfo === "save") {
            Profile.update({user: req.user._id}, { $set: {
                user: req.user,
                first_name: firstName,
                last_name: lastName,
                address_line1: address1,
                address_line2: address2,
                address_city: city,
                address_state: state,
                address_zip: zip,
                address_country: country
            }}, {upsert: true, new: true}, (err, profile) => {
                if (err) {
                    console.log(err);
                }
            });
        }
        order.save(function(err, result) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/checkout');
            }
            req.flash('success', 'Payment successful.  Please come pick up in 15-30 mins.');
            req.session.cart = null;
            return res.redirect('/');
        });
    });
}

module.exports = shoppingController;