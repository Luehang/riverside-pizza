const express               = require('express');
const router                = express.Router();
const passport              = require('passport');
const csrf                  = require('csurf');

// controllers
const userController        = require('../controllers/userController');

// middleware csrf protection
const csrfProtection = csrf();
router.use(csrfProtection);

// GET profile page
router.get('/profile', isLoggedIn, userController.getProfilePage);

// POST update profile detail
router.post('/updateprofiledetail', isLoggedIn, userController.postUpdateProfileDetail);

// POST show deletion authenticate
router.post('/delete-account', isLoggedIn, userController.getDeletePage);

// POST confirm deletion
router.post('/confirm-delete', isLoggedIn,
    passport.authenticate('local.signin', {
        failureRedirect: '/',
        failureFlash: true
}), userController.postConfirmDelete);

router.route('/change-password')
    // POST password change page
    .post(isLoggedIn, userController.postChangePasswordPage)
    // GET password change page
    .get(isLoggedIn, userController.getChangePasswordPage)

// POST confirm password change
router.post('/confirm-password-change', isLoggedIn,
    passport.authenticate('local.signin', {
        failureRedirect: '/user/change-password',
        failureFlash: true
}), userController.postConfirmPasswordChange);

// GET order history page
router.get('/orderhistory', isLoggedIn, userController.getOrderHistoryPage);

// GET logout
router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next) {
    next();
});

// GET sign up page
router.get('/signup', userController.getSignUpPage);

// POST sign up
router.post('/signup', userController.postMiddlewareSignUpRecaptchaValidation, 
    passport.authenticate('local.signup', {
        successRedirect: '/user/orderhistory',
        failureRedirect: '/user/signup',
        failureFlash: true
}), userController.getSignUpRedirect);

// GET sign in page
router.get('/signin', userController.getSignInPage);

// POST sign in
router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), userController.getSignInRedirect);

module.exports = router;

// user login authentication function
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// user not log in function
function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}