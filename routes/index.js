const express               = require('express');
const router                = express.Router();

const menuController        = require('../controllers/menuController');
const shoppingController    = require('../controllers/shoppingController');

/* GET home page. */
router.get('/', menuController.getHomePage);

router.get('/deals', (req, res) => {
    
})

router.get('/pizza', menuController.getPizzaPage);

router.get('/chili', menuController.getChiliPage);

router.get('/drinks', menuController.getDrinksPage);

router.post('/add-to-cart/:id', shoppingController.addToCart);

// router.get('/add-to-cart/:id', function(req, res, next) {
//     const productId = req.params.id;
//     const cart = new Cart(req.session.cart ? req.session.cart : {});

//     Product.findById(productId, function(err, product) {
//         if (err) {
//             return res.redirect('/');
//         }
//         cart.add(product, product.id);
//         req.session.cart = cart;
//         // console.log(req.session.cart);
//         res.redirect('/');
//     });
// });

router.get('/reduce/:id', shoppingController.reduceItems);

router.get('/remove/:id', shoppingController.removeAllItems);

router.get('/shopping-cart', shoppingController.getShoppingCart);

router.get('/checkout', isLoggedIn, shoppingController.getCheckOutPage);

router.post('/checkout', 
    isLoggedIn, 
    shoppingController.postCheckOut);

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}
