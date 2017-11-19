const express               = require('express');
const router                = express.Router();
const passport              = require('passport');
const csrf                  = require('csurf');

const userController        = require('../controllers/userController');

const csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, userController.getProfilePage);

router.post('/updateprofiledetail', isLoggedIn, userController.postUpdateProfileDetail);

router.post('/delete-account', isLoggedIn, userController.getDeletePage);

router.post('/confirm-delete', isLoggedIn,
    passport.authenticate('local.signin', {
        failureRedirect: '/',
        failureFlash: true
}), userController.postConfirmDelete);

router.route('/change-password')
    .post(isLoggedIn, userController.postChangePasswordPage)
    .get(isLoggedIn, userController.getChangePasswordPage)

router.post('/confirm-password-change', isLoggedIn,
    passport.authenticate('local.signin', {
        failureRedirect: '/user/change-password',
        failureFlash: true
}), userController.postConfirmPasswordChange);

router.get('/orderhistory', isLoggedIn, userController.getOrderHistoryPage);

router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next) {
    next();
});

router.get('/signup', userController.getSignUpPage);

router.post('/signup', userController.postMiddlewareSignUpRecaptchaValidation, 
    passport.authenticate('local.signup', {
        successRedirect: '/user/orderhistory',
        failureRedirect: '/user/signup',
        failureFlash: true
}), userController.getSignUpRedirect);

router.get('/signin', userController.getSignInPage);

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), userController.getSignInRedirect);

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