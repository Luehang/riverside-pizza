const Drink = require('../models/Drink');

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/riverside-pizza", { useMongoClient: true });

const drinks = [
    new Drink({
        imagePath: "img/coke.jpg",
        title: 'Coca Cola',
        description: '16 oz. or 2 Liters',
        select: [
            {
                size: "16 oz.",
                price: 1.67
            },
            {
                size: "2 Liters",
                price: 2.67
            }
        ]
    }),
    new Drink({
        imagePath: "img/coke.jpg",
        title: 'Mountain Dew',
        description: '16 oz. or 2 Liters',
        select: [
            {
                size: "16 oz.",
                price: 1.67
            },
            {
                size: "2 Liters",
                price: 2.67
            }
        ]
    }),
    new Drink({
        imagePath: "img/water.jpg",
        title: 'Bottled Water',
        description: '16 oz.',
        select: [
            {
                size: "16 oz.",
                price: 1.67
            }
        ]
    })
];

mongoose.connection.dropCollection('drinks', (err, result) => {
    return;
});

var done = 0;
for (var i = 0; i < drinks.length; i++) {
    drinks[i].save(function(err, result) {
        done++;
        if (done === drinks.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}