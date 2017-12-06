const csrf                  = require('csurf');
const passport              = require('passport');
const bcrypt                = require('bcrypt-nodejs');

// models
const Order                 = require('../models/Order');
const Cart                  = require('../models/Cart');
const User                  = require('../models/User');
const Profile               = require('../models/Profile');

// controllers
const functionController    = require('../controllers/functionController');

// functions
const nearestHundredths     = functionController.nearestHundredths;

// set up admin object
const adminController = {};

// get customer history page
adminController.getCustomerHistory = (req, res) => {
    
    // get customer order history from db
    Order.find({}, null, { limit: 75 }, function(err, orders) {

        // throw db error
        if (err) {
            return res.render('admin/customerhistory', {
                messages: ["Error retrieving data."], 
                hasErrors: true
            });
        }

        // reverse orders
        orders = orders.reverse();
        let cart;

        // reorganize each order items
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });

        // render customer history in view
        res.render('admin/customerhistory', { orders: orders });
    });
}

// get user accounts page
adminController.getUserAccountsPage = (req, res) => {

    // store success message in variable
    const successMsg = req.flash('success')[0];

    // find user not deleted
    User.find({'is_deleted': false}, 'email created_at', (err, users) => {

        // find user deleted
        User.find({'is_deleted': true}, 'email created_at', (err, deletedUsers) => {

            // render user accounts
            res.render('admin/user-accounts', {
                title: 'User Accounts',
                users: users.reverse(),
                deletedUsers: deletedUsers.reverse(),
                successMsg: successMsg,
                noMessages: !successMsg,
            });
        });
    });
}

// get user profile and orders page
adminController.getUserProfileAndOrdersPage = (req, res) => {
    const id = req.params.id;
    const user = req.query.user;

    // find user profile
    Profile.findOne({user: id}, (err, profile) => {

        // find user order
        Order.findOne({user: id}, (err, order) => {

            // if there is order
            if (order) {

                // find user orders
                Order.find({user: id}, null, {limit: 30}, (err, orders) => {
                    orders = orders.reverse();
                    let cart;
                    let totalBeforeTax = 0;
                    let totalPromo = 0;
                    let totalPromoUsed = 0;
                    let totalTax = 0;
                    let totalAfterTax = 0;
                    const qty = orders.length;

                    orders.forEach(function(order) {
                        cart = new Cart(order.cart);
                        order.items = cart.generateArray();
                        totalBeforeTax += Number.parseFloat(order.cart.totalPrice);
                        if (order.cart.isPromo) { 
                            totalPromo += Number.parseFloat(order.cart.promoTotal);
                            totalPromoUsed++;
                        }
                        totalTax += Number.parseFloat(order.cart.tax);
                        totalAfterTax += Number.parseFloat(order.cart.totalAfterTax);
                    });

                    // total before tax
                    totalBeforeTax = nearestHundredths(totalBeforeTax);

                    // total promo
                    totalPromo = nearestHundredths(totalPromo);

                    // total tax
                    totalTax = nearestHundredths(totalTax);

                    // total after tax
                    totalAfterTax = nearestHundredths(totalAfterTax);

                    // render user account view page
                    res.render('admin/user-account', {
                        title: 'User\'s Profile',
                        profile: profile,
                        email: user,
                        orders: orders,
                        ordersQty: qty,
                        totalBeforeTax: totalBeforeTax,
                        totalPromo: totalPromo,
                        totalPromoUsed: totalPromoUsed,
                        totalTax: totalTax,
                        totalAfterTax: totalAfterTax
                    });
                });
            } else {
                // render user account
                res.render('admin/user-account', {
                    title: 'User\'s Profile',
                    profile: profile,
                    orders: order,
                    email: user
                });
            }
        });
    });
}

// get user individual account recover page
adminController.getUserAccountRecoverPage = (req, res) => {
    const userEmail = req.query.user;
    const messages = req.flash('error');

    // render recover account
    res.render('admin/recover-account', {
        title: 'Recover Account',
        userEmail: userEmail,
        csrfToken: req.csrfToken(),
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

// middleware validate admin
adminController.middlewareValidateAdmin = (req, res, next) => {
    if (req.user._id.toString() === process.env.ADMIN) {
        return next();
    }
    req.logout();
    req.flash('error', 'Need to be admin to authorize.');
    return res.redirect('/');
}

// get user individual account recover confirm
adminController.getUserAccountRecoverConfirm = (req, res) => {

    // validate user and password
    req.checkBody('userEmail', 'Invalid user recovery email.').notEmpty().isEmail();
    req.checkBody('userPassword', 'Invalid temporarily password.').notEmpty();
    req.checkBody('userPassword', 'Temporarily user password needs to be greater than 5 letters.').isLength({min: 5});
    req.checkBody('userPasswordConfirmation', 'Temporarily user passwords do not match.')
        .custom((value) => value === req.body.userPassword);

    // if error throw error
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        return res.redirect('/admin/user-accounts/recover');
    }

    // find and update user account
    User.update({'email': req.body.userEmail}, { $set: {
        password: bcrypt.hashSync(req.body.userPassword, bcrypt.genSaltSync(5), null),
        is_deleted: false
    }}, {new: true}, (err, updatedUser) => {

        // if database error throw error
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/admin/user-accounts/recover');
        }

        // find and update profile
        Profile.update({'email': req.body.userEmail}, { $set: {
            is_deleted: false
        }}, {new: true}, (err, profile) => {
            // if database error throw error
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/admin/user-accounts/recover');
            }

            // store success message
            req.flash('success', 'Successfully recovered account.')

            // redirect to user accounts
            return res.redirect('/admin/user-accounts');
        });
    });
}

// get user account temporarily delete page
adminController.getUserAccountsDeleteTempPage = (req, res) => {
    const userEmail = req.query.user;

    // store error in variable
    const messages = req.flash('error');

    // render delete account view page
    res.render('admin/delete-account', {
        title: 'Recover Account',
        userEmail: userEmail,
        csrfToken: req.csrfToken(),
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

// delete user account temporarily 
adminController.deleteUserAccountTemp = (req, res) => {

    // simple first validate email
    req.checkBody('userEmail', 'Invalid user email.').notEmpty().isEmail();

    // if error throw error
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        return res.redirect('/admin/user-accounts/delete/temp?');
    }

    const email = req.body.userEmail;

    // find and update user account
    User.update({'email': email}, { $set: {
        is_deleted: true
    }}, {new: true}, (err, updatedUser) => {

        // if database error throw error
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/admin/user-accounts/delete/temp?');
        }

        // if user not found throw error
        if(updatedUser.nModified === 0) {
            req.flash('error', 'User not found.');
            return res.redirect('/admin/user-accounts/delete/temp?');
        }

        // find and update profile
        Profile.update({'email': email}, { $set: {
            is_deleted: true
        }}, {new: true}, (err, updatedProfile) => {

            // if database error throw error
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/admin/user-accounts/delete/temp?');
            }

            // store success message
            req.flash('success', 'Successfully deleted user.');

            // redirect to user accounts
            return res.redirect('/admin/user-accounts');
        });
    });
}

// get user individual account permanent delete page
adminController.getUserAccountsDeletePermPage = (req, res) => {
    const userEmail = req.query.user;
    const messages = req.flash('error');

    // render permanent delete account view page
    res.render('admin/perm-delete-account', {
        title: 'Recover Account',
        userEmail: userEmail,
        csrfToken: req.csrfToken(),
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

// delete user account permanently
adminController.deleteUserAccountPerm = (req, res) => {

    // validate email
    req.checkBody('userEmail', 'Invalid user recovery email.').notEmpty().isEmail();
    req.checkBody('userEmailConfirmation', 'User emails do not match.')
        .custom((value) => value === req.body.userEmail);

    // if error throw error
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        return res.redirect('/admin/user-accounts/delete/perm/user?');
    }

    const email = req.body.userEmail;

    // find and remove profile
    Profile.remove({'email': email},  (err, profileRemovedData) => {

        // if database error throw error
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/admin/user-accounts/delete/perm/user?');
        }
        // find user data
        User.findOne({'email': email}, (err, user) => {

            // if database error throw error
            if (!user) {
                req.flash('error', 'User not found.');
                return res.redirect('/admin/user-accounts/delete/perm/user?');
            }

            // find and remove user order data
            Order.remove({'user': user}, (err, orderRemovedData) => {

                // find and remove user
                User.remove({'email': email}, (err, userRemovedData) => {
                    // if database error throw error
                    if (err) {
                        req.flash('error', err.message);
                        return res.redirect('/admin/user-accounts/delete/perm/user?');
                    }

                    // store success in flash
                    req.flash('success', 'Successfully deleted user permanently.');
                    
                    // redirect to user accounts
                    return res.redirect('/admin/user-accounts');
                });
            });
        });
    });
}

module.exports = adminController;