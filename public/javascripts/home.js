// let slideIndex = 0;
// let autoSlides;

// function manualSlides(n) {
//     var i;
//     var slides = document.getElementsByClassName("slides");
//     var dots = document.getElementsByClassName("dot");
//     if (n > slides.length - 1) {slideIndex = 0} 
//     if (n < 0) {slideIndex = slides.length - 1}
//     for (i = 0; i < slides.length; i++) {
//         slides[i].style.display = "none"; 
//     }
//     for (i = 0; i < dots.length; i++) {
//         dots[i].className = dots[i].className.replace(" active", "");
//     }
//     slides[slideIndex].style.display = "block"; 
//     dots[slideIndex].className += " active";
// }

// setTimeout(function() {
//     manualSlides(slideIndex);
// }, 10);

// autoSlides = setInterval(function() {
//     slideIndex++;
//     manualSlides(slideIndex);
// }, 4000);

// function plusSlides(n) {
//     clearInterval(autoSlides);
//     manualSlides(slideIndex += n);
//     autoSlides = setInterval(function() {
//         slideIndex++;
//         manualSlides(slideIndex);
//     }, 4000);
// }

// function currentSlide(n) {
//     clearInterval(autoSlides);
//     manualSlides(slideIndex = n - 1);
//     autoSlides = setInterval(function() {
//         slideIndex++;
//         manualSlides(slideIndex);
//     }, 4000);
// }

// My code starts here

window.onload = function() {
    // Materialize Carousel Initialization
    $('.carousel').carousel({
        duration: 300, /* How fast the slide transitions. Not an automatic slider */
        fullWidth: true,
        indicators: true /* Shows the dots in the bottom of the carousel */
    });

    var carousel = document.getElementById('carousel');

    /**
     * Sets an interval timer and returns the newly created timer's ID.
     */
    function startCarousel () {
        var interval = 6000; // Time in-between slides
        return window.setInterval(function() {
            // return the timer-id so we can stop it later if we want.
            $(carousel).carousel('next');
        }, interval);
    }

    // Start the carousel
    var timerID = startCarousel();

    // Desktop events to stop and start the carousel cycle after user interacts with it.
    carousel.onmouseover = function() {
        window.clearInterval(timerID);
    };
    carousel.onmouseleave = function() {
        timerID = startCarousel();
    };

    // Mobile touch events to start and stop the carousel cycle.
    // TODO: Test on mobile!!!
    carousel.ontouchstart = function() {
        window.clearInterval(timerID);
    };
    carousel.ontouchend = function() {
        timerID = startCarousel();
    };
};