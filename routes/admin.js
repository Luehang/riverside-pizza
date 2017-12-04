const express               = require('express');
const router                = express.Router();
const passport              = require('passport');
const csrf                  = require('csurf');

const adminController       = require('../controllers/adminController');

const csrfProtection = csrf();
router.use(csrfProtection);

router.get('/customerhistory', isLoggedIn, isAdmin, adminController.getCustomerHistory);

router.get('/user-accounts', isLoggedIn, isAdmin, adminController.getUserAccountsPage);

router.get('/user-accounts/recover', isLoggedIn, isAdmin, adminController.getUserAccountRecoverPage);

router.get('/user-accounts/share-admin', isLoggedIn, isAdmin, adminController.getShareAdmin);

router.get('/user-accounts/:id', isLoggedIn, isAdmin, adminController.getUserProfileAndOrdersPage);



router.post('/user-accounts/confirm-recover', isLoggedIn,
    passport.authenticate('local.signin', {
        failureRedirect: '/admin/user-accounts/recover',
        failureFlash: true
}), adminController.middlewareValidateAdmin, adminController.getUserAccountRecoverConfirm);

router.route('/user-accounts/delete/temp?')
    .get(isLoggedIn, isAdmin, adminController.getUserAccountsDeleteTempPage)
    .delete(isLoggedIn,
        passport.authenticate('local.signin', {
            failureRedirect: '/admin/user-accounts/delete/temp?',
            failureFlash: true
    }), adminController.middlewareValidateAdmin, adminController.deleteUserAccountTemp)

router.route('/user-accounts/delete/perm/user?')
    .get(isLoggedIn, isAdmin, adminController.getUserAccountsDeletePermPage)
    .delete(isLoggedIn,
        passport.authenticate('local.signin', {
            failureRedirect: '/admin/user-accounts/delete/perm/user?',
            failureFlash: true
    }), adminController.middlewareValidateAdmin, adminController.deleteUserAccountPerm)

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
    if (req.user.role === 'admin') {
        return next();
    }
    res.redirect('/');
}