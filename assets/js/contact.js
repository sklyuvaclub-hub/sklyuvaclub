/* =========================================
   SKL YUVA CLUB
   CONTACT + JOIN MEMBERSHIP
   FIRESTORE
========================================= */

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


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
// ONLY APPROVED MEMBERSHIP APPLICATIONS
// =========================================

async function loadApprovedMembers() {
    if (!approvedMembersList) return;

    approvedMembersList.innerHTML = `
        <div class="community-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading community...</p>
        </div>`;

    try {
        // Community list must come ONLY from currently approved
        // membership applications. Deleted/rejected applications are
        // therefore automatically excluded from this list.
        const approvedApplicationsQuery = query(
            collection(db, "joinApplications"),
            where("status", "==", "approved")
        );

        const applicationSnapshot = await getDocs(approvedApplicationsQuery);
        const memberMap = new Map();

        applicationSnapshot.forEach((docSnap) => {
            const data = docSnap.data() || {};
            const key = String(
                data.phone || data.mobile || data.name || docSnap.id
            ).replace(/\D/g, "") || docSnap.id;

            if (!memberMap.has(key)) {
                memberMap.set(key, {
                    id: docSnap.id,
                    name: data.name || "SKL Member",
                    phone: data.phone || data.mobile || ""
                });
            }
        });

        const members = Array.from(memberMap.values()).sort((a, b) =>
            String(a.name).localeCompare(String(b.name))
        );

        if (communityCount) communityCount.textContent = String(members.length);

        if (!members.length) {
            approvedMembersList.innerHTML = `
                <div class="community-empty">
                    <i class="fas fa-users"></i>
                    <h3>No Members Yet</h3>
                    <p>Be the first to join SKL Yuva Club.</p>
                </div>`;
            return;
        }

        const initialVisibleCount = 10;
        let showAllMembers = false;

        const renderCommunityMembers = () => {
            const visibleMembers = showAllMembers
                ? members
                : members.slice(0, initialVisibleCount);

            approvedMembersList.innerHTML = "";

            visibleMembers.forEach((member, index) => {
                const item = document.createElement("div");
                item.className = "community-member";
                item.innerHTML = `
                    <span class="member-number">${index + 1}</span>
                    <span class="member-name">${escapeHTML(member.name)}</span>`;
                approvedMembersList.appendChild(item);
            });

            if (members.length > initialVisibleCount) {
                const buttonWrap = document.createElement("div");
                buttonWrap.className = "community-show-more-wrap";

                const button = document.createElement("button");
                button.type = "button";
                button.className = "community-show-more";
                button.innerHTML = showAllMembers
                    ? `Show Less <i class="fas fa-chevron-up"></i>`
                    : `Show More <i class="fas fa-chevron-down"></i>`;

                button.addEventListener("click", () => {
                    showAllMembers = !showAllMembers;
                    renderCommunityMembers();
                });

                buttonWrap.appendChild(button);
                approvedMembersList.appendChild(buttonWrap);
            }
        };

        renderCommunityMembers();
    } catch (error) {
        console.error("Approved Members Error:", error);
        if (approvedMembersList) {
            approvedMembersList.innerHTML = `
                <div class="community-error">
                    <i class="fas fa-circle-exclamation"></i>
                    <h3>Unable to Load Community</h3>
                    <p>Please try again later.</p>
                </div>`;
        }
        if (communityCount) communityCount.textContent = "0";
    }
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