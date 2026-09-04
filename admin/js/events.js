/* =========================================
   SKL YUVA CLUB
   ADMIN EVENTS MANAGEMENT
   FIRESTORE
========================================= */


// =========================================
// FIREBASE
// =========================================

import { auth, db }
    from "../../assets/js/firebase.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



// =========================================
// ELEMENTS
// =========================================

const loginPage =
    "index.html";


const eventForm =
    document.getElementById("eventForm");


const eventModal =
    document.getElementById("eventModal");


const addEventBtn =
    document.getElementById("addEventBtn");


const closeEventModal =
    document.getElementById("closeEventModal");


const cancelEventBtn =
    document.getElementById("cancelEventBtn");


const eventsTableBody =
    document.getElementById("eventsTableBody");


const eventSearch =
    document.getElementById("eventSearch");


const eventTitle =
    document.getElementById("eventTitle");


const eventDate =
    document.getElementById("eventDate");


const eventTime =
    document.getElementById("eventTime");


const eventLocation =
    document.getElementById("eventLocation");


const eventDescription =
    document.getElementById("eventDescription");


const eventImage =
    document.getElementById("eventImage");


const eventImagePreview =
    document.getElementById("eventImagePreview");


const eventPreviewImage =
    document.getElementById("eventPreviewImage");


const modalTitle =
    document.getElementById("modalTitle");


const saveEventBtn =
    document.getElementById("saveEventBtn");


const logoutBtn =
    document.getElementById("logoutBtn");



// =========================================
// VARIABLES
// =========================================

let events = [];

let editingEventId = null;



// =========================================
// AUTH CHECK
// =========================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                loginPage;

            return;

        }


        await loadEvents();

    }
);



// =========================================
// LOAD EVENTS
// =========================================

async function loadEvents() {

    if (!eventsTableBody) {
        return;
    }


    eventsTableBody.innerHTML = `

        <tr>

            <td
                colspan="5"
                class="table-loading"
            >

                <i class="fas fa-spinner fa-spin"></i>

                Loading events...

            </td>

        </tr>

    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "events"
                )
            );


        events = [];


        snapshot.forEach(
            (eventDoc) => {

                events.push({

                    id:
                        eventDoc.id,

                    ...eventDoc.data()

                });

            }
        );


        // Latest first

        events.reverse();


        renderEvents(
            events
        );


    }
    catch (error) {

        console.error(
            "Load Events Error:",
            error
        );


        eventsTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="table-error"
                >

                    <i class="fas fa-circle-exclamation"></i>

                    Unable to load events.

                </td>

            </tr>

        `;

    }

}



// =========================================
// RENDER EVENTS
// =========================================

function renderEvents(data) {

    if (!eventsTableBody) {
        return;
    }


    if (data.length === 0) {

        eventsTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="members-empty"
                >

                    <div class="members-empty-icon">

                        <i class="fas fa-calendar-days"></i>

                    </div>

                    <h3>
                        No Events Found
                    </h3>

                    <p>
                        Click "Add Event" to create your first event.
                    </p>

                </td>

            </tr>

        `;

        return;

    }



    eventsTableBody.innerHTML =
        data.map(
            (event) => {


                const image =
                    event.image ||
                    "../assets/images/events/event1.jpg";


                return `

                    <tr>

                        <!-- EVENT -->

                        <td>

                            <div class="member-table-info">

                                <img
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(
                    event.title ||
                    "Event"
                )}"
                                    class="member-table-photo"
                                    onerror="this.style.display='none'"
                                >


                                <div>

                                    <strong>

                                        ${escapeHTML(
                    event.title ||
                    "Untitled Event"
                )}

                                    </strong>


                                    <small>

                                        SKL Yuva Club Event

                                    </small>

                                </div>

                            </div>

                        </td>



                        <!-- DATE -->

                        <td>

                            ${escapeHTML(
                    formatDate(
                        event.date
                    )
                )}

                        </td>



                        <!-- TIME -->

                        <td>

                            ${escapeHTML(
                    formatTime(
                        event.time
                    )
                )}

                        </td>



                        <!-- LOCATION -->

                        <td>

                            ${escapeHTML(
                    event.location ||
                    "-"
                )}

                        </td>



                        <!-- ACTIONS -->

                        <td>

                            <div class="table-actions">


                                <button
                                    type="button"
                                    class="table-btn editEventBtn"
                                    data-id="${event.id}"
                                >

                                    <i class="fas fa-pen"></i>

                                    Edit

                                </button>



                                <button
                                    type="button"
                                    class="table-btn deleteEventBtn"
                                    data-id="${event.id}"
                                >

                                    <i class="fas fa-trash"></i>

                                    Delete

                                </button>


                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    attachActionButtons();

}



// =========================================
// EDIT / DELETE BUTTONS
// =========================================

function attachActionButtons() {


    document
        .querySelectorAll(
            ".editEventBtn"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        openEditModal(
                            button.dataset.id
                        );

                    }
                );

            }
        );



    document
        .querySelectorAll(
            ".deleteEventBtn"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteEvent(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}



// =========================================
// ADD EVENT
// =========================================

if (addEventBtn) {

    addEventBtn.addEventListener(
        "click",
        () => {

            resetForm();


            editingEventId =
                null;


            modalTitle.textContent =
                "Add Event";


            saveEventBtn.innerHTML = `

                <i class="fas fa-save"></i>

                Save Event

            `;


            eventModal.classList.add(
                "active"
            );

        }
    );

}



// =========================================
// EDIT EVENT
// =========================================

function openEditModal(id) {


    const event =
        events.find(
            (item) =>
                item.id === id
        );


    if (!event) {

        alert(
            "Event not found."
        );

        return;

    }


    editingEventId =
        event.id;


    eventTitle.value =
        event.title || "";


    eventDate.value =
        event.date || "";


    eventTime.value =
        event.time || "";


    eventLocation.value =
        event.location || "";


    eventDescription.value =
        event.description || "";


    eventImage.value =
        event.image || "";


    showImagePreview(
        event.image || ""
    );


    modalTitle.textContent =
        "Edit Event";


    saveEventBtn.innerHTML = `

        <i class="fas fa-save"></i>

        Update Event

    `;


    eventModal.classList.add(
        "active"
    );

}



// =========================================
// IMAGE PREVIEW
// =========================================

if (eventImage) {

    eventImage.addEventListener(
        "input",
        () => {

            showImagePreview(
                eventImage.value.trim()
            );

        }
    );

}



function showImagePreview(url) {

    if (
        !eventImagePreview ||
        !eventPreviewImage
    ) {

        return;

    }


    if (!url) {

        eventImagePreview.style.display =
            "none";

        eventPreviewImage.src =
            "";

        return;

    }


    eventPreviewImage.src =
        url;


    eventImagePreview.style.display =
        "flex";

}



if (eventPreviewImage) {

    eventPreviewImage.addEventListener(
        "error",
        () => {

            eventImagePreview.style.display =
                "none";

        }
    );

}



// =========================================
// CLOSE MODAL
// =========================================

function closeModal() {

    if (eventModal) {

        eventModal.style.display =
            "none";

    }


    resetForm();

}



if (closeEventModal) {

    closeEventModal.addEventListener(
        "click",
        closeModal
    );

}



if (cancelEventBtn) {

    cancelEventBtn.addEventListener(
        "click",
        closeModal
    );

}



if (eventModal) {

    eventModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                eventModal
            ) {

                closeModal();

            }

        }
    );

}



// =========================================
// SAVE EVENT
// =========================================

if (eventForm) {

    eventForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const title =
                eventTitle
                    ? eventTitle.value.trim()
                    : "";


            const date =
                eventDate
                    ? eventDate.value
                    : "";


            const time =
                eventTime
                    ? eventTime.value
                    : "";


            const location =
                eventLocation
                    ? eventLocation.value.trim()
                    : "";


            const description =
                eventDescription
                    ? eventDescription.value.trim()
                    : "";


            const image =
                eventImage
                    ? eventImage.value.trim()
                    : "";



            // -------------------------------
            // VALIDATION
            // -------------------------------

            if (!title) {

                alert(
                    "Please enter event title."
                );

                eventTitle.focus();

                return;

            }


            if (!date) {

                alert(
                    "Please select event date."
                );

                eventDate.focus();

                return;

            }



            // -------------------------------
            // BUTTON LOADING
            // -------------------------------

            saveEventBtn.disabled =
                true;


            saveEventBtn.innerHTML = `

                <i class="fas fa-spinner fa-spin"></i>

                Saving...

            `;



            try {


                const eventData = {

                    title:
                        title,

                    date:
                        date,

                    time:
                        time,

                    location:
                        location,

                    description:
                        description,

                    image:
                        image,

                    updatedAt:
                        serverTimestamp()

                };



                // -------------------------------
                // UPDATE
                // -------------------------------

                if (editingEventId) {


                    await updateDoc(

                        doc(
                            db,
                            "events",
                            editingEventId
                        ),

                        eventData

                    );


                    alert(
                        "Event updated successfully."
                    );

                }



                // -------------------------------
                // ADD
                // -------------------------------

                else {


                    eventData.createdAt =
                        serverTimestamp();


                    await addDoc(

                        collection(
                            db,
                            "events"
                        ),

                        eventData

                    );


                    alert(
                        "Event added successfully."
                    );

                }



                closeModal();


                await loadEvents();


            }
            catch (error) {

                console.error(
                    "Save Event Error:",
                    error
                );


                alert(
                    getFirebaseErrorMessage(
                        error
                    )
                );

            }
            finally {

                saveEventBtn.disabled =
                    false;

            }

        }
    );

}



// =========================================
// DELETE EVENT
// =========================================

async function deleteEvent(id) {


    const event =
        events.find(
            (item) =>
                item.id === id
        );


    if (!event) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${event.title}"?`
        );


    if (!confirmed) {
        return;
    }



    try {


        await deleteDoc(

            doc(
                db,
                "events",
                id
            )

        );


        alert(
            "Event deleted successfully."
        );


        await loadEvents();


    }
    catch (error) {

        console.error(
            "Delete Event Error:",
            error
        );


        alert(
            getFirebaseErrorMessage(
                error
            )
        );

    }

}



// =========================================
// SEARCH
// =========================================

if (eventSearch) {

    eventSearch.addEventListener(
        "input",
        applySearch
    );

}



function applySearch() {


    const text =
        eventSearch
            ? eventSearch.value
                .trim()
                .toLowerCase()
            : "";


    if (!text) {

        renderEvents(
            events
        );

        return;

    }


    const filtered =
        events.filter(
            (event) => {


                const title =
                    String(
                        event.title || ""
                    ).toLowerCase();


                const location =
                    String(
                        event.location || ""
                    ).toLowerCase();


                const description =
                    String(
                        event.description || ""
                    ).toLowerCase();


                const date =
                    String(
                        event.date || ""
                    ).toLowerCase();


                return (

                    title.includes(text)

                    ||

                    location.includes(text)

                    ||

                    description.includes(text)

                    ||

                    date.includes(text)

                );

            }
        );


    renderEvents(
        filtered
    );

}



// =========================================
// RESET FORM
// =========================================

function resetForm() {


    editingEventId =
        null;


    if (eventForm) {

        eventForm.reset();

    }


    showImagePreview(
        ""
    );


    if (modalTitle) {

        modalTitle.textContent =
            "Add Event";

    }


    if (saveEventBtn) {

        saveEventBtn.innerHTML = `

            <i class="fas fa-save"></i>

            Save Event

        `;

        saveEventBtn.disabled =
            false;

    }

}



// =========================================
// FORMAT DATE
// =========================================

function formatDate(date) {

    if (!date) {

        return "-";

    }


    const parts =
        String(date).split("-");


    if (
        parts.length === 3
    ) {

        return `${parts[2]}-${parts[1]}-${parts[0]}`;

    }


    return date;

}



// =========================================
// FORMAT TIME
// =========================================

function formatTime(time) {

    if (!time) {

        return "-";

    }


    const parts =
        String(time).split(":");


    if (
        parts.length < 2
    ) {

        return time;

    }


    let hour =
        parseInt(
            parts[0],
            10
        );


    const minute =
        parts[1];


    const ampm =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 ||
        12;


    return `${hour}:${minute} ${ampm}`;

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
// FIREBASE ERROR MESSAGE
// =========================================

function getFirebaseErrorMessage(
    error
) {


    if (
        error &&
        error.code ===
        "permission-denied"
    ) {

        return "Permission denied. Please check your Firestore security rules.";

    }


    if (
        error &&
        error.code ===
        "unavailable"
    ) {

        return "Firestore is currently unavailable. Please check your internet connection.";

    }


    return (
        error?.message ||
        "Something went wrong. Please try again."
    );

}



// =========================================
// LOGOUT
// =========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            try {

                await signOut(
                    auth
                );


                window.location.href =
                    loginPage;

            }
            catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );

            }

        }
    );

}