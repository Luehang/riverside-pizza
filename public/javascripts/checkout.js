Stripe.setPublishableKey('pk_live_LPJdPgXmwA5EpBpSVRpvxQat');

const admin = io('/admin');   
const $number = $('#card-number');
const $cvc = $('#card-cvc');
const $exp_month = $('#card-expiry-month');
const $exp_year = $('#card-expiry-year');
const $form = $('#checkout-form');

$(document).ready(function() {
    $form.find('button').prop('disabled', true);

    const validateForm = setInterval(function() {
        if ($number.val() !== "") {
            Stripe.card.validateCardNumber($number.val())
            ? $number.removeClass('alert-danger') 
            : $number.addClass('alert-danger') 
        }
        if (Stripe.card.cardType($number.val()) !== "Unknown") {
            $('#card-type').text(Stripe.card.cardType($number.val()));
            $('#card-type').removeClass('hidden');
        } else {
            $('#card-type').addClass('hidden');
        }
        if ($exp_month.val() !== "" && $exp_year.val() !== "") {
            if (Stripe.card.validateExpiry($exp_month.val(), $exp_year.val())) {
                $exp_month.removeClass('alert-danger');
                $exp_year.removeClass('alert-danger');
            } else {
                $exp_month.addClass('alert-danger');
                $exp_year.addClass('alert-danger');
            }
        }
        if ($cvc.val() !== "") {
            Stripe.card.validateCVC($cvc.val())
            ? $cvc.removeClass('alert-danger')
            : $cvc.addClass('alert-danger')
        }
        if (Stripe.card.validateCardNumber($number.val()) 
        && Stripe.card.validateExpiry($exp_month.val(), $exp_year.val())
        && Stripe.card.validateCVC($cvc.val())
        && $('#first-name').val() !== "" && $('#last-name').val() !== ""
        && $('#address1').val() !== "" && $('#address-city').val() !== "" 
        && $('#address-state').val() !== "" && $('#address-country').val() !== ""
        && $('#address-zip').val() !== "" && $('#card-name').val() !== "") {
            $form.find('button').prop('disabled', false);
        }
    }, 100);

    $form.find('button').click(function() {
        $form.submit();
    });

    $form.submit(function(event) {
        $('#charge-error').addClass('hidden');
        $form.find('button').prop('disabled', true);
        admin.emit('order notify', 'New order.');
        Stripe.card.createToken({
            number: $number.val(),
            cvc: $cvc.val(),
            exp_month: $exp_month.val(),
            exp_year: $exp_year.val(),
            name: $('#card-name').val(),
            address_line1: $('#address1').val(),
            address_line2: $('#address2').val(),
            address_city: $('#address-city').val(),
            address_state: $('#address-state').val(),
            address_zip: $('#address-zip').val(),
            address_country: $('#address-country').val()
        }, stripeResponseHandler);
        return false;
    });

    function stripeResponseHandler(status, response) {
        if (response.error) { // Problem!
            
            // Show the errors on the form
            $('#charge-error').text(response.error.message);
            $('#charge-error').removeClass('hidden');
            $form.find('button').prop('disabled', false); // Re-enable submission

        } else { // Token was created!
            
            // Get the token ID:
            var token = response.id;

            // Insert the token into the form so it gets submitted to the server:
            $form.append($('<input type="hidden" name="stripeToken" />').val(token));

            // Submit the form:
            $form.get(0).submit();

        }
    }

});


