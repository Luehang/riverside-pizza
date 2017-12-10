const passport              = require('passport');
const bcrypt                = require('bcrypt-nodejs');
const request               = require('request');

// models
const Order                 = require('../models/Order');
const Cart                  = require('../models/Cart');
const Profile               = require('../models/Profile');
const User                  = require('../models/User');

// set up user object
const userController = {};

// get user order history page
userController.getOrderHistoryPage = (req, res) => {

    // find order data
    Order.find({user: req.user}, null, { limit: 50 }, function(err, orders) {
        
        // if database error
        if (err) {

            // render order history page with error
            return res.render('user/orderhistory', {
                messages: ["Error retrieving data."], 
                hasErrors: true
            });
        }

        // reverse orders
        orders = orders.reverse();

        let cart;

        // iterate orders and reorganize items
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });

        // render order history
        res.render('user/orderhistory', { orders: orders });
    });
}

// get profile page
userController.getProfilePage = (req, res) => {

    // store flash message in variables
    const successMsg = req.flash('success')[0];
    let errMsg = req.flash('error')[0];

    // find profile data
    Profile.findOne({user: req.user}, (err, results) => {

        // render profile
        res.render('user/profile', {
            title: 'Profile',
            csrfToken: req.csrfToken(),
            userInfo: results,
            email: req.user.email,
            successMsg: successMsg,
            noMessages: !successMsg,
            errMsg: errMsg,
            noError: !errMsg
        });
    });
}

// post update profile detail
userController.postUpdateProfileDetail = (req, res) => {

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

    // update profile data
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

        // if database error
        if (err) {
            req.flash('error', err.message);
        }

        // redirect to profile
        return res.redirect('/user/profile');
    });
}

// get delete account page
userController.getDeletePage = (req, res) => {

    // render delete account view page
    res.render('user/delete-account', {
        title: 'Delete Account',
        csrfToken: req.csrfToken()
    });
}

// post confirm delete page
userController.postConfirmDelete = (req, res) => {

    // update user data
    User.update({'email': req.user.email}, { $set: {
        is_deleted: true
    }}, {new: true}, (err, user) => {

        // if database error
        if (err) {

            // store message in flash
            req.flash('error', err.message);

            // redirect to home page
            return res.redirect('/');
        }

        // update profile data
        Profile.update({'email': req.user.email}, { $set: {
            is_deleted: true
        }}, {new: true}, (err, profile) => {

            // if database error
            if (err) {

                // store message in flash
                req.flash('error', err.message);

                // redirect to home page
                return res.redirect('/');
            }

            // store message in flash
            req.flash('success', 'Account successfully deleted.  Thank you for being a great customer! Hope to see you again soon!');
            
            // log out of account
            req.logout();

            // redirect to home page
            return res.redirect('/');
        });
    });
}

// post change password page
userController.postChangePasswordPage = (req, res) => {

    // render change password view page
    res.render('user/change-password', {
        title: 'Change Password',
        csrfToken: req.csrfToken()
    });
}

// get change password page
userController.getChangePasswordPage = (req, res) => {

    // store flash message in variable
    const messages = req.flash('error');

    // render change password view page
    res.render('user/change-password', {
        title: 'Change Password',
        csrfToken: req.csrfToken(),
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

// post confirm password change
userController.postConfirmPasswordChange = (req, res) => {

    // validate email and password
    req.checkBody('email', 'Invalid email.').notEmpty().isEmail();
    req.checkBody('newPassword', 'Invalid new password.').notEmpty();
    req.checkBody('newPassword', 'New password needs to be greater than 5 letters.').isLength({min: 5});
    req.checkBody('newPassword', 'New password must contain a number.').matches(/\d/);
    req.checkBody('newPassword', 'New password must contain a capitalized letter.').matches(/[A-Z]/);
    req.checkBody('newPasswordConfirmation', 'New passwords do not match.')
        .custom((value) => value === req.body.newPassword);

    // throw errors if any
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        return res.redirect('/user/change-password');
    }

    // find and update user data
    User.update({'email': req.user.email}, { $set: {
        password: bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync(5), null)
    }}, {new: true}, (err, updatedUser) => {

        // if database error
        if (err) {

            // store message in flash
            req.flash('error', err.message);

            // redirect to change password page
            return res.redirect('/user/change-password');
        }

        // store message in flash
        req.flash('success', 'Successfully changed password.');

        // redirect to profile
        return res.redirect('/user/profile');
    });
}

// post middleware sign up ReCaptcha validation
userController.postMiddlewareSignUpRecaptchaValidation = (req, res, next) => {

    // require ReCaptcha key
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // require ReCaptcha token
    const reCaptchaUserToken = req.body['g-recaptcha-response'];

    // request ip address
    const userIP = req.ip;

    // verification url
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

    // if no ReCaptcha token
    if (reCaptchaUserToken === "") {
        req.flash('error', "Please check \"I'm not a robot\" and try again.");
        return res.redirect('/user/signup');
    }

    // store form data
    const formData = {
        secret: secretKey,
        response: reCaptchaUserToken,
        remoteip: userIP
    }

    // send post to url
    request.post({url: verifyUrl, formData: formData}, (err, res, body) => {

        // if error
        if (err) {
            req.flash('error', "Please check \"I'm not a robot\" and try again.");
            return res.redirect('/user/signup');
        }

        // parse callback data
        body = JSON.parse(body);

        // if success
        if (body.success) {
            return next();
        } else {

            // store message in flash
            req.flash('error', "Please check \"I'm not a robot\" and try again.");
            
            // redirect to sign up
            return res.redirect('/user/signup');
        }
    });
}

// get sign up page
userController.getSignUpPage = (req, res) => {

    // store flash messages in variable
    const messages = req.flash('error');

    // render sign up view page
    res.render('user/signup', {
        title: 'Sign up',
        csrfToken: req.csrfToken(), 
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

// get sign up redirect
userController.getSignUpRedirect = (req, res) => {
    if (req.session.oldUrl) {
        const oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/orderhistory');
    }
}

// get sign in page
userController.getSignInPage = (req, res) => {

    // store flash messages in variable
    const messages = req.flash('error');

    // render sign in view page
    res.render('user/signin', {
        title: 'Sign In',
        csrfToken: req.csrfToken(), 
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

// get sign in redirect
userController.getSignInRedirect = (req, res) => {
    if (req.session.oldUrl) {
        const oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else if (req.user._id.toString() === process.env.ADMIN) {
        res.redirect('/admin/customerhistory');
    } else {
        res.redirect('/user/orderhistory');
    }
}

module.exports = userController;