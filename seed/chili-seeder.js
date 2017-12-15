const Chili = require('../models/Chili');

// connect to mongo db
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/riverside-pizza", { useMongoClient: true });

// data to add to mongo db
const chilis = [
    new Chili({
        title: 'Manitowoc Hometown Chili',
        description: '32 oz. only',
        select: [
            {
                size: 32,
                price: 5.29
            }
        ]
    }),
    new Chili({
        title: 'Regular Chili',
        description: '16 or 32 oz.',
        select: [
            {
                size: 16,
                price: 3.20
            },
            {
                size: 32,
                price: 5.29
            }
        ]
    }),
    new Chili({
        title: 'Hot Dog Chili',
        description: '16 or 32 oz.',
        select: [
            {
                size: 16,
                price: 3.20
            },
            {
                size: 32,
                price: 5.29
            }
        ]
    }),
    new Chili({
        title: 'Potato Chili',
        description: '16 or 32 oz.',
        select: [
            {
                size: 16,
                price: 3.20
            },
            {
                size: 32,
                price: 5.29
            }
        ]
    }),
    new Chili({
        title: 'Vegetable Chili',
        description: '16 or 32 oz.',
        select: [
            {
                size: 16,
                price: 3.20
            },
            {
                size: 32,
                price: 5.29
            }
        ]
    }),
    new Chili({
        title: 'Extra Hot Chili',
        description: '16 or 32 oz.',
        select: [
            {
                size: 16,
                price: 3.20
            },
            {
                size: 32,
                price: 5.29
            }
        ]
    })
];

// clear data collection
mongoose.connection.dropCollection('chilis', (err, result) => {
    // iterate over data and add to db
    var done = 0;
    for (var i = 0; i < chilis.length; i++) {
        chilis[i].save(function(err, result) {
            done++;
            if (done === chilis.length) {
                exit();
            }
        });
    }
});

// db disconnection function
function exit() {
    mongoose.disconnect();
}