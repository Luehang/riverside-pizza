let slideIndex = 0;
let autoSlides;

function manualSlides(n) {
    var i;
    var slides = document.getElementsByClassName("slides");
    var dots = document.getElementsByClassName("dot");
    if (n > slides.length - 1) {slideIndex = 0} 
    if (n < 0) {slideIndex = slides.length - 1}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none"; 
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex].style.display = "block"; 
    dots[slideIndex].className += " active";
}

setTimeout(function() {
    manualSlides(slideIndex);
}, 10);

autoSlides = setInterval(function() {
    slideIndex++;
    manualSlides(slideIndex);
}, 4000);

function plusSlides(n) {
    clearInterval(autoSlides);
    manualSlides(slideIndex += n);
    autoSlides = setInterval(function() {
        slideIndex++;
        manualSlides(slideIndex);
    }, 4000);
}

function currentSlide(n) {
    clearInterval(autoSlides);
    manualSlides(slideIndex = n - 1);
    autoSlides = setInterval(function() {
        slideIndex++;
        manualSlides(slideIndex);
    }, 4000);
}