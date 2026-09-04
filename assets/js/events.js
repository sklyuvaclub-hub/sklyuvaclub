/* =========================================
   SKL YUVA CLUB
   PUBLIC EVENTS PAGE
   FIRESTORE
========================================= */

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const eventsContainer = document.getElementById("eventsContainer");

// =========================================
// LOAD EVENTS
// =========================================

async function loadEvents() {


    if (!eventsContainer) {

        return;

    }


    // =====================================
    // LOADING
    // =====================================

    eventsContainer.innerHTML = `

        <div class="loading-events">

            <i class="fas fa-spinner fa-spin"></i>

            <p>
                Loading Events...
            </p>

        </div>

    `;



    try {


        // =================================
        // GET FIRESTORE EVENTS
        // =================================

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "events"
                )
            );



        // =================================
        // NO EVENTS
        // =================================

        if (
            snapshot.empty
        ) {

            eventsContainer.innerHTML = `

                <div class="loading-events">

                    <i class="fas fa-calendar-xmark"></i>

                    <h3>
                        No Upcoming Events
                    </h3>

                    <p>
                        New events will be announced here.
                    </p>

                </div>

            `;

            return;

        }



        // =================================
        // STORE EVENTS
        // =================================

        const events = [];


        snapshot.forEach(
            (docSnap) => {

                events.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );



        // =================================
        // LATEST FIRST
        // =================================

        events.reverse();



        // =================================
        // CLEAR CONTAINER
        // =================================

        eventsContainer.innerHTML = "";



        // =================================
        // CREATE EVENT CARDS
        // =================================

        events.forEach(
            (event) => {


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "event-card";



                // =================================
                // IMAGE
                // =================================

                const image =
                    event.image ||
                    "assets/images/events/event1.jpg";



                // =================================
                // EVENT CARD
                // =================================

                card.innerHTML = `

                    <div class="event-image">

                        <img
                            src="${image}"
                            alt="${escapeHTML(
                    event.title ||
                    "SKL Yuva Club Event"
                )}"
                            loading="lazy"
                        >

                    </div>


                    <div class="event-content">


                        <span class="event-date">

                            <i class="fas fa-calendar-alt"></i>

                            ${escapeHTML(
                    event.date ||
                    "Coming Soon"
                )}

                        </span>



                        <h3>

                            ${escapeHTML(
                    event.title ||
                    "SKL Yuva Club Event"
                )}

                        </h3>



                        <p>

                            ${escapeHTML(
                    event.description ||
                    ""
                )}

                        </p>



                        <ul>


                            ${event.location
                        ? `

                                        <li>

                                            <i class="fas fa-map-marker-alt"></i>

                                            ${escapeHTML(
                            event.location
                        )}

                                        </li>

                                    `
                        : ""
                    }



                            ${event.time
                        ? `

                                        <li>

                                            <i class="fas fa-clock"></i>

                                            ${escapeHTML(
                            event.time
                        )}

                                        </li>

                                    `
                        : ""
                    }


                        </ul>



                    </div>

                `;



                // =================================
                // IMAGE ERROR
                // =================================

                const img =
                    card.querySelector(
                        "img"
                    );


                if (img) {

                    img.addEventListener(
                        "error",
                        () => {

                            img.src =
                                "assets/images/logo.png";

                        }
                    );

                }



                eventsContainer.appendChild(
                    card
                );


            }
        );


    }


    catch (error) {


        console.error(
            "Public Events Error:",
            error
        );


        eventsContainer.innerHTML = `

            <div class="loading-events">

                <i class="fas fa-circle-exclamation"></i>

                <h3>
                    Unable to Load Events
                </h3>

                <p>
                    Please check your internet connection
                    and try again.
                </p>

            </div>

        `;

    }

}



// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



// =========================================
// START
// =========================================

loadEvents();