const passport              = require('passport');
const bcrypt                = require('bcrypt-nodejs');

const Order                 = require('../models/Order');
const Cart                  = require('../models/Cart');
const Profile               = require('../models/Profile');
const User                  = require('../models/user');

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

userController.getProfilePage = (req, res) => {
    const successMsg = req.flash('success')[0];
    let errMsg = req.flash('error')[0];
    Profile.findOne({user: req.user}, (err, results) => {
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
        return res.redirect('/user/profile');
    });
}

userController.getDeletePage = (req, res) => {
    res.render('user/delete-account', {
        title: 'Delete Account',
        csrfToken: req.csrfToken()
    });
}

userController.postConfirmDelete = (req, res) => {
    User.update({'email': req.user.email}, { $set: {
        is_deleted: true
    }}, {new: true}, (err, user) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/');
        }
        Profile.update({'email': req.user.email}, { $set: {
            is_deleted: true
        }}, {new: true}, (err, profile) => {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('success', 'Account successfully deleted.  Thank you for being a great customer! Hope to see you again soon!');
            req.logout();
            return res.redirect('/');
        });
    });
}

userController.postChangePasswordPage = (req, res) => {
    res.render('user/change-password', {
        title: 'Change Password',
        csrfToken: req.csrfToken()
    });
}

userController.getChangePasswordPage = (req, res) => {
    const messages = req.flash('error');
    res.render('user/change-password', {
        title: 'Change Password',
        csrfToken: req.csrfToken(),
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

userController.postConfirmPasswordChange = (req, res) => {
    req.checkBody('email', 'Invalid email.').notEmpty().isEmail();
    req.checkBody('newPassword', 'Invalid new password.').notEmpty();
    req.checkBody('newPassword', 'New password needs to be greater than 5 letters.').isLength({min: 5});
    req.checkBody('newPassword', 'New password must contain a number.').matches(/\d/);
    req.checkBody('newPassword', 'New password must contain a capitalized letter.').matches(/[A-Z]/);
    req.checkBody('newPasswordConfirmation', 'New passwords do not match.')
        .custom((value) => value === req.body.newPassword);
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        return res.redirect('/user/change-password');
    }
    User.update({'email': req.user.email}, { $set: {
        password: bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync(5), null)
    }}, {new: true}, (err, updatedUser) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/user/change-password');
        }
        req.flash('success', 'Successfully changed password.')
        return res.redirect('/user/profile');
    });
}

userController.getSignUpPage = (req, res) => {
    const messages = req.flash('error');
    res.render('user/signup', {
        title: 'Sign up',
        csrfToken: req.csrfToken(), 
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

userController.getSignUpRedirect = (req, res) => {
    if (req.session.oldUrl) {
        const oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/orderhistory');
    }
}

userController.getSignInPage = (req, res) => {
    const messages = req.flash('error');
    res.render('user/signin', {
        title: 'Sign In',
        csrfToken: req.csrfToken(), 
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

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