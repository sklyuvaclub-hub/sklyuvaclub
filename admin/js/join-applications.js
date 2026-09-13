import { adminAuthReady } from "./admin-auth.js";
await adminAuthReady;

/* =========================================================
   SKL YUVA CLUB
   ADMIN - JOIN APPLICATIONS
   FIRESTORE
========================================================= */

import { db } from "../../assets/js/firebase.js";
import { openPassportCropper } from "../../assets/js/photo-cropper.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================================
// CLOUDINARY PHOTO UPLOAD
// Same Cloudinary setup already used by the membership form.
// =========================================================

const CLOUD_NAME = "shrhhsz0";
const UPLOAD_PRESET = "skl_gallery";

async function uploadApplicationPhoto(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
    const result = await response.json();
    if (result.error) throw new Error(result.error.message || "Photo upload failed.");
    if (!result.secure_url) throw new Error("Photo URL was not received.");
    return result.secure_url;
}


// =========================================================
// ELEMENTS
// =========================================================

const tableBody =
    document.getElementById("applicationsTableBody");

const searchInput =
    document.getElementById("applicationSearch");

const filterSelect =
    document.getElementById("applicationFilter");

const refreshBtn =
    document.getElementById("refreshApplicationsBtn");


const totalApplications =
    document.getElementById("totalApplications");

const pendingApplications =
    document.getElementById("pendingApplications");

const approvedApplications =
    document.getElementById("approvedApplications");

const rejectedApplications =
    document.getElementById("rejectedApplications");


// =========================================================
// MODAL ELEMENTS
// =========================================================

const applicationModal =
    document.getElementById("applicationModal");

const closeApplicationModal =
    document.getElementById("closeApplicationModal");

const modalCloseBtn =
    document.getElementById("modalCloseBtn");

const modalApproveBtn =
    document.getElementById("modalApproveBtn");

const modalRejectBtn =
    document.getElementById("modalRejectBtn");

const modalEditBtn = document.getElementById("modalEditBtn");
const editApplicationForm = document.getElementById("editApplicationForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveEditBtn = document.getElementById("saveEditBtn");
const editName = document.getElementById("editName");
const editPhone = document.getElementById("editPhone");
const editDob = document.getElementById("editDob");
const editAddress = document.getElementById("editAddress");
const editOccupation = document.getElementById("editOccupation");
const editEmail = document.getElementById("editEmail");
const editReason = document.getElementById("editReason");
const editPhoto = document.getElementById("editPhoto");


// Details

const detailName =
    document.getElementById("detailName");

const detailPhone =
    document.getElementById("detailPhone");

const detailDob =
    document.getElementById("detailDob");

const detailAddress =
    document.getElementById("detailAddress");

const detailOccupation =
    document.getElementById("detailOccupation");

const detailEmail =
    document.getElementById("detailEmail");

const detailDate =
    document.getElementById("detailDate");

const detailReason =
    document.getElementById("detailReason");

const detailStatus =
    document.getElementById("detailStatus");


// =========================================================
// DATA
// =========================================================

let applications = [];

let selectedApplication = null;


// =========================================================
// LOAD APPLICATIONS
// =========================================================

async function loadApplications() {

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="table-loading">

                <i class="fas fa-spinner fa-spin"></i>

                Loading applications...

            </td>
        </tr>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "joinApplications"
                )
            );


        applications = [];


        snapshot.forEach(
            (docSnap) => {

                applications.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        // Newest first

        applications.sort(
            (a, b) => {

                const aTime =
                    getTimestamp(
                        a.createdAt
                    );

                const bTime =
                    getTimestamp(
                        b.createdAt
                    );


                return bTime - aTime;

            }
        );


        updateStatistics();

        renderApplications();


    } catch (error) {

        console.error(
            "Load Applications Error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="table-loading">

                    <i class="fas fa-circle-exclamation"></i>

                    Unable to load applications.

                </td>
            </tr>
        `;

    }

}


// =========================================================
// TIMESTAMP HELPER
// =========================================================

function getTimestamp(value) {

    if (!value) {
        return 0;
    }


    // Firestore Timestamp

    if (
        typeof value.toMillis === "function"
    ) {

        return value.toMillis();

    }


    // JS Date

    if (
        value instanceof Date
    ) {

        return value.getTime();

    }


    // String / number

    const date =
        new Date(value);


    const time =
        date.getTime();


    return Number.isNaN(time)
        ? 0
        : time;

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {

    if (!value) {
        return "—";
    }


    let date;


    if (
        typeof value.toDate === "function"
    ) {

        date =
            value.toDate();

    } else {

        date =
            new Date(value);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// UPDATE STATISTICS
// =========================================================

function updateStatistics() {

    const total =
        applications.length;


    const pending =
        applications.filter(
            app =>
                (app.status || "pending")
                    .toLowerCase()
                === "pending"
        ).length;


    const approved =
        applications.filter(
            app =>
                (app.status || "")
                    .toLowerCase()
                === "approved"
        ).length;


    const rejected =
        applications.filter(
            app =>
                (app.status || "")
                    .toLowerCase()
                === "rejected"
        ).length;


    if (totalApplications) {

        totalApplications.textContent =
            total;

    }


    if (pendingApplications) {

        pendingApplications.textContent =
            pending;

    }


    if (approvedApplications) {

        approvedApplications.textContent =
            approved;

    }


    if (rejectedApplications) {

        rejectedApplications.textContent =
            rejected;

    }

}


// =========================================================
// RENDER APPLICATIONS
// =========================================================

function renderApplications() {

    if (!tableBody) {
        return;
    }


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filter =
        filterSelect
            ? filterSelect.value
            : "all";


    let filtered =
        [...applications];


    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------

    if (search) {

        filtered =
            filtered.filter(
                app => {

                    const name =
                        String(
                            app.name || ""
                        ).toLowerCase();


                    const phone =
                        String(
                            app.phone || ""
                        ).toLowerCase();


                    const email =
                        String(
                            app.email || ""
                        ).toLowerCase();


                    return (
                        name.includes(search) ||
                        phone.includes(search) ||
                        email.includes(search)
                    );

                }
            );

    }


    // ---------------------------------------------------------
    // FILTER
    // ---------------------------------------------------------

    if (filter !== "all") {

        filtered =
            filtered.filter(
                app => {

                    return (
                        String(
                            app.status || "pending"
                        ).toLowerCase()
                        === filter
                    );

                }
            );

    }


    // ---------------------------------------------------------
    // EMPTY
    // ---------------------------------------------------------

    if (filtered.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="table-loading">

                    <i class="fas fa-inbox"></i>

                    No applications found.

                </td>

            </tr>
        `;

        return;

    }


    // ---------------------------------------------------------
    // TABLE
    // ---------------------------------------------------------

    tableBody.innerHTML = "";


    filtered.forEach(
        application => {

            const row =
                document.createElement("tr");


            const status =
                (
                    application.status ||
                    "pending"
                ).toLowerCase();


            // ---------------------------------------------
            // STATUS
            // ---------------------------------------------

            let statusClass =
                "status-pending";

            let statusIcon =
                "fa-clock";


            if (
                status === "approved"
            ) {

                statusClass =
                    "status-approved";

                statusIcon =
                    "fa-circle-check";

            }


            if (
                status === "rejected"
            ) {

                statusClass =
                    "status-rejected";

                statusIcon =
                    "fa-circle-xmark";

            }


            row.innerHTML = `

                <td>

                    <div class="application-user">

                        <div class="application-avatar">

                            <i class="fas fa-user"></i>

                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(
                application.name ||
                "Unknown"
            )}
                            </strong>

                            <small>
                                ${escapeHTML(
                application.email ||
                "No email"
            )}
                            </small>

                        </div>

                    </div>

                </td>


                <td>

                    ${escapeHTML(
                application.phone ||
                "—"
            )}

                </td>


                <td>

                    ${escapeHTML(
                application.occupation ||
                "—"
            )}

                </td>


                <td>

                    ${formatDate(
                application.createdAt
            )}

                </td>


                <td>

                    <span
                        class="application-status ${statusClass}">

                        <i
                            class="fas ${statusIcon}">
                        </i>

                        ${capitalize(
                status
            )}

                    </span>

                </td>


                <td>

                    <div class="table-actions">

                        <button
                            type="button"
                            class="action-btn action-view"
                            title="View"
                            data-action="view"
                            data-id="${application.id}">

                            <i class="fas fa-eye"></i>

                        </button>


                        <button type="button" class="action-btn action-edit" title="Edit" data-action="edit" data-id="${application.id}">
                            <i class="fas fa-pen"></i>
                        </button>


                        ${status !== "approved"
                    ? `
                                <button
                                    type="button"
                                    class="action-btn action-approve"
                                    title="Approve"
                                    data-action="approve"
                                    data-id="${application.id}">

                                    <i class="fas fa-check"></i>

                                </button>
                            `
                    : ""
                }


                        ${status !== "rejected"
                    ? `
                                <button
                                    type="button"
                                    class="action-btn action-reject"
                                    title="Reject"
                                    data-action="reject"
                                    data-id="${application.id}">

                                    <i class="fas fa-xmark"></i>

                                </button>
                            `
                    : ""
                }


                        <button
                            type="button"
                            class="action-btn action-delete"
                            title="Delete"
                            data-action="delete"
                            data-id="${application.id}">

                            <i class="fas fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


// =========================================================
// TABLE ACTIONS
// =========================================================

if (tableBody) {

    tableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            const id =
                button.dataset.id;


            const application =
                applications.find(
                    app =>
                        app.id === id
                );


            if (!application) {
                return;
            }


            if (
                action === "view"
            ) {

                openApplicationModal(
                    application
                );

            }


            if (
                action === "approve"
            ) {

                approveApplication(
                    application
                );

            }


            if (
                action === "edit"
            ) {
                openApplicationModal(application);
                enterEditMode();
            }


            if (
                action === "reject"
            ) {

                rejectApplication(
                    application
                );

            }


            if (
                action === "delete"
            ) {

                deleteApplication(
                    application
                );

            }

        }
    );

}


// =========================================================
// OPEN MODAL
// =========================================================

function openApplicationModal(
    application
) {

    selectedApplication =
        application;


    if (detailName) {

        detailName.textContent =
            application.name ||
            "—";

    }


    if (detailPhone) {

        detailPhone.textContent =
            application.phone ||
            "—";

    }


    if (detailDob) {

        detailDob.textContent =
            formatDob(application.dob);

    }


    if (detailAddress) {

        detailAddress.textContent =
            application.address ||
            "—";

    }


    if (detailOccupation) {

        detailOccupation.textContent =
            application.occupation ||
            "—";

    }


    if (detailEmail) {

        detailEmail.textContent =
            application.email ||
            "—";

    }


    if (detailDate) {

        detailDate.textContent =
            formatDate(
                application.createdAt
            );

    }


    if (detailReason) {

        detailReason.textContent =
            application.reason ||
            "—";

    }


    if (detailStatus) {

        detailStatus.textContent =
            capitalize(
                application.status ||
                "pending"
            );

    }


    // Show/hide buttons

    const status =
        (
            application.status ||
            "pending"
        ).toLowerCase();


    if (modalApproveBtn) {

        modalApproveBtn.style.display =
            status === "approved"
                ? "none"
                : "inline-flex";

    }


    if (modalRejectBtn) {

        modalRejectBtn.style.display =
            status === "rejected"
                ? "none"
                : "inline-flex";

    }


    if (applicationModal) {

        applicationModal.classList.add(
            "active"
        );

    }

}


// =========================================================
// EDIT APPLICATION
// =========================================================

function enterEditMode() {
    if (!selectedApplication) return;

    const application = selectedApplication;
    if (editName) editName.value = application.name || "";
    if (editPhone) editPhone.value = application.phone || application.mobile || "";
    if (editDob) editDob.value = application.dob || "";
    if (editAddress) editAddress.value = application.address || "";
    if (editOccupation) editOccupation.value = application.occupation || "";
    if (editEmail) editEmail.value = application.email || "";
    if (editReason) editReason.value = application.reason || "";
    if (editPhoto) editPhoto.value = "";

    if (editApplicationForm) editApplicationForm.style.display = "block";
    if (modalEditBtn) modalEditBtn.style.display = "none";
    if (modalApproveBtn) modalApproveBtn.style.display = "none";
    if (modalRejectBtn) modalRejectBtn.style.display = "none";
}

function exitEditMode() {
    if (editApplicationForm) editApplicationForm.style.display = "none";
    if (modalEditBtn) modalEditBtn.style.display = "inline-flex";

    if (selectedApplication) {
        const status = String(selectedApplication.status || "pending").toLowerCase();
        if (modalApproveBtn) modalApproveBtn.style.display = status === "approved" ? "none" : "inline-flex";
        if (modalRejectBtn) modalRejectBtn.style.display = status === "rejected" ? "none" : "inline-flex";
    }
}

if (modalEditBtn) modalEditBtn.addEventListener("click", enterEditMode);
if (cancelEditBtn) cancelEditBtn.addEventListener("click", exitEditMode);

if (editApplicationForm) {
    editApplicationForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!selectedApplication) return;

        const name = editName ? editName.value.trim() : "";
        const phone = editPhone ? editPhone.value.replace(/\D/g, "") : "";
        const dob = editDob ? editDob.value : "";
        const address = editAddress ? editAddress.value.trim() : "";
        const occupation = editOccupation ? editOccupation.value.trim() : "";
        const email = editEmail ? editEmail.value.trim() : "";
        const reason = editReason ? editReason.value.trim() : "";
        const photoFile = editPhoto && editPhoto.files ? editPhoto.files[0] : null;

        // All fields are optional for ADMIN editing.
        // Validate a field only when the admin has entered a value.
        if (phone && phone.length !== 10) {
            alert("Mobile number must be 10 digits, or left empty.");
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address, or leave it empty.");
            return;
        }

        if (photoFile && !photoFile.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }

        if (photoFile && photoFile.size > 5 * 1024 * 1024) {
            alert("Photo size must be 5 MB or less.");
            return;
        }

        const original = selectedApplication;

        try {
            if (saveEditBtn) {
                saveEditBtn.disabled = true;
                saveEditBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }

            let photoUrl = original.photo || original.imageUrl || "";

            if (photoFile) {
                if (saveEditBtn) saveEditBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Photo...';
                const croppedPhoto = await openPassportCropper(photoFile);
                photoUrl = await uploadApplicationPhoto(croppedPhoto);
            }

            await updateDoc(
                doc(db, "joinApplications", original.id),
                { name, phone, dob, address, occupation, email, reason, photo: photoUrl, updatedAt: serverTimestamp() }
            );

            if (String(original.status || "pending").toLowerCase() === "approved") {
                await setDoc(
                    doc(db, "members", original.id),
                    {
                        name, phone, dob, address, occupation, email,
                        position: original.position || "Member",
                        status: "active",
                        source: original.source || "community_approved",
                        photo: photoUrl,
                        createdAt: original.createdAt || serverTimestamp(),
                        updatedAt: serverTimestamp()
                    },
                    { merge: true }
                );
            }

            alert("Application updated successfully.");
            closeModal();
            await loadApplications();

        } catch (error) {
            console.error("Edit Application Error:", error);
            alert("Unable to update application.");
        } finally {
            if (saveEditBtn) {
                saveEditBtn.disabled = false;
                saveEditBtn.innerHTML = '<i class="fas fa-floppy-disk"></i> Save Changes';
            }
        }
    });
}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeModal() {

    exitEditMode();

    if (applicationModal) {

        applicationModal.classList.remove(
            "active"
        );

    }


    selectedApplication =
        null;

}


if (closeApplicationModal) {

    closeApplicationModal.addEventListener(
        "click",
        closeModal
    );

}


if (modalCloseBtn) {

    modalCloseBtn.addEventListener(
        "click",
        closeModal
    );

}


// Close when clicking outside

if (applicationModal) {

    applicationModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                applicationModal
            ) {

                closeModal();

            }

        }
    );

}


// =========================================================
// APPROVE FROM MODAL
// =========================================================

if (modalApproveBtn) {

    modalApproveBtn.addEventListener(
        "click",
        async function () {

            if (!selectedApplication) {
                return;
            }


            await approveApplication(
                selectedApplication
            );

        }
    );

}


// =========================================================
// REJECT FROM MODAL
// =========================================================

if (modalRejectBtn) {

    modalRejectBtn.addEventListener(
        "click",
        async function () {

            if (!selectedApplication) {
                return;
            }


            await rejectApplication(
                selectedApplication
            );

        }
    );

}


// =========================================================
// FORMAT DATE OF BIRTH
// =========================================================

function formatDob(value) {

    if (!value) {
        return "—";
    }

    const parts = String(value).split("-");

    if (parts.length !== 3) {
        return String(value);
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


// =========================================================
// APPROVE APPLICATION
// =========================================================

async function approveApplication(
    application
) {

    const confirmApprove =
        confirm(
            `Approve membership application for "${application.name}"?`
        );


    if (!confirmApprove) {
        return;
    }


    try {

        await updateDoc(
            doc(
                db,
                "joinApplications",
                application.id
            ),
            {
                status: "approved"
            }
        );

        // Keep the public Members collection in sync when an application is approved.
        // This also carries DOB so the member appears in the admin birthday calendar.
        await setDoc(
            doc(db, "members", application.id),
            {
                name: String(application.name || "").trim(),
                phone: String(application.phone || application.mobile || "").replace(/\D/g, ""),
                dob: application.dob || "",
                address: application.address || "",
                occupation: application.occupation || "",
                email: application.email || "",
                position: application.position || "Member",
                status: "active",
                source: "community_approved",
                photo: application.photo || application.imageUrl || "",
                createdAt: application.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp()
            },
            { merge: true }
        );


        alert(
            "Application approved successfully."
        );


        closeModal();

        await loadApplications();


    } catch (error) {

        console.error(
            "Approve Error:",
            error
        );


        alert(
            "Unable to approve application."
        );

    }

}


// =========================================================
// REJECT APPLICATION
// =========================================================

async function rejectApplication(
    application
) {

    const confirmReject =
        confirm(
            `Reject membership application for "${application.name}"?`
        );


    if (!confirmReject) {
        return;
    }


    try {

        await updateDoc(
            doc(
                db,
                "joinApplications",
                application.id
            ),
            {
                status: "rejected"
            }
        );


        alert(
            "Application rejected."
        );


        closeModal();

        await loadApplications();


    } catch (error) {

        console.error(
            "Reject Error:",
            error
        );


        alert(
            "Unable to reject application."
        );

    }

}


// =========================================================
// DELETE APPLICATION
// =========================================================

async function deleteApplication(
    application
) {

    const confirmDelete =
        confirm(
            `Delete application of "${application.name}"?\n\nThis action cannot be undone.`
        );


    if (!confirmDelete) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "joinApplications",
                application.id
            )
        );


        alert(
            "Application deleted successfully."
        );


        closeModal();

        await loadApplications();


    } catch (error) {

        console.error(
            "Delete Error:",
            error
        );


        alert(
            "Unable to delete application."
        );

    }

}


// =========================================================
// SEARCH
// =========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderApplications
    );

}


// =========================================================
// FILTER
// =========================================================

if (filterSelect) {

    filterSelect.addEventListener(
        "change",
        renderApplications
    );

}


// =========================================================
// REFRESH
// =========================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadApplications
    );

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(
    value
) {

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


// =========================================================
// CAPITALIZE
// =========================================================

function capitalize(
    value
) {

    const text =
        String(value || "");


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


// =========================================================
// START
// =========================================================

loadApplications();