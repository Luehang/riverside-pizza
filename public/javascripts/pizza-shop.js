/*
    The idea is to add a more advanced shopping experience.
    When the user first navigates to the pizza shop page
    they are asked what type of pizza they want (ex. small 1 topping, 
    medium 1 topping etc..). The default page should be for the 
    small 1 topping option.

    The user will get the 1 topping of their choice included in their
    price.

    The user should have the option to add more toppings or remove
    previously added toppings.

    The user should see an estimated price for their order.

    A cool thing for the future would be to add the toppings dynamically
    to the picture of the pizza.

    This will be coded with the help of JQuery but using something like
    react in the future would probably be better.
*/

(function ($) {
    $(function () {
        $('select').material_select(updateOrderStats);
    });

    /******************/
    /* IIFE Variables */
    /******************/

    var $selects = $('#pizza-form select'),
        pizzas = [
            ['Small 1 Topping', 6.99],
            ['Medium 1 Topping', 9.80],
            ['Large 1 Topping', 12.80]
        ],
        toppings = [
            ['Empty', '$0.00'],
            ['Italian Sausage', 1.25],
            ['Pepperoni', 1.25],
            ['Mushrooms', 1.25],
            ['Onions', 1.25],
            ['Black Olives', 1.25],
            ['Extra Cheese', 1.25],
            ['Extra Sauce', 1.25]
        ];

    /**********************/
    /* END IIFE Variables */
    /**********************/

    /********************/
    /* Helper Functions */
    /********************/

    function resetMaterialSelect(materialSelect, callback) {
        if (!materialSelect instanceof $) {
            console.error('You need to pass in an jQuery element.');
            return;
        } else if (!materialSelect.is('select')) {
            console.error('materialSelect parameter needs to be a jQuery wrapped select element');
            return;
        } else if (typeof callback != 'function') {
            callback = $.noop;
        }

        materialSelect
            .siblings('input')
            .val('Empty $0.00');

        materialSelect
            .prop('selectedIndex', '0')
            .material_select(updateOrderStats);

        window.setTimeout(callback, 0);
    }

    function updateOrderStats() {

        function emptyLists () {
            $descList.empty();
            $priceList.empty();
        }

        function pushOptions (options) {
            pizzaOptions.push([options[0], options[1]]);
        }

        var $selects = $('#pizza-form select'),
            $descList = $('#description-list'),
            $priceList = $('#price-list'),
            $totalSpan = $('#total-row span'),
            pizzaOptions = [],
            price = 0,
            tax = 1.0875;

        emptyLists();

        $selects.each(function(i) {
            var $self = $(this);
            if (i === 0) { // Select for the type of pizza (ex. Large, Medium, Small)
                var pizza = pizzas[$self.prop('selectedIndex')];
                pushOptions(pizza);
                price += pizza[1];
            } else if (i === 1) { // The included topping
                pushOptions([toppings[$self.prop('selectedIndex')][0], 0.00]);
            } else { // The rest of the toppings
                if ($self.prop('selectedIndex')) {
                    var topping = toppings[$self.prop('selectedIndex')];
                    pushOptions(topping);
                    price += topping[1];
                }
            }
        });

        pizzaOptions.forEach(function(option) {
            $descList.append('<li>' + option[0] + '</li>');
            $priceList.append('<li>' + '$' + option[1].toFixed(2) + '</li>');
        });

        $totalSpan.empty().text('$' + (price * tax).toFixed(2));
    }

    /************************/
    /* END Helper Functions */
    /************************/

    window.onload = function () {

        var canClick = true;

        var $pizzaForm = $('#pizza-form'),
            $addButton = $('#add-topping-btn').parent(),
            foundStart;

        $pizzaForm.on('click', function () {
            updateOrderStats();
        });

        $('.input-field').each(function () {
            var $self = $(this);

            if ($self.attr('data-startDisabled')) {
                foundStart = true; // We can start disabling the other selects now
            }
            if (foundStart) {
                resetMaterialSelect($self.find('select'));

                $self.children() // select-wrapper
                    .children() // select-wrapper's children (ie. the select element)
                    .addClass('select-disabled'); // add class to those 
            }
        });

        if (!foundStart) {
            console.error('Could not find a starting point for the add button.');
            return;
        }

        updateOrderStats();

        $addButton.off('click') // Remove click event before adding one
            .on('click', function () {
                if (!canClick) {
                    return;
                }
                canClick = false;
                window.setTimeout(function () {
                    canClick = true;
                }, 100);

                var invalidAdd = false;
                $('#pizza-form .input-field').each(function (i) {
                    if (i === 0 ||                          // This is the pizza size. It doesn't have an empty option.
                        invalidAdd ||                       // We've already found an invalid empty selected option.
                        !$(this).find('select').length ||   // This doesn't have a select box, this might be used as a text-input container.
                        $(this).hasClass('hide') ||         // We don't care about the hidden input-fields.
                        $(this).find('.select-wrapper')     // Find this' select-wrapper,
                            .children()                     // then collect all the children
                            .hasClass('select-disabled'))   /* and see if any are disabled */ {
                        // If any of the above are true, continue to the next element.
                        return;
                    }
                    if ($(this).find('select').prop('selectedIndex') == 0) { // If 'Empty $0.00' is selected then
                        invalidAdd = true; // the user must choose a topping before adding anymore.
                    }
                });

                if (invalidAdd) {
                    // The user should select a topping before adding anymore.
                    // TODO: tell the user this.
                    return;
                }

                var $self = $(this),
                    $selectWrapper = $self.siblings('.select-wrapper'),
                    $next = $self.parent().next(),
                    $removeBtn = $self.siblings('.btn-aside-form-option');

                $selectWrapper
                    .children()
                    .removeClass('select-disabled');

                $removeBtn.removeClass('hide');

                if (!$next.is('.input-field')) {
                    $addButton.addClass('hide');
                    return;
                }

                $next.removeClass('hide');

                $self.appendTo($next);
            });

        $('.remove-topping-btn').off('click')
            .on('click', function () {
                if (!canClick) {
                    return;
                }
                canClick = false;
                window.setTimeout(function () {
                    canClick = true;
                }, 100);
                var $self = $(this).parent(),
                    $inputField = $self.parent(),
                    $selectWrapper = $self.siblings('.select-wrapper'),
                    $addBtnParent = $addButton.parent();

                resetMaterialSelect($selectWrapper.find('select'), function () {
                    $self.addClass('hide');

                    $addBtnParent.addClass('hide');

                    $inputField
                        .find('.select-wrapper')
                        .children()
                        .addClass('select-disabled');

                    $selectWrapper.children().addClass('select-disabled');

                    $inputField
                        .addClass('hide')
                        .insertBefore('#pizza-form .clearfix');

                    $addButton.removeClass('hide'); // If it has it
                    $('.input-field.hide')
                        .first()
                        .removeClass('hide')
                        .append($addButton);
                });

            });
    };
})(window.jQuery);
