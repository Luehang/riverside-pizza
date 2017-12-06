const passport              = require('passport');
const LocalStrategy         = require('passport-local').Strategy;
const bcrypt                = require('bcrypt-nodejs');

// models
const User                  = require('../models/User');

// serialize user
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// deserialize user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// sign up
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    // check for valid email and password
    req.checkBody('email', 'Invalid email.').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password.').notEmpty();
    req.checkBody('password', 'Password needs to be greater than 5 letters.').isLength({min: 5});
    //req.checkBody('password', 'Password must contain a number.').matches(/\d/);
    //req.checkBody('password', 'Password must contain a capitalized letter.').matches(/[A-Z]/);
    req.checkBody('passwordConfirmation', 'Passwords do not match.')
        .custom((value) => value === req.body.password);

    // throw errors if any
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    // validate user if it exists
    User.findOne({'email': email.toLowerCase()}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'Email is already in use.'});
        }

        // create new user model
        const newUser = new User();

        // add user email
        newUser.email = email.toLowerCase();

        // encrypt and add password
        newUser.password = newUser.encryptPassword(password);

        // save user in db
        newUser.save(function(err, result) {
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));

// sign in
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    // first simple check up of email and password
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 5});

    // throw error if any
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    // find user in db
    User.findOne({'email': email.toLowerCase(), 'is_deleted': false}, function (err, user) {
        if (err) {
            return done(err);
        }

        // if user not found throw error
        if (!user) {
            return done(null, false, {message: 'No user found.'});
        }

        // if password doesn't match throw error
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Wrong password.'});
        }
        return done(null, user);
    });
}));