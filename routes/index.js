const express               = require('express');
const router                = express.Router();

// controllers
const menuController        = require('../controllers/menuController');
const shoppingController    = require('../controllers/shoppingController');

// GET home page
router.get('/', menuController.getHomePage);

// GET deals page
router.get('/deals', menuController.getDealsPage);

// GET pizza page
router.get('/pizza', menuController.getPizzaPage);

// GET chili page
router.get('/chili', menuController.getChiliPage);

// GET drinks page
router.get('/drinks', menuController.getDrinksPage);

// PUT update promo code
router.put('/promo-code',  shoppingController.putUpdatePromoCode);

// POST item to cart
router.post('/add-to-cart/:id', shoppingController.addToCart);

// GET reduce individual item quantity
router.get('/reduce/:id', shoppingController.reduceItems);

// GET remove individual whole item
router.get('/remove/:id', shoppingController.removeAllItems);

// GET shopping cart page
router.get('/shopping-cart', 
    shoppingController.middlewareShoppingCartPromoValidation,
    shoppingController.getShoppingCart);

// GET check out page
router.get('/checkout', isLoggedIn, shoppingController.getCheckOutPage);

// POST check out submit
router.post('/checkout', 
    isLoggedIn, 
    shoppingController.postCheckOut);

module.exports = router;

// user login authentication function
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}
