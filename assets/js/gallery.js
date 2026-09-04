/* =========================================
   SKL YUVA CLUB
   PUBLIC GALLERY
   FIRESTORE
========================================= */


// =========================================
// FIREBASE
// =========================================

import { db } from "./firebase.js";

import {

    collection,

    getDocs,

    query,

    orderBy

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================
// ELEMENTS
// =========================================

const galleryContainer =
    document.getElementById(
        "publicGalleryContainer"
    );


const gallerySearch =
    document.getElementById(
        "gallerySearch"
    );


const lightbox =
    document.getElementById(
        "galleryLightbox"
    );


const lightboxImage =
    document.getElementById(
        "lightboxImage"
    );


const lightboxTitle =
    document.getElementById(
        "lightboxTitle"
    );


const lightboxCaption =
    document.getElementById(
        "lightboxCaption"
    );


const lightboxClose =
    document.getElementById(
        "lightboxClose"
    );


// =========================================
// VARIABLES
// =========================================

let galleryItems = [];


// =========================================
// LOAD GALLERY
// =========================================

async function loadGallery() {

    if (!galleryContainer) {

        return;

    }


    try {

        galleryContainer.innerHTML = `

            <div class="public-gallery-loading">

                <i class="fas fa-spinner fa-spin"></i>

                <h3>
                    Loading Gallery...
                </h3>

                <p>
                    Please wait.
                </p>

            </div>

        `;


        // =================================
        // FIRESTORE QUERY
        // =================================

        const galleryQuery =
            query(

                collection(
                    db,
                    "gallery"
                ),

                orderBy(
                    "createdAt",
                    "desc"
                )

            );


        const snapshot =
            await getDocs(
                galleryQuery
            );


        galleryItems = [];


        snapshot.forEach(
            (docSnap) => {

                galleryItems.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        // =================================
        // DISPLAY
        // =================================

        renderGallery(
            galleryItems
        );

    }


    catch (error) {

        console.error(
            "Public Gallery Error:",
            error
        );


        galleryContainer.innerHTML = `

            <div class="public-gallery-error">

                <i class="fas fa-circle-exclamation"></i>

                <h3>
                    Unable to Load Gallery
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
// RENDER GALLERY
// =========================================

function renderGallery(
    items
) {

    if (!galleryContainer) {

        return;

    }


    // =================================
    // NO RESULTS
    // =================================

    if (
        items.length === 0
    ) {

        galleryContainer.innerHTML = `

            <div class="public-gallery-empty">

                <i class="fas fa-images"></i>

                <h3>
                    No Gallery Images Found
                </h3>

                <p>
                    Gallery images will appear here
                    when they are added by the club.
                </p>

            </div>

        `;

        return;

    }


    // =================================
    // CLEAR
    // =================================

    galleryContainer.innerHTML = "";


    // =================================
    // CREATE CARDS
    // =================================

    items.forEach(
        (item) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "public-gallery-card";


            // =================================
            // IMAGE BOX
            // =================================

            const imageBox =
                document.createElement(
                    "div"
                );


            imageBox.className =
                "public-gallery-image";


            // =================================
            // IMAGE
            // =================================

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                item.image ||
                "assets/images/logo.png";


            image.alt =
                item.title ||
                "SKL Yuva Club Gallery";


            image.loading =
                "lazy";


            image.onerror =
                function () {

                    this.src =
                        "assets/images/logo.png";

                };


            imageBox.appendChild(
                image
            );


            // =================================
            // OVERLAY
            // =================================

            const overlay =
                document.createElement(
                    "div"
                );


            overlay.className =
                "public-gallery-overlay";


            overlay.innerHTML = `

                <i class="fas fa-expand"></i>

            `;


            imageBox.appendChild(
                overlay
            );


            // =================================
            // OPEN LIGHTBOX
            // =================================

            imageBox.addEventListener(
                "click",
                () => {

                    openLightbox(
                        item
                    );

                }
            );


            // =================================
            // CONTENT
            // =================================

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "public-gallery-content";


            // TITLE

            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                item.title ||
                "SKL Yuva Club";


            content.appendChild(
                title
            );


            // CAPTION

            if (
                item.caption
            ) {

                const caption =
                    document.createElement(
                        "p"
                    );


                caption.textContent =
                    item.caption;


                content.appendChild(
                    caption
                );

            }


            // =================================
            // CARD
            // =================================

            card.appendChild(
                imageBox
            );


            card.appendChild(
                content
            );


            galleryContainer.appendChild(
                card
            );

        }
    );

}


// =========================================
// SEARCH
// =========================================

if (
    gallerySearch
) {

    gallerySearch.addEventListener(
        "input",
        () => {

            const searchText =
                gallerySearch.value
                    .trim()
                    .toLowerCase();


            if (!searchText) {

                renderGallery(
                    galleryItems
                );

                return;

            }


            const filtered =
                galleryItems.filter(
                    (item) => {

                        const title =
                            String(
                                item.title ||
                                ""
                            ).toLowerCase();


                        const caption =
                            String(
                                item.caption ||
                                ""
                            ).toLowerCase();


                        return (

                            title.includes(
                                searchText
                            )

                            ||

                            caption.includes(
                                searchText
                            )

                        );

                    }
                );


            renderGallery(
                filtered
            );

        }
    );

}


// =========================================
// OPEN LIGHTBOX
// =========================================

function openLightbox(
    item
) {

    if (
        !lightbox
    ) {

        return;

    }


    if (lightboxImage) {

        lightboxImage.src =
            item.image ||
            "";

        lightboxImage.alt =
            item.title ||
            "Gallery Image";

    }


    if (lightboxTitle) {

        lightboxTitle.textContent =
            item.title ||
            "";

    }


    if (lightboxCaption) {

        lightboxCaption.textContent =
            item.caption ||
            "";

    }


    lightbox.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


// =========================================
// CLOSE LIGHTBOX
// =========================================

function closeLightbox() {

    if (!lightbox) {

        return;

    }


    lightbox.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


// =========================================
// CLOSE BUTTON
// =========================================

if (
    lightboxClose
) {

    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );

}


// =========================================
// CLICK OUTSIDE
// =========================================

if (
    lightbox
) {

    lightbox.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                lightbox
            ) {

                closeLightbox();

            }

        }
    );

}


// =========================================
// ESC KEY
// =========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
            "Escape"
        ) {

            closeLightbox();

        }

    }
);


// =========================================
// LOAD
// =========================================

loadGallery();