const express               = require('express');
const router                = express.Router();
const passport              = require('passport');
const csrf                  = require('csurf');
const io                    = require('socket.io')(process.env.PORT);

const adminController       = require('../controllers/adminController');

const csrfProtection        = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, isAdmin, (req, res, next) => {
    res.render('user/profile');
});

router.get('/customerhistory', isLoggedIn, isAdmin, adminController.getCustomerHistory);

module.exports = router;

var notification = io
    .of('/admin')
    .on('connection', (socket) => {
        socket.on('test', (data) => {
            console.log(data);
        });
    });

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