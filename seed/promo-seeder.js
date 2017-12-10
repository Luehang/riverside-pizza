const Promo = require('../models/Promo');

// connect to mongo db
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/riverside-pizza", { useMongoClient: true });

// data to add to mongo db
const promos = [
    new Promo({
        code: '15OFF',
        description: '15 percent off orders over $5.',
        percent: 0.15,
        min: 5,
        start_date: new Date(2017, 11 - 1, 19),
        end_date: new Date(2019, 1 - 1, 1),
        limit: 20
    })
];

// clear data collection
mongoose.connection.dropCollection('promos', (err, result) => {
    // iterate over data and add to db
    var done = 0;
    for (var i = 0; i < promos.length; i++) {
        promos[i].save(function(err, result) {
            done++;
            if (done === promos.length) {
                exit();
            }
        });
    }
});

// db disconnection function
function exit() {
    mongoose.disconnect();
}