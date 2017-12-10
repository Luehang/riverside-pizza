const Product               = require('../models/Product');
const Chili                 = require('../models/Chili');
const Drink                 = require('../models/Drink');
const Cart                  = require('../models/Cart');
const Order                 = require('../models/Order');
const Profile               = require('../models/Profile');
const Promo                 = require('../models/Promo');

// controllers
const functionController    = require('./functionController');
const nearestHundredths     = functionController.nearestHundredths;
const priceToCompleteString = functionController.priceToCompleteString;

// set up shopping object
const shoppingController = {};

// update promo code in shopping cart
shoppingController.putUpdatePromoCode = (req, res) => {

    // store promo code into regex
    const { promoCode } = req.body;
    const lowerPromo = promoCode.toLowerCase();
    const upperPromo = promoCode.toUpperCase();
    const regexPromo = new RegExp(`${lowerPromo}|${upperPromo}`, "g");

    // if no promo code input
    if (promoCode === "") {
        req.flash('error', 'Please enter a promo code.');
        return res.redirect('/shopping-cart');
    }

    // find promo data
    Promo.findOne({code: regexPromo}, (err, promo) => {

        // if database error throw error
        if (err) {
            req.flash('error', 'Please enter promo code again.');
            return res.redirect('/shopping-cart');
        }

        // if promo data not found
        if (promo === null) {
            req.flash('error', 'Invalid promo code.');
            return res.redirect('/shopping-cart');
        }

        // if promo data found
        if (promo) {

            // store promo data in variables
            const { min, start_date, end_date, is_deleted } = promo;

            // store cart total in variable
            const totalNow = Cart.totalPrice;

            // store date now in variable
            const dateNow = new Date();

            // store cart session in variable
            const cart = new Cart(req.session.cart);

            // convert iso date to proper start and expire date of promo
            const original_start_date = `${start_date.getMonth()}/${start_date.getDate()}/${start_date.getFullYear()}`;
            const orginal_end_date = `${end_date.getMonth()}/${end_date.getDate()}/${end_date.getFullYear()}`;
            
            // if promo is deleted
            if (is_deleted === true) {
                req.flash('error', 'Invalid promo code.');
                return res.redirect('/shopping-cart');
            }

            // if date now is before promo start date
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

            // if date now is after promo expire date
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

            // if total price is below promo min price
            if (min > cart.totalPrice) {
                req.flash('error', `Total price is below valid minimum of $${min}. Add more and enter promo again.`);
                return res.redirect('/shopping-cart');
            }

            // if promo code reached limit of number used
            if (promo.used >= promo.limit) {
                req.flash('error', 'The promo code you used have reach the limit.');
                return res.redirect('/shopping-cart');
            }

            // if promo code already applied in cart
            if (cart.isPromo && cart.promoName === promo.code) {
                req.flash('success', 'Promo code already applied.');
                return res.redirect('/shopping-cart');
            }

            // if another promo is applied in cart already
            if (cart.isPromo) {
                cart.promoName = promo.code;
                cart.promoPercent = promo.percent;
                req.session.cart = cart;
                req.flash('error', 'One promo code only. Previous promo code have been replaced.');
                return res.redirect('/shopping-cart');
            }
            
            // if no promo code applied in cart
            if (cart.isPromo === false) {

                // update cart
                cart.isPromo = true;
                cart.promoName = promo.code;
                cart.promoPercent = promo.percent;
                cart.promoMin = promo.min;

                // store new cart in session
                req.session.cart = cart;

                // store success message in flash
                req.flash('success', `PROMO: ${promo.description}`);

                // redirect to shopping cart
                return res.redirect('/shopping-cart');
            }
        }
    });
}

// add item to shopping cart
shoppingController.addToCart = (req, res) => {

    const productId = req.params.id;
    const model = req.query.model;

    // create new or old cart
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    // if item is chili
    if (model === "chili") {

        // find chili data by id
        Chili.findById(productId, (err, chili) => {

            // if database error then redirect
            if (err) {
                return res.redirect('/chili');
            }

            // add detail description to title in cart
            let title = "";
            if (req.body.price === "3.20") {
                title = chili.title + " 16 oz.";
            } else if (req.body.price === "5.29") {
                title = chili.title + " 32 oz.";
            }

            // find product data
            Product.find({title: title}, (err, product) => {

                // if database error then redirect
                if (err) {
                    return res.redirect('/chili');
                }

                // add item to cart
                cart.add(product[0], product[0]._id);

                // store cart in session
                req.session.cart = cart;

                // redirect to chili page
                res.redirect('/chili');
            });
        });
    }

    // if item is drink
    if (model === "drink") {

        // find drink data by id
        Drink.findById(productId, (err, drink) => {

            // if database error then redirect
            if (err) {
                return res.redirect('/drinks');
            }

            // add detail description to title in cart
            let title = "";
            if (req.body.price === "1.67") {
                title = drink.title + " 16 oz.";
            } else if (req.body.price === "2.67") {
                title = drink.title + " 2 Liters";
            }

            // find product data
            Product.find({title: title}, (err, product) => {

                // if database error then redirect
                if (err) {
                    return res.redirect('/drinks');
                }

                // add item to cart
                cart.add(product[0], product[0]._id);

                // store cart in session
                req.session.cart = cart;

                // redirect to drinks page
                res.redirect('/drinks');
            });
        });
    }

    // if item is pizza
    if (model === "pizza") {

        // store pizza input data in variables
        const { pizza, toppingOne, toppingTwo, toppingThree, toppingFour,
            toppingFive, toppingSix, toppingSeven } = req.body;

        // set up neccessary variables
        let done = false;
        let price = null;
        let pizzaTitle = "";

        // create random id
        const randomId = Math.floor(Math.random() * (999999999999999-111111111111111)) + 111111111111111;
        
        // add topping data into array
        let tempArr = [toppingOne, toppingTwo, toppingThree, toppingFour,
            toppingFive, toppingSix, toppingSeven];
        let toppingsArr = [];

        // sort chosen topping data
        for (var i = 0; i < tempArr.length; i++) {
            if (tempArr[i] !== "none") {
                toppingsArr.push(tempArr[i]);
            }
        }

        // if small pizza
        if (pizza === "small") {
            pizzaTitle += "Small Pizza";
            price = 6.99;
        }

        // if medium pizza
        if (pizza === "medium") {
            pizzaTitle += "Medium Pizza";
            price = 9.80;
        }

        // if large pizza
        if (pizza === "large") {
            pizzaTitle += "Large Pizza";
            price = 12.80;
        }

        // if no chosen topping
        if (toppingsArr.length === 0) {
            done = true;
        }

        // if only one chosen topping
        if (toppingsArr.length === 1) {

            // add description to title
            pizzaTitle += ` with ${toppingsArr[0]}`;
            done = true;
        }

        // if more than one chosen topping
        if (toppingsArr.length >= 2) {

            // add description to title and add price
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

        // update pizza data
        const pizzaObj = {
            _id: randomId,
            title: pizzaTitle,
            price: price,
            created_on: new Date()
        };

        // if everything is done
        if (done) {

            // add pizza to cart
            cart.add(pizzaObj, randomId);

            // store new cart in session
            req.session.cart = cart;

            // redirect to pizza page
            res.redirect('/pizza');
        }
    }
}

// reduce individual item in cart
shoppingController.reduceItems = (req, res) => {

    const productId = req.params.id;

    // create new or old cart
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    // reduce cart item by one
    cart.reduceByOne(productId);

    // store updated cart in session
    req.session.cart = cart;

    // redirect to shopping cart
    res.redirect('/shopping-cart');
}

// remove individual item in cart completely
shoppingController.removeAllItems = (req, res) => {

    const productId = req.params.id;

    // create new or old cart
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    // remove product from cart
    cart.removeItem(productId);

    // store updated cart in session
    req.session.cart = cart;

    // redirect to shopping cart
    res.redirect('/shopping-cart');
}

// middleware promo validation
shoppingController.middlewareShoppingCartPromoValidation = (req, res, next) => {

    // if cart in session
    if (req.session.cart) {

        // if there is promo and promo min price is above cart total
        if (req.session.cart.isPromo && req.session.cart.promoMin > req.session.cart.totalPrice) {
            
            // store session cart in variable
            const cart = new Cart(req.session.cart);

            // update promo in cart
            cart.isPromo = false;
            cart.promoName = "";
            cart.promoPercent = 0;
            cart.promoMin = 0;

            // store error in flash
            req.flash('error', `Promo no longer valid. Total price is below valid minimum of $${req.session.cart.promoMin}. Add more and enter promo again.`);
            
            // store updated cart back in session
            req.session.cart = cart;

            // continue
            return next();
        }
    }
    // continue
    return next();
}

// get shopping cart
shoppingController.getShoppingCart = (req, res) => {

    // if no cart in session
    if (!req.session.cart) {

        // render shopping cart
        return res.render('shop/shopping-cart', {products: null});
    }

    // store session cart in variable
    const cart = new Cart(req.session.cart);

    // store flash messages in variable
    const messages = req.flash('error');
    const successMsg = req.flash('success')[0];

    // render shopping cart 
    res.render('shop/shopping-cart', {
        title: 'Cart',
        products: cart.generateArray(),
        messages: messages, 
        hasErrors: messages.length > 0,
        successMsg: successMsg,
        noMessages: !successMsg,
        totalPrice: priceToCompleteString(cart.totalPrice),
        isPromo: cart.isPromo,
        promoTotal: priceToCompleteString(cart.promoTotal),
        afterPromoTotalPrice: priceToCompleteString(cart.afterPromoTotalPrice),
        tax: priceToCompleteString(cart.tax),
        totalAfterTax: priceToCompleteString(cart.totalAfterTax)
    });
}

// get check out page
shoppingController.getCheckOutPage = (req, res) => {

    // if no session cart
    if (!req.session.cart) {

        // redirect to shopping cart
        return res.redirect('/shopping-cart');
    }

    // store session cart in variable
    const cart = new Cart(req.session.cart);

    // store flash message in variable
    let errMsg = req.flash('error')[0];

    // find profile data
    Profile.findOne({user: req.user}, (err, results) => {

        // render check out view page
        res.render('shop/checkout', {
            title: 'Check Out',
            total: cart.totalAfterTax,
            userInfo: results,
            errMsg: errMsg,
            noError: !errMsg
        });
    });
}

// post check out
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

    // store session cart in variable
    const cart = new Cart(req.session.cart);

    // store required Stripe key in variable
    const stripe = require("stripe")(
        process.env.STRIPE_SECRET_KEY
    );
    
    // convert total after tax to cents
    let totalNum = Number.parseFloat(cart.totalAfterTax) * 100;
    totalNum = Number.parseFloat(nearestHundredths(totalNum));
    
    // create stripe charge
    stripe.charges.create({
        amount: totalNum, // cents
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: `Charge for ${req.user.email}`
    }, function(err, charge) {

        // if database error throw error
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }

        // update order 
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

        // if check update info or save info
        if (req.body.updateInfo === "update" || req.body.saveInfo === "save") {

            // find and update user profile data
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

                // if database error throw error
                if (err) {
                    req.flash('error', err.message);
                }
            });
        }

        // save order data
        order.save(function(err, result) {

            // if database error
            if (err) {

                // store error in flash
                req.flash('error', err.message);

                // redirect to check out
                return res.redirect('/checkout');
            }

            // if cart has promo
            if (cart.isPromo) {

                // update promo data
                Promo.update({code: cart.promoName}, {$inc: {
                    used: 1
                }}, {new: true}, (err, promo) => {
                    return;
                });
            }

            // store message in flash
            req.flash('success', 'Payment successful.  Please come pick up in 15-30 mins.');
            
            // clear cart session
            req.session.cart = null;

            // redirect to home page
            return res.redirect('/');
        });
    });
}

module.exports = shoppingController;