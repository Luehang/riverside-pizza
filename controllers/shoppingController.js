const Product               = require('../models/Product');
const Chili                 = require('../models/Chili');
const Drink                 = require('../models/Drink');
const Cart                  = require('../models/Cart');
const Order                 = require('../models/Order');
const Profile               = require('../models/Profile');
const Promo                 = require('../models/Promo');

const functionController    = require('./functionController');
const nearestHundredths     = functionController.nearestHundredths;
const shoppingController = {};

shoppingController.putUpdatePromoCode = (req, res) => {
    const { promoCode } = req.body;
    const lowerPromo = promoCode.toLowerCase();
    const upperPromo = promoCode.toUpperCase();
    const regexPromo = new RegExp(`${lowerPromo}|${upperPromo}`, "g");
    if (promoCode === "") {
        req.flash('error', 'Please enter a promo code.');
        return res.redirect('/shopping-cart');
    }
    Promo.findOne({code: regexPromo}, (err, promo) => {
        if (err) {
            req.flash('error', 'Please enter promo code again.');
            return res.redirect('/shopping-cart');
        }
        if (promo === null) {
            req.flash('error', 'Invalid promo code.');
            return res.redirect('/shopping-cart');
        }
        if (promo) {
            const { min, start_date, end_date, is_deleted } = promo;
            const totalNow = Cart.totalPrice;
            const dateNow = new Date();
            const cart = new Cart(req.session.cart);
            const original_start_date = `${start_date.getMonth()}/${start_date.getDate()}/${start_date.getFullYear()}`;
            const orginal_end_date = `${end_date.getMonth()}/${end_date.getDate()}/${end_date.getFullYear()}`;
            
            if (is_deleted === true) {
                req.flash('error', 'Invalid promo code.');
                return res.redirect('/shopping-cart');
            }

            if (dateNow.getFullYear() < start_date.getFullYear()) {
                req.flash('error', `The promo code is not valid until ${original_start_date}.`);
                return res.redirect('/shopping-cart');
            } else if (dateNow.getMonth() < start_date.getMonth() && dateNow.getFullYear() === start_date.getFullYear()) {
                req.flash('error', `The promo code is not valid until ${original_start_date}.`);
                return res.redirect('/shopping-cart');
            } else if (dateNow.getDate() < start_date.getDate() && dateNow.getMonth() === start_date.getMonth() && dateNow.getFullYear() === start_date.getFullYear()) {
                req.flash('error', `The promo code is not valid until ${original_start_date}.`);
                return res.redirect('/shopping-cart');
            }

            if (dateNow.getFullYear() > end_date.getFullYear()) {
                req.flash('error', `The promo code has expired.`);
                return res.redirect('/shopping-cart');
            } else if (dateNow.getMonth() > end_date.getMonth() && dateNow.getFullYear() === end_date.getFullYear()) {
                req.flash('error', `The promo code has expired.`);
                return res.redirect('/shopping-cart');
            } else if (dateNow.getDate() > end_date.getDate() && dateNow.getMonth() === end_date.getMonth() && dateNow.getFullYear() === end_date.getFullYear()) {
                req.flash('error', `The promo code has expired.`);
                return res.redirect('/shopping-cart');
            } 
            if (min > cart.totalPrice) {
                req.flash('error', `Total price is below valid minimum of $${min}. Add more and enter promo again.`);
                return res.redirect('/shopping-cart');
            }

            if (promo.used >= promo.limit) {
                req.flash('error', 'The promo code you used have reach the limit.');
                return res.redirect('/shopping-cart');
            }

            if (cart.isPromo && cart.promoName === promo.code) {
                req.flash('success', 'Promo code already applied.');
                return res.redirect('/shopping-cart');
            }

            if (cart.isPromo) {
                cart.promoName = promo.code;
                cart.promoPercent = promo.percent;
                req.session.cart = cart;
                req.flash('error', 'One promo code only. Previous promo code have been replaced.');
                return res.redirect('/shopping-cart');
            }
            
            if (cart.isPromo === false) {
                cart.isPromo = true;
                cart.promoName = promo.code;
                cart.promoPercent = promo.percent;
                cart.promoMin = promo.min;
                req.session.cart = cart;
                req.flash('success', `PROMO: ${promo.description}`);
                return res.redirect('/shopping-cart');
            }
        }
    });
}

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

shoppingController.middlewareShoppingCartPromoValidation = (req, res, next) => {
    if (req.session.cart) {
        if (req.session.cart.isPromo && req.session.cart.promoMin > req.session.cart.totalPrice) {
            const cart = new Cart(req.session.cart);
            cart.isPromo = false;
            cart.promoName = "";
            cart.promoPercent = 0;
            cart.promoMin = 0;
            req.flash('error', `Promo no longer valid. Total price is below valid minimum of $${req.session.cart.promoMin}. Add more and enter promo again.`);
            req.session.cart = cart;
            return next();
        }
    }
    return next();
}

shoppingController.getShoppingCart = (req, res) => {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    const cart = new Cart(req.session.cart);
    const messages = req.flash('error');
    const successMsg = req.flash('success')[0];
    res.render('shop/shopping-cart', {
        title: 'Cart',
        products: cart.generateArray(),
        messages: messages, 
        hasErrors: messages.length > 0,
        successMsg: successMsg,
        noMessages: !successMsg,
        totalPrice: cart.totalPrice,
        isPromo: cart.isPromo,
        promoTotal: cart.promoTotal,
        afterPromoTotalPrice: cart.afterPromoTotalPrice,
        tax: cart.tax,
        totalAfterTax: cart.totalAfterTax
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
            title: 'Check Out',
            total: cart.totalAfterTax,
            userInfo: results,
            errMsg: errMsg,
            noError: !errMsg
        });
    });
}

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
        process.env.STRIPE_SECRET_KEY
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
                    req.flash('error', err.message);
                }
            });
        }
        order.save(function(err, result) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/checkout');
            }
            if (cart.isPromo) {
                Promo.update({code: cart.promoName}, {$inc: {
                    used: 1
                }}, {new: true}, (err, promo) => {
                    return;
                });
            }
            req.flash('success', 'Payment successful.  Please come pick up in 15-30 mins.');
            req.session.cart = null;
            return res.redirect('/');
        });
    });
}

module.exports = shoppingController;