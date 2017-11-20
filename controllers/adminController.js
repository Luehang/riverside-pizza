const csrf                  = require('csurf');
const passport              = require('passport');
const bcrypt                = require('bcrypt-nodejs');

const Order                 = require('../models/Order');
const Cart                  = require('../models/Cart');
const User                  = require('../models/User');
const Profile               = require('../models/Profile');

const functionController    = require('../controllers/functionController');
const nearestHundredths     = functionController.nearestHundredths;

const adminController = {};

adminController.getCustomerHistory = (req, res) => {
    Order.find({}, null, { limit: 75 }, function(err, orders) {
        if (err) {
            return res.render('admin/customerhistory', {
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
        res.render('admin/customerhistory', { orders: orders });
    });
}

adminController.getUserAccountsPage = (req, res) => {
    const successMsg = req.flash('success')[0];
    User.find({'is_deleted': false}, 'email created_at', (err, users) => {
        User.find({'is_deleted': true}, 'email created_at', (err, deletedUsers) => {
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

adminController.getUserProfileAndOrdersPage = (req, res) => {
    const id = req.params.id;
    const user = req.query.user;
    Profile.findOne({user: id}, (err, profile) => {
        Order.findOne({user: id}, (err, order) => {
            if (order) {
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
                    totalBeforeTax = nearestHundredths(totalBeforeTax);
                    totalPromo = nearestHundredths(totalPromo);
                    totalTax = nearestHundredths(totalTax);
                    totalAfterTax = nearestHundredths(totalAfterTax);
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

adminController.getUserAccountRecoverPage = (req, res) => {
    const userEmail = req.query.user;
    const messages = req.flash('error');
    res.render('admin/recover-account', {
        title: 'Recover Account',
        userEmail: userEmail,
        csrfToken: req.csrfToken(),
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

adminController.middlewareValidateAdmin = (req, res, next) => {
    if (req.user._id.toString() === process.env.ADMIN) {
        return next();
    }
    req.logout();
    req.flash('error', 'Need to be admin to authorize.');
    return res.redirect('/');
}

adminController.getUserAccountRecoverConfirm = (req, res) => {
    req.checkBody('userEmail', 'Invalid user recovery email.').notEmpty().isEmail();
    req.checkBody('userPassword', 'Invalid temporarily password.').notEmpty();
    req.checkBody('userPassword', 'Temporarily user password needs to be greater than 5 letters.').isLength({min: 5});
    req.checkBody('userPasswordConfirmation', 'Temporarily user passwords do not match.')
        .custom((value) => value === req.body.userPassword);
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        return res.redirect('/admin/user-accounts/recover');
    }
    User.update({'email': req.body.userEmail}, { $set: {
        password: bcrypt.hashSync(req.body.userPassword, bcrypt.genSaltSync(5), null),
        is_deleted: false
    }}, {new: true}, (err, updatedUser) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/admin/user-accounts/recover');
        }
        Profile.update({'email': req.body.userEmail}, { $set: {
            is_deleted: false
        }}, {new: true}, (err, profile) => {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/admin/user-accounts/recover');
            }
            req.flash('success', 'Successfully recovered account.')
            return res.redirect('/admin/user-accounts');
        });
    });
}

adminController.getUserAccountsDeleteTempPage = (req, res) => {
    const userEmail = req.query.user;
    const messages = req.flash('error');
    res.render('admin/delete-account', {
        title: 'Recover Account',
        userEmail: userEmail,
        csrfToken: req.csrfToken(),
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

adminController.deleteUserAccountTemp = (req, res) => {
    req.checkBody('userEmail', 'Invalid user email.').notEmpty().isEmail();
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
    User.update({'email': email}, { $set: {
        is_deleted: true
    }}, {new: true}, (err, updatedUser) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/admin/user-accounts/delete/temp?');
        }
        if(updatedUser.nModified === 0) {
            req.flash('error', 'User not found.');
            return res.redirect('/admin/user-accounts/delete/temp?');
        }
        Profile.update({'email': email}, { $set: {
            is_deleted: true
        }}, {new: true}, (err, updatedProfile) => {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/admin/user-accounts/delete/temp?');
            }
            req.flash('success', 'Successfully deleted user.');
            return res.redirect('/admin/user-accounts');
        });
    });
}

adminController.getUserAccountsDeletePermPage = (req, res) => {
    const userEmail = req.query.user;
    const messages = req.flash('error');
    res.render('admin/perm-delete-account', {
        title: 'Recover Account',
        userEmail: userEmail,
        csrfToken: req.csrfToken(),
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

adminController.deleteUserAccountPerm = (req, res) => {
    req.checkBody('userEmail', 'Invalid user recovery email.').notEmpty().isEmail();
    req.checkBody('userEmailConfirmation', 'User emails do not match.')
        .custom((value) => value === req.body.userEmail);
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
    Profile.remove({'email': email},  (err, profileRemovedData) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/admin/user-accounts/delete/perm/user?');
        }
        User.findOne({'email': email}, (err, user) => {
            if (!user) {
                req.flash('error', 'User not found.');
                return res.redirect('/admin/user-accounts/delete/perm/user?');
            }
            Order.remove({'user': user}, (err, orderRemovedData) => {
                User.remove({'email': email}, (err, userRemovedData) => {
                    if (err) {
                        req.flash('error', err.message);
                        return res.redirect('/admin/user-accounts/delete/perm/user?');
                    }
                    if (userRemovedData.result.n === 0) {
                        req.flash('error', 'User not found.');
                        return res.redirect('/admin/user-accounts/delete/perm/user?');
                    }
                    req.flash('success', 'Successfully deleted user permanently.');
                    return res.redirect('/admin/user-accounts');
                });
            });
        });
    });
}

module.exports = adminController;