const express               = require('express');
const router                = express.Router();
const passport              = require('passport');
const csrf                  = require('csurf');

const userController = require('../controllers/userController');

const csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, (req, res, next) => {
    res.render('user/profile');
});

router.get('/orderhistory', isLoggedIn, userController.getOrderHistoryPage);

router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next) {
    next();
});

router.get('/signup', userController.getSignUpPage);

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        const oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

router.get('/signin', userController.getSignInPage);

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        const oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    // } else if (req.user._id.toString() === process.env.ADMIN) {

    } else {
        res.redirect('/user/profile');
    }
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function isAdmin(req, res, next) {
    if (req.user._id.toString() === process.env.ADMIN) {
        return next();
    }
    res.redirect('/');
}