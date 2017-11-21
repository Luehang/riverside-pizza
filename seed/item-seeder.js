const Product = require('../models/Product');

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/riverside-pizza", { useMongoClient: true });

const products = [
    new Product({
        title: 'Manitowoc Hometown Chili 32 oz.',
        description: '32 oz.',
        price: 5.29,
    }),
    new Product({
        title: 'Regular Chili 16 oz.',
        description: '16 oz.',
        price: 3.20,
    }),
    new Product({
        title: 'Regular Chili 32 oz.',
        description: '32 oz.',
        price: 5.29,
    }),
    new Product({
        title: 'Potato Chili 16 oz.',
        description: '16 oz.',
        price: 3.20,
    }),
    new Product({
        title: 'Potato Chili 32 oz.',
        description: '32 oz.',
        price: 5.29,
    }),
    new Product({
        title: 'Hot Dog Chili 16 oz.',
        description: '16 oz.',
        price: 3.20,
    }),
    new Product({
        title: 'Hot Dog Chili 32 oz.',
        description: '32 oz.',
        price: 5.29,
    }),
    new Product({
        title: 'Vegetable Chili 16 oz.',
        description: '16 oz.',
        price: 3.20,
    }),
    new Product({
        title: 'Vegetable Chili 32 oz.',
        description: '32 oz.',
        price: 5.29,
    }),
    new Product({
        title: 'Extra Hot Chili 16 oz.',
        description: '16 oz.',
        price: 3.20,
    }),
    new Product({
        title: 'Extra Hot Chili 32 oz.',
        description: '32 oz.',
        price: 5.29,
    }),
    new Product({
        title: 'Coca Cola 16 oz.',
        description: '16 oz.',
        price: 1.67,
    }),
    new Product({
        title: 'Coca Cola 2 Liters',
        description: '2 Liters',
        price: 2.67,
    }),
    new Product({
        title: 'Mountain Dew 16 oz.',
        description: '16 oz.',
        price: 1.67,
    }),
    new Product({
        title: 'Mountain Dew 2 Liters',
        description: '2 Liters',
        price: 2.67,
    }),
    new Product({
        title: 'Bottled Water 16 oz.',
        description: '16 oz.',
        price: 1.67,
    })
];

mongoose.connection.dropCollection('products', (err, result) => {
    return;
});

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function(err, result) {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}