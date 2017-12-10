const express               = require('express');
const router                = express.Router();
const passport              = require('passport');
const csrf                  = require('csurf');

// controllers
const adminController       = require('../controllers/adminController');

// middleware csrf protection
const csrfProtection = csrf();
router.use(csrfProtection);

// GET customer history page
router.get('/customerhistory', isLoggedIn, isAdmin, adminController.getCustomerHistory);

// GET user accounts page
router.get('/user-accounts', isLoggedIn, isAdmin, adminController.getUserAccountsPage);

// GET user individual account recover page
router.get('/user-accounts/recover', isLoggedIn, isAdmin, adminController.getUserAccountRecoverPage);



// GET user individual account profile and history page
router.get('/user-accounts/:id', isLoggedIn, isAdmin, adminController.getUserProfileAndOrdersPage);

// POST user individual account recover page

router.post('/user-accounts/confirm-recover', isLoggedIn,
    passport.authenticate('local.signin', {
        failureRedirect: '/admin/user-accounts/recover',
        failureFlash: true
}), adminController.middlewareValidateAdmin, adminController.getUserAccountRecoverConfirm);

router.route('/user-accounts/delete/temp?')
    // GET user individual account delete temporary page
    .get(isLoggedIn, isAdmin, adminController.getUserAccountsDeleteTempPage)
    // DELETE user individual account temporarily
    .delete(isLoggedIn,
        passport.authenticate('local.signin', {
            failureRedirect: '/admin/user-accounts/delete/temp?',
            failureFlash: true
    }), adminController.middlewareValidateAdmin, adminController.deleteUserAccountTemp)

router.route('/user-accounts/delete/perm/user?')
    // GET user individual account delete permanent page
    .get(isLoggedIn, isAdmin, adminController.getUserAccountsDeletePermPage)
    // DELETE user individual account permanent
    .delete(isLoggedIn,
        passport.authenticate('local.signin', {
            failureRedirect: '/admin/user-accounts/delete/perm/user?',
            failureFlash: true
    }), adminController.middlewareValidateAdmin, adminController.deleteUserAccountPerm)

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

// admin authentication function
function isAdmin(req, res, next) {
    if (req.user.role === 'admin') {
        return next();
    }
    res.redirect('/');
}
