// ===============================
// HEADER SCROLL
// ===============================

const header = document.getElementById("header");

if (header) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    });

}


// ===============================
// MOBILE MENU
// ===============================

const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

if (menuBtn && navbar) {

    menuBtn.addEventListener("click", () => {

        navbar.classList.toggle("active");

        menuBtn.innerHTML =
            navbar.classList.contains("active")
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';

    });


    // ===============================
    // CLOSE MENU ON LINK CLICK
    // ===============================

    document.querySelectorAll("#navbar a").forEach(link => {

        link.addEventListener("click", () => {

            navbar.classList.remove("active");

            menuBtn.innerHTML =
                '<i class="fas fa-bars"></i>';

        });

    });

}


// ===============================
// HERO SLIDER
// ===============================

const slides = document.querySelectorAll(".slide");

let currentSlide = 0;


// -----------------------------------------
// SHOW SLIDE
// -----------------------------------------

function showSlide(index) {

    // No slider on this page
    if (!slides || slides.length === 0) {
        return;
    }


    slides.forEach(slide => {

        slide.classList.remove("active");

    });


    // Safety check
    if (!slides[index]) {
        return;
    }


    slides[index].classList.add("active");

}


// -----------------------------------------
// START SLIDER
// -----------------------------------------

if (slides.length > 0) {

    showSlide(currentSlide);


    setInterval(() => {

        currentSlide++;


        if (currentSlide >= slides.length) {

            currentSlide = 0;

        }


        showSlide(currentSlide);

    }, 5000);

}


// ===============================
// ACHIEVEMENT COUNTER
// ===============================

const counters =
    document.querySelectorAll(".counter");


if (
    counters.length > 0 &&
    "IntersectionObserver" in window
) {

    const counterObserver =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    const counter =
                        entry.target;


                    const target =
                        Number(
                            counter.dataset.target
                        );


                    let current = 0;


                    const increment =
                        Math.max(
                            1,
                            Math.ceil(
                                target / 80
                            )
                        );


                    const updateCounter = () => {

                        current += increment;


                        if (current >= target) {

                            counter.textContent =
                                target;

                            counterObserver.unobserve(
                                counter
                            );

                            return;

                        }


                        counter.textContent =
                            current;


                        requestAnimationFrame(
                            updateCounter
                        );

                    };


                    updateCounter();

                });

            },

            {
                threshold: 0.5
            }

        );


    counters.forEach(counter => {

        counterObserver.observe(counter);

    });

}


// ===============================
// CURRENT YEAR
// ===============================

const yearElement =
    document.getElementById("year");


if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


// ===============================
// BACK TO TOP
// ===============================

const backToTop =
    document.getElementById("backToTop");


if (backToTop) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    });


    backToTop.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}