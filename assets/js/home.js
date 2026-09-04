/* =========================================
   SKL YUVA CLUB
   PUBLIC HOME PAGE
   FIRESTORE DATA
========================================= */

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    limit
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================
// ELEMENTS
// =========================================

const homeMembersContainer =
    document.getElementById("homeMembersContainer");

const galleryGrid =
    document.getElementById("homeGalleryContainer");

const eventContainer =
    document.getElementById("eventContainer");

const noticeContainer =
    document.getElementById("noticeContainer");


// =========================================
// LOAD MEMBERS
// =========================================

async function loadHomeMembers() {

    if (!homeMembersContainer) {
        return;
    }

    homeMembersContainer.innerHTML = `
        <div class="members-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading Members...</p>
        </div>
    `;

    try {

        const snapshot =
            await getDocs(
                collection(db, "members")
            );

        const members = [];

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            if (
                data.source === "admin_added" &&
                data.status !== "inactive"
            ) {

                members.push({
                    id: docSnap.id,
                    ...data
                });

            }

        });


        if (members.length === 0) {

            homeMembersContainer.innerHTML = `
                <div class="members-empty">

                    <i class="fas fa-users"></i>

                    <h3>
                        No Members Available
                    </h3>

                    <p>
                        Club members will appear here.
                    </p>

                </div>
            `;

            return;
        }


        // =========================================
        // SORT BY NAME
        // =========================================

        members.sort((a, b) =>
            String(a.name || "")
                .localeCompare(
                    String(b.name || "")
                )
        );


        // =========================================
        // HOME PAGE MAXIMUM 4 MEMBERS
        // =========================================

        const homeMembers =
            members.slice(0, 4);


        homeMembersContainer.innerHTML = "";


        homeMembers.forEach((member) => {

            const card =
                document.createElement("div");

            card.className =
                "team-card";


            // =====================================
            // PHOTO
            // =====================================

            const img =
                document.createElement("img");

            img.src =
                member.photo ||
                "assets/images/logo.png";

            img.alt =
                member.name ||
                "SKL Yuva Club Member";

            img.loading =
                "lazy";


            img.onerror = function () {

                this.src =
                    "assets/images/logo.png";

            };


            card.appendChild(img);


            // =====================================
            // CONTENT
            // =====================================

            const info =
                document.createElement("div");

            info.className =
                "team-info";


            // NAME

            const name =
                document.createElement("h3");

            name.textContent =
                member.name ||
                "SKL Member";


            // POSITION

            const position =
                document.createElement("span");

            position.className =
                "team-position";

            position.textContent =
                member.position ||
                "Member";


            info.appendChild(name);

            info.appendChild(position);


            // =====================================
            // PHONE
            // =====================================

            if (member.phone) {

                const phone =
                    document.createElement("p");

                phone.className =
                    "team-phone";

                phone.innerHTML =
                    `<i class="fas fa-phone"></i> ${member.phone}`;

                info.appendChild(phone);

            }


            card.appendChild(info);

            homeMembersContainer.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Home Members Error:",
            error
        );


        homeMembersContainer.innerHTML = `
            <div class="members-error">

                <i class="fas fa-circle-exclamation"></i>

                <h3>
                    Unable to Load Members
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>
        `;

    }

}


// =========================================
// LOAD GALLERY
// =========================================

async function loadHomeGallery() {

    if (!galleryGrid) {
        return;
    }


    galleryGrid.innerHTML = `
        <div class="loading-gallery">

            <i class="fas fa-spinner fa-spin"></i>

            Loading Gallery...

        </div>
    `;


    try {

        const galleryQuery =
            query(
                collection(db, "gallery"),
                limit(6)
            );


        const snapshot =
            await getDocs(
                galleryQuery
            );


        if (snapshot.empty) {

            galleryGrid.innerHTML = `
                <div class="loading-gallery">

                    <i class="fas fa-images"></i>

                    <p>
                        No Photos Available
                    </p>

                </div>
            `;

            return;
        }


        galleryGrid.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const item =
                document.createElement("div");

            item.className =
                "gallery-item";


            // =====================================
            // IMAGE
            // =====================================

            const image =
                document.createElement("img");


            image.src =
                data.image || "";


            image.alt =
                data.title ||
                "SKL Yuva Club";


            image.loading =
                "lazy";


            image.onerror =
                function () {

                    this.style.display =
                        "none";

                };


            item.appendChild(image);


            // =====================================
            // OVERLAY
            // =====================================

            const overlay =
                document.createElement("div");

            overlay.className =
                "gallery-overlay";


            overlay.innerHTML = `
                <i class="fas fa-search-plus"></i>
            `;


            item.appendChild(overlay);


            galleryGrid.appendChild(item);

        });


    } catch (error) {

        console.error(
            "Home Gallery Error:",
            error
        );


        galleryGrid.innerHTML = `
            <div class="loading-gallery">

                <i class="fas fa-circle-exclamation"></i>

                <p>
                    Unable to load gallery.
                </p>

            </div>
        `;

    }

}


// =========================================
// CREATE EVENT DATE
// =========================================

function createEventDate(
    eventDate,
    eventTime
) {

    if (!eventDate) {
        return null;
    }


    const dateString =
        String(eventDate).trim();


    let target;


    // =========================================
    // YYYY-MM-DD
    // =========================================

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            dateString
        )
    ) {

        if (eventTime) {

            target =
                new Date(
                    `${dateString}T${eventTime}`
                );

        } else {

            target =
                new Date(
                    `${dateString}T00:00:00`
                );

        }

    }

    // =========================================
    // OTHER DATE FORMATS
    // =========================================

    else {

        target =
            new Date(
                eventTime
                    ? `${dateString} ${eventTime}`
                    : dateString
            );

    }


    if (
        Number.isNaN(
            target.getTime()
        )
    ) {

        return null;

    }


    return target;

}


// =========================================
// START EVENT COUNTDOWNS
// =========================================

function startEventCountdowns() {

    const countdowns =
        document.querySelectorAll(
            ".event-countdown"
        );


    countdowns.forEach(
        (countdown) => {

            const eventDate =
                countdown.dataset.eventDate;


            const eventTime =
                countdown.dataset.eventTime;


            const targetDate =
                createEventDate(
                    eventDate,
                    eventTime
                );


            if (!targetDate) {

                countdown.style.display =
                    "none";

                return;

            }


            const days =
                countdown.querySelector(
                    ".count-days"
                );


            const hours =
                countdown.querySelector(
                    ".count-hours"
                );


            const minutes =
                countdown.querySelector(
                    ".count-minutes"
                );


            const seconds =
                countdown.querySelector(
                    ".count-seconds"
                );


            const title =
                countdown.querySelector(
                    ".countdown-title"
                );


            function updateCountdown() {

                const now =
                    new Date();


                const difference =
                    targetDate.getTime() -
                    now.getTime();


                // =================================
                // EVENT STARTED
                // =================================

                if (
                    difference <= 0
                ) {

                    if (title) {

                        title.textContent =
                            "Event Started";

                    }


                    if (days) {

                        days.textContent =
                            "00";

                    }


                    if (hours) {

                        hours.textContent =
                            "00";

                    }


                    if (minutes) {

                        minutes.textContent =
                            "00";

                    }


                    if (seconds) {

                        seconds.textContent =
                            "00";

                    }


                    return;

                }


                // =================================
                // CALCULATE
                // =================================

                const totalSeconds =
                    Math.floor(
                        difference / 1000
                    );


                const remainingDays =
                    Math.floor(
                        totalSeconds /
                        86400
                    );


                const remainingHours =
                    Math.floor(
                        (
                            totalSeconds %
                            86400
                        ) / 3600
                    );


                const remainingMinutes =
                    Math.floor(
                        (
                            totalSeconds %
                            3600
                        ) / 60
                    );


                const remainingSeconds =
                    totalSeconds %
                    60;


                // =================================
                // DISPLAY
                // =================================

                if (days) {

                    days.textContent =
                        String(
                            remainingDays
                        ).padStart(
                            2,
                            "0"
                        );

                }


                if (hours) {

                    hours.textContent =
                        String(
                            remainingHours
                        ).padStart(
                            2,
                            "0"
                        );

                }


                if (minutes) {

                    minutes.textContent =
                        String(
                            remainingMinutes
                        ).padStart(
                            2,
                            "0"
                        );

                }


                if (seconds) {

                    seconds.textContent =
                        String(
                            remainingSeconds
                        ).padStart(
                            2,
                            "0"
                        );

                }

            }


            // =================================
            // FIRST UPDATE
            // =================================

            updateCountdown();


            // =================================
            // UPDATE EVERY SECOND
            // =================================

            const timer =
                setInterval(
                    updateCountdown,
                    1000
                );


            countdown.dataset.timer =
                timer;

        }
    );

}


// =========================================
// LOAD EVENTS
// =========================================

async function loadHomeEvents() {

    if (!eventContainer) {
        return;
    }


    eventContainer.innerHTML = `
        <div class="loading-gallery">

            <i class="fas fa-spinner fa-spin"></i>

            Loading Events...

        </div>
    `;


    try {

        // =========================================
        // GET ALL EVENTS
        // =========================================

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "events"
                )
            );


        // =========================================
        // NO EVENTS
        // =========================================

        if (snapshot.empty) {

            eventContainer.innerHTML = `
                <div class="loading-gallery">

                    <i class="fas fa-calendar-xmark"></i>

                    <p>
                        No Upcoming Events
                    </p>

                </div>
            `;

            return;

        }


        const allEvents = [];


        // =========================================
        // STORE EVENTS
        // =========================================

        snapshot.forEach(
            (docSnap) => {

                const event = {

                    id: docSnap.id,

                    ...docSnap.data()

                };


                const eventDate =
                    createEventDate(
                        event.date,
                        event.time
                    );


                // Only valid dates

                if (eventDate) {

                    allEvents.push({

                        ...event,

                        eventDate:
                            eventDate

                    });

                }

            }
        );


        // =========================================
        // CURRENT DATE & TIME
        // =========================================

        const now =
            new Date();


        // =========================================
        // ONLY UPCOMING EVENTS
        // =========================================

        const upcomingEvents =
            allEvents.filter(
                (event) => {

                    return (
                        event.eventDate
                            .getTime()
                        >
                        now.getTime()
                    );

                }
            );


        // =========================================
        // SORT NEAREST EVENT FIRST
        // =========================================

        upcomingEvents.sort(
            (a, b) => {

                return (
                    a.eventDate.getTime()
                    -
                    b.eventDate.getTime()
                );

            }
        );


        // =========================================
        // NO UPCOMING EVENTS
        // =========================================

        if (
            upcomingEvents.length === 0
        ) {

            eventContainer.innerHTML = `
                <div class="loading-gallery">

                    <i class="fas fa-calendar-check"></i>

                    <p>
                        No Upcoming Events
                    </p>

                    <span>
                        Please check again later.
                    </span>

                </div>
            `;

            return;

        }


        // =========================================
        // SHOW MAXIMUM 3 EVENTS
        // =========================================

        const homeEvents =
            upcomingEvents.slice(
                0,
                3
            );


        eventContainer.innerHTML = "";


        // =========================================
        // CREATE EVENT CARDS
        // =========================================

        homeEvents.forEach(
            (event) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "event-card";


                const image =
                    event.image ||
                    "assets/images/events/event1.jpg";


                card.innerHTML = `

                    <div class="event-image">

                        <img
                            src="${image}"
                            alt="${event.title || "SKL Event"}"
                        >

                    </div>


                    <div class="event-content">


                        <!-- EVENT DATE -->

                        <span class="event-date">

                            ${event.date || "Coming Soon"}

                        </span>


                        <!-- EVENT TITLE -->

                        <h3>

                            ${event.title ||
                    "SKL Yuva Club Event"}

                        </h3>


                        <!-- EVENT DESCRIPTION -->

                        <p>

                            ${event.description || ""}

                        </p>


                        <!-- EVENT DETAILS -->

                        <ul>

                            ${event.location
                        ? `
                                        <li>

                                            <i class="fas fa-location-dot"></i>

                                            ${event.location}

                                        </li>
                                    `
                        : ""
                    }


                            ${event.time
                        ? `
                                        <li>

                                            <i class="fas fa-clock"></i>

                                            ${event.time}

                                        </li>
                                    `
                        : ""
                    }

                        </ul>


                        <!-- =================================
                             EVENT COUNTDOWN
                        ================================== -->

                        <div
                            class="event-countdown"
                            data-event-date="${event.date || ""}"
                            data-event-time="${event.time || ""}"
                        >

                            <div class="countdown-title">

                                Event Starts In

                            </div>


                            <div class="countdown-boxes">


                                <div class="countdown-box">

                                    <strong class="count-days">

                                        00

                                    </strong>

                                    <small>

                                        Days

                                    </small>

                                </div>


                                <div class="countdown-box">

                                    <strong class="count-hours">

                                        00

                                    </strong>

                                    <small>

                                        Hours

                                    </small>

                                </div>


                                <div class="countdown-box">

                                    <strong class="count-minutes">

                                        00

                                    </strong>

                                    <small>

                                        Min

                                    </small>

                                </div>


                                <div class="countdown-box">

                                    <strong class="count-seconds">

                                        00

                                    </strong>

                                    <small>

                                        Sec

                                    </small>

                                </div>


                            </div>

                        </div>


                        <!-- VIEW DETAILS -->

                        <a
                            href="events.html"
                            class="btn btn-primary"
                        >

                            View Details

                        </a>

                    </div>

                `;


                eventContainer.appendChild(
                    card
                );

            }
        );


        // =========================================
        // START COUNTDOWN
        // =========================================

        startEventCountdowns();


    } catch (error) {

        console.error(
            "Home Events Error:",
            error
        );


        eventContainer.innerHTML = `
            <div class="loading-gallery">

                <i class="fas fa-circle-exclamation"></i>

                <p>
                    Unable to load events.
                </p>

            </div>
        `;

    }

}


// =========================================
// LOAD NOTICES
// =========================================

async function loadHomeNotices() {

    if (!noticeContainer) {
        return;
    }


    noticeContainer.innerHTML = `
        <div class="loading-gallery">

            <i class="fas fa-spinner fa-spin"></i>

            Loading Notices...

        </div>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "notices"
                )
            );


        // =========================================
        // NO NOTICES
        // =========================================

        if (snapshot.empty) {

            noticeContainer.innerHTML = `
                <div class="loading-gallery">

                    <i class="fas fa-bell-slash"></i>

                    <p>
                        No Latest Notices
                    </p>

                </div>
            `;

            return;

        }


        const notices = [];


        snapshot.forEach(
            (docSnap) => {

                notices.push({

                    id: docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        // =========================================
        // LATEST FIRST
        // =========================================

        notices.reverse();


        // =========================================
        // HOME MAXIMUM 3
        // =========================================

        const latestNotices =
            notices.slice(
                0,
                3
            );


        noticeContainer.innerHTML = "";


        latestNotices.forEach(
            (notice) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "notice-card";


                card.innerHTML = `

                    <div class="notice-icon">

                        <i class="fas fa-bullhorn"></i>

                    </div>


                    <div class="notice-content">

                        <span class="notice-date">

                            ${notice.date || ""}

                        </span>


                        <h3>

                            ${notice.title ||
                    "Club Notice"}

                        </h3>


                        <p>

                            ${notice.description || ""}

                        </p>

                    </div>

                `;


                noticeContainer.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Home Notices Error:",
            error
        );


        noticeContainer.innerHTML = `
            <div class="loading-gallery">

                <i class="fas fa-circle-exclamation"></i>

                <p>
                    Unable to load notices.
                </p>

            </div>
        `;

    }

}


// =========================================
// START
// =========================================

loadHomeMembers();

loadHomeGallery();

loadHomeEvents();

loadHomeNotices();

// =========================================
// DYNAMIC HERO SLIDER
// =========================================
async function loadDynamicHero() {
    const slider = document.querySelector(".slider");
    const hero = document.querySelector(".hero");
    if (!slider || !hero) return;

    // Keep the static hero hidden while Firebase data is loading.
    // This prevents the old image/text from flashing before the live hero appears.
    hero.classList.remove("hero-ready");

    try {
        const snapshot = await getDocs(collection(db, "heroSlides"));
        const slides = [];

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if ((data.status || "active") === "active" && data.imageUrl) {
                slides.push({ id: docSnap.id, ...data });
            }
        });

        slides.sort((a,b) => Number(a.order || 0) - Number(b.order || 0));

        if (!slides.length) {
            hero.classList.add("hero-ready");
            return;
        }

        // Preload the first Firebase image before replacing the static hero.
        // This prevents the old image from being visible while the new image loads.
        const firstImage = new Image();
        firstImage.src = slides[0].imageUrl;
        await new Promise((resolve) => {
            if (firstImage.complete) {
                resolve();
                return;
            }
            firstImage.onload = resolve;
            firstImage.onerror = resolve;
        });

        slider.innerHTML = slides.map((slide, index) => `
            <div class="slide ${index === 0 ? "active" : ""}">
                <img src="${escapeHero(slide.imageUrl)}" alt="${escapeHero(slide.title || "")}">
            </div>
        `).join("");

        const heroTitle = document.querySelector(".hero-content h1");
        const heroDesc = document.querySelector(".hero-content p");
        const heroButtons = document.querySelector(".hero-buttons");

        if (slides[0].title && heroTitle) heroTitle.innerHTML = slides[0].title.replace(/\n/g, "<br>");
        if (slides[0].description && heroDesc) heroDesc.textContent = slides[0].description;

        if (heroButtons) {
            const buttons = heroButtons.querySelectorAll("a");
            const first = buttons[0];
            const second = buttons[1];

            if (first) {
                if (slides[0].buttonText) first.textContent = slides[0].buttonText;
                first.href = slides[0].buttonLink || "about.html";
            }

            if (second) {
                second.textContent = "Join Us";
                second.href = "contact.html";
            }
        }

        // Show the hero only after Firebase content is ready.
        hero.classList.add("hero-ready");

        let index = 0;
        const items = slider.querySelectorAll(".slide");
        if (items.length > 1) {
            setInterval(() => {
                items[index].classList.remove("active");
                index = (index + 1) % items.length;
                items[index].classList.add("active");
            }, 5000);
        }
    } catch (error) {
        console.error("Dynamic hero error:", error);
        // If Firebase fails, show the existing static hero instead of leaving it hidden.
        hero.classList.add("hero-ready");
    }
}

function escapeHero(value) {
    return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;")
        .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

loadDynamicHero();
