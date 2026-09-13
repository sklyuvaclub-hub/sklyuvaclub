/* =========================================
   SKL YUVA CLUB
   CONTACT + JOIN MEMBERSHIP
   FIRESTORE
========================================= */

import { db } from "./firebase.js";
import { openPassportCropper } from "./photo-cropper.js";

import {
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// =========================================
// CLOUDINARY PHOTO UPLOAD
// Uses the same Cloudinary setup already used by the old project.
// =========================================

const CLOUD_NAME =
    "shrhhsz0";

const UPLOAD_PRESET =
    "skl_gallery";

async function uploadMembershipPhoto(file) {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );

    const response =
        await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

    const result =
        await response.json();

    if (result.error) {
        throw new Error(
            result.error.message ||
            "Photo upload failed."
        );
    }

    if (!result.secure_url) {
        throw new Error(
            "Photo URL was not received."
        );
    }

    return result.secure_url;
}


// =========================================
// ELEMENTS
// =========================================

const joinForm =
    document.getElementById("joinForm");

const joinName =
    document.getElementById("joinName");

const joinPhone =
    document.getElementById("joinPhone");

const joinDob =
    document.getElementById("joinDob");

const joinAddress =
    document.getElementById("joinAddress");

const joinOccupation =
    document.getElementById("joinOccupation");

const joinEmail =
    document.getElementById("joinEmail");

const joinReason =
    document.getElementById("joinReason");

const joinPhoto =
    document.getElementById("joinPhoto");

const joinSubmitBtn =
    document.getElementById("joinSubmitBtn");

const joinFormMessage =
    document.getElementById("joinFormMessage");

const phoneMessage =
    document.getElementById("phoneMessage");

const approvedMembersList =
    document.getElementById("approvedMembersList");

const communityCount =
    document.getElementById("communityCount");


// =========================================
// MOBILE NUMBER FORMAT
// =========================================

if (joinPhone) {

    joinPhone.addEventListener("input", function () {

        // Only numbers

        this.value =
            this.value.replace(
                /\D/g,
                ""
            );


        // Maximum 10 digits

        if (this.value.length > 10) {

            this.value =
                this.value.substring(
                    0,
                    10
                );

        }

    });

}


// =========================================
// SHOW MESSAGE
// =========================================

function showMessage(
    message,
    type = "success"
) {

    if (!joinFormMessage) {
        return;
    }


    joinFormMessage.className =
        `join-form-message ${type}`;


    joinFormMessage.innerHTML = message;

}


// =========================================

// =========================================
// CHECK MOBILE WHILE TYPING
// =========================================

let phoneCheckTimer = null;


if (joinPhone) {

    joinPhone.addEventListener(
        "blur",
        async function () {

            const phone =
                this.value.trim();


            if (
                phone.length !== 10
            ) {

                if (phoneMessage) {

                    phoneMessage.textContent =
                        "";

                }

                return;

            }


            if (phoneCheckTimer) {

                clearTimeout(
                    phoneCheckTimer
                );

            }


            phoneCheckTimer =
                setTimeout(
                    async function () {

                        try {

                            if (phoneMessage) {

                                phoneMessage.textContent =
                                    "Checking mobile number...";

                            }
if (exists) {

                                if (phoneMessage) {

                                    phoneMessage.textContent =
                                        "This mobile number has already been used.";

                                    phoneMessage.className =
                                        "phone-error";

                                }

                            } else {

                                if (phoneMessage) {

                                    phoneMessage.textContent =
                                        "Mobile number is available.";

                                    phoneMessage.className =
                                        "phone-success";

                                }

                            }

                        } catch (error) {

                            console.error(
                                error
                            );

                            if (phoneMessage) {

                                phoneMessage.textContent =
                                    "";

                            }

                        }

                    },
                    300
                );

        }
    );

}


// =========================================
// SUBMIT JOIN APPLICATION
// =========================================

if (joinForm) {

    joinForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ---------------------------------
            // GET VALUES
            // ---------------------------------

            const name =
                joinName.value.trim();

            const phone =
                joinPhone.value.trim();

            const dob =
                joinDob
                    ? joinDob.value
                    : "";

            const address =
                joinAddress.value.trim();

            const occupation =
                joinOccupation
                    ? joinOccupation.value.trim()
                    : "";

            const email =
                joinEmail
                    ? joinEmail.value.trim()
                    : "";

            const reason =
                joinReason
                    ? joinReason.value.trim()
                    : "";

            const photoFile =
                joinPhoto && joinPhoto.files
                    ? joinPhoto.files[0]
                    : null;


            // ---------------------------------
            // VALIDATION
            // ---------------------------------

            if (!name) {

                showMessage(
                    "Please enter your full name.",
                    "error"
                );

                joinName.focus();

                return;

            }


            if (!dob) {

                showMessage(
                    "Please select your date of birth.",
                    "error"
                );

                if (joinDob) {
                    joinDob.focus();
                }

                return;

            }


            if (
                !/^[0-9]{10}$/.test(
                    phone
                )
            ) {

                showMessage(
                    "Please enter a valid 10 digit mobile number.",
                    "error"
                );

                joinPhone.focus();

                return;

            }


            if (!address) {

                showMessage(
                    "Please enter your address.",
                    "error"
                );

                joinAddress.focus();

                return;

            }


            if (!photoFile) {

                showMessage(
                    "Please upload your photo.",
                    "error"
                );

                if (joinPhoto) {
                    joinPhoto.focus();
                }

                return;

            }


            if (!photoFile.type.startsWith("image/")) {

                showMessage(
                    "Please upload a valid image file.",
                    "error"
                );

                if (joinPhoto) {
                    joinPhoto.focus();
                }

                return;

            }


            if (photoFile.size > 5 * 1024 * 1024) {

                showMessage(
                    "Photo size must be 5 MB or less.",
                    "error"
                );

                if (joinPhoto) {
                    joinPhoto.focus();
                }

                return;

            }


            // ---------------------------------
            // DISABLE BUTTON
            // ---------------------------------

            if (joinSubmitBtn) {

                joinSubmitBtn.disabled =
                    true;

                joinSubmitBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    Checking...
                `;

            }


            try {

                // ---------------------------------
                // CHECK DUPLICATE MOBILE
                // ---------------------------------



                // ---------------------------------
                // UPLOAD MEMBER PHOTO
                // ---------------------------------

                const croppedPhoto =
                    await openPassportCropper(photoFile);

                const photoUrl =
                    await uploadMembershipPhoto(croppedPhoto);


                // ---------------------------------
                // SAVE APPLICATION
                // ---------------------------------

                if (joinSubmitBtn) {

                    joinSubmitBtn.innerHTML = `
                        <i class="fas fa-spinner fa-spin"></i>
                        Submitting...
                    `;

                }


                await addDoc(
                    collection(
                        db,
                        "joinApplications"
                    ),
                    {

                        name:
                            name,

                        phone:
                            phone,

                        dob:
                            dob,

                        address:
                            address,

                        occupation:
                            occupation,

                        email:
                            email,

                        reason:
                            reason,

                        photo:
                            photoUrl,

                        status:
                            "pending",

                        createdAt:
                            serverTimestamp()

                    }
                );


                // ---------------------------------
                // SUCCESS
                // ---------------------------------

                showMessage(
                    `
                    <i class="fas fa-circle-check"></i>
                    Your membership application has been submitted successfully.
                    Our admin team will review your application.
                    `,
                    "success"
                );


                // ---------------------------------
                // RESET FORM
                // ---------------------------------

                joinForm.reset();


                if (phoneMessage) {

                    phoneMessage.textContent =
                        "";

                }


                // ---------------------------------
                // RESTORE BUTTON
                // ---------------------------------

                if (joinSubmitBtn) {

                    joinSubmitBtn.disabled =
                        false;

                    joinSubmitBtn.innerHTML = `
                        <i class="fas fa-check"></i>
                        Application Submitted
                    `;

                }


                // Restore button after few seconds

                setTimeout(
                    function () {

                        if (joinSubmitBtn) {

                            joinSubmitBtn.innerHTML = `
                                <i class="fas fa-paper-plane"></i>
                                Submit Application
                            `;

                        }

                    },
                    4000
                );


            } catch (error) {

                console.error(
                    "Join Application Error:",
                    error
                );


                showMessage(
                    `
                    <i class="fas fa-circle-exclamation"></i>
                    Something went wrong. Please try again later.
                    `,
                    "error"
                );


                if (joinSubmitBtn) {

                    joinSubmitBtn.disabled =
                        false;

                    joinSubmitBtn.innerHTML = `
                        <i class="fas fa-paper-plane"></i>
                        Submit Application
                    `;

                }

            }

        }
    );

}


// =========================================
// LOAD APPROVED MEMBERS
// ONLY APPROVED MEMBERSHIP FORM APPLICATIONS
// REAL-TIME FIRESTORE LISTENER
// =========================================

function loadApprovedMembers() {
    if (!approvedMembersList) return;

    approvedMembersList.innerHTML = `
        <div class="community-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading community...</p>
        </div>`;

    // IMPORTANT:
    // Contact page reads ONLY joinApplications.
    // Admin-created members in the `members` collection are NOT shown here.
    // Only applications whose status is exactly "approved" are shown.
    const approvedApplicationsQuery = query(
        collection(db, "joinApplications"),
        where("status", "==", "approved")
    );

    onSnapshot(
        approvedApplicationsQuery,
        (snapshot) => {
            const members = [];

            snapshot.forEach((docSnap) => {
                const data = docSnap.data() || {};

                members.push({
                    id: docSnap.id,
                    name: String(data.name || "SKL Member").trim(),
                    phone: String(data.phone || data.mobile || "").trim(),
                    // Membership form saves photo in `photo`.
                    // imageUrl is kept as a fallback for older applications.
                    photo: String(data.photo || data.imageUrl || "").trim()
                });
            });

            // IMPORTANT: Every approved membership application is a community member.
            // Do NOT deduplicate by mobile number here. The Admin panel counts approved
            // applications/documents, so the public community count must use the exact
            // same approved-document count. Each Firestore application gets its own row.
            const approvedMembers = members.sort((a, b) =>
                a.name.localeCompare(b.name, "en", { sensitivity: "base" })
            );

            if (communityCount) {
                communityCount.textContent = String(approvedMembers.length);
            }

            if (!approvedMembers.length) {
                approvedMembersList.innerHTML = `
                    <div class="community-empty">
                        <i class="fas fa-users"></i>
                        <h3>No Members Yet</h3>
                        <p>Be the first to join SKL Yuva Club.</p>
                    </div>`;
                return;
            }

            approvedMembersList.innerHTML = "";

            approvedMembers.forEach((member, index) => {
                const item = document.createElement("div");
                item.className = "community-member";

                const photo = document.createElement("img");
                photo.className = "community-member-photo";
                photo.alt = `${member.name} photo`;
                photo.loading = "lazy";
                photo.src = member.photo || "assets/images/logo.webp";
                photo.onerror = () => {
                    photo.onerror = null;
                    photo.src = "assets/images/logo.webp";
                };

                const number = document.createElement("span");
                number.className = "member-number";
                number.textContent = String(index + 1);

                const name = document.createElement("span");
                name.className = "member-name";
                name.textContent = member.name;

                item.appendChild(photo);
                item.appendChild(number);
                item.appendChild(name);
                approvedMembersList.appendChild(item);
            });
        },
        (error) => {
            console.error("Approved Members Live Update Error:", error);

            approvedMembersList.innerHTML = `
                <div class="community-error">
                    <i class="fas fa-circle-exclamation"></i>
                    <h3>Unable to Load Community</h3>
                    <p>Please check Firebase permissions and try again.</p>
                </div>`;

            if (communityCount) communityCount.textContent = "0";
        }
    );
}

// =========================================
// HTML ESCAPE HELPER
// =========================================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================================
// START
// =========================================

loadApprovedMembers();