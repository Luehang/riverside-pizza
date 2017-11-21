const Chili = require('../models/Chili');

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/riverside-pizza", { useMongoClient: true });

const chilis = [
    new Chili({
        imagePath: "img/no-image.png",
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
        imagePath: "img/no-image.png",
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
        imagePath: "img/no-image.png",
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

mongoose.connection.dropCollection('chilis', (err, result) => {
    return;
});

var done = 0;
for (var i = 0; i < chilis.length; i++) {
    chilis[i].save(function(err, result) {
        done++;
        if (done === chilis.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}