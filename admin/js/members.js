/* =========================================
   SKL YUVA CLUB
   ADMIN - MEMBERS MANAGEMENT
========================================= */

import { auth, db } from "../../assets/js/firebase.js";

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

const memberForm = document.getElementById("memberForm");
const memberModal = document.getElementById("memberModal");

const addMemberBtn = document.getElementById("addMemberBtn");
const closeMemberModal = document.getElementById("closeMemberModal");
const cancelMemberBtn = document.getElementById("cancelMemberBtn");

const membersTableBody =
    document.getElementById("membersTableBody");

const memberSearch =
    document.getElementById("memberSearch");

const memberName =
    document.getElementById("memberName");

const memberMobile =
    document.getElementById("memberMobile");

const memberDesignation =
    document.getElementById("memberDesignation");

const memberStatus =
    document.getElementById("memberStatus");

const memberPhoto =
    document.getElementById("memberPhoto");

const memberImagePreview =
    document.getElementById("memberImagePreview");

const previewImage =
    document.getElementById("previewImage");

const modalTitle =
    document.getElementById("modalTitle");

const saveMemberBtn =
    document.getElementById("saveMemberBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


// =========================================
// VARIABLES
// =========================================

let members = [];
let editingMemberId = null;
let existingPhoto = "";


// =========================================
// AUTH CHECK
// =========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";

        return;
    }

    await loadMembers();

});


// =========================================
// LOAD MEMBERS
// =========================================

async function loadMembers() {

    if (!membersTableBody) {
        return;
    }

    membersTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="table-loading">

                <i class="fas fa-spinner fa-spin"></i>

                Loading members...

            </td>
        </tr>
    `;

    try {

        const snapshot =
            await getDocs(
                collection(db, "members")
            );

        members = [];

        snapshot.forEach((item) => {

            const data = item.data();

            // Admin Members page must contain ONLY members added
            // from Admin -> Add Member. Approved membership-form
            // applications are stored in the same collection for
            // Community/Birthday use, so exclude those records here.
            if (data.source === "community_approved") {
                return;
            }

            members.push({
                id: item.id,
                ...data
            });

        });

        renderMembers(members);

    } catch (error) {

        console.error(
            "Load Members Error:",
            error
        );

        membersTableBody.innerHTML = `
            <tr>
                <td colspan="5">

                    Unable to load members.

                </td>
            </tr>
        `;

        alert(
            getErrorMessage(error)
        );

    }

}


// =========================================
// RENDER MEMBERS
// =========================================

function renderMembers(data) {

    if (!membersTableBody) {
        return;
    }

    if (data.length === 0) {

        membersTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:30px;">

                    <i class="fas fa-users"
                       style="font-size:30px;">
                    </i>

                    <h3>No Members Found</h3>

                    <p>
                        Click "Add Member" to add a member.
                    </p>

                </td>
            </tr>
        `;

        return;
    }


    membersTableBody.innerHTML =
        data.map((member) => {

            const status =
                member.status === "inactive"
                    ? "inactive"
                    : "active";


            const statusText =
                status === "active"
                    ? "Active"
                    : "Inactive";


            const photo =
                member.photo || "";


            return `

                <tr>

                    <td>

                        <div class="member-table-info">

                            ${photo
                    ? `
                                        <img
                                            src="${escapeHTML(photo)}"
                                            alt="${escapeHTML(member.name || "Member")}"
                                            class="member-table-photo"
                                        >
                                      `
                    : `
                                        <div class="member-table-photo"
                                             style="display:flex;align-items:center;justify-content:center;">

                                            <i class="fas fa-user"></i>

                                        </div>
                                      `
                }

                            <div>

                                <strong>
                                    ${escapeHTML(
                    member.name || "Unnamed"
                )}
                                </strong>

                            </div>

                        </div>

                    </td>


                    <td>
                        ${escapeHTML(
                    member.phone || "-"
                )}
                    </td>


                    <td>
                        ${escapeHTML(
                    member.position || "Member"
                )}
                    </td>


                    <td>

                        <span class="status-badge ${status}">

                            <i class="fas fa-circle"></i>

                            ${statusText}

                        </span>

                    </td>


                    <td>

                        <div class="table-actions">

                            <button
                                type="button"
                                class="table-btn editBtn"
                                data-id="${member.id}"
                            >

                                <i class="fas fa-pen"></i>

                                Edit

                            </button>


                            <button
                                type="button"
                                class="table-btn deleteBtn"
                                data-id="${member.id}"
                            >

                                <i class="fas fa-trash"></i>

                                Delete

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");


    attachActionButtons();

}


// =========================================
// ACTION BUTTONS
// =========================================

function attachActionButtons() {

    document.querySelectorAll(".editBtn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openEditModal(
                        button.dataset.id
                    );

                }
            );

        });


    document.querySelectorAll(".deleteBtn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    deleteMember(
                        button.dataset.id
                    );

                }
            );

        });

}


// =========================================
// ADD MEMBER BUTTON
// =========================================

if (addMemberBtn) {

    addMemberBtn.addEventListener(
        "click",
        () => {

            resetForm();

            modalTitle.textContent =
                "Add Member";

            saveMemberBtn.innerHTML = `
                <i class="fas fa-save"></i>
                Save Member
            `;

            memberModal.classList.add(
                "active"
            );

        }
    );

}


// =========================================
// EDIT MEMBER
// =========================================

function openEditModal(id) {

    const member =
        members.find(
            (item) => item.id === id
        );


    if (!member) {

        alert("Member not found.");

        return;
    }


    editingMemberId =
        member.id;


    existingPhoto =
        member.photo || "";


    memberName.value =
        member.name || "";


    memberMobile.value =
        member.phone || "";


    memberDesignation.value =
        member.position || "";


    memberStatus.value =
        member.status || "active";


    /*
       File input cannot be filled
       programmatically.
    */

    memberPhoto.value = "";


    if (existingPhoto) {

        previewImage.src =
            existingPhoto;

        memberImagePreview.style.display =
            "flex";

    } else {

        memberImagePreview.style.display =
            "none";

    }


    modalTitle.textContent =
        "Edit Member";


    saveMemberBtn.innerHTML = `
        <i class="fas fa-save"></i>
        Update Member
    `;


    memberModal.classList.add(
        "active"
    );

}


// =========================================
// PHOTO PREVIEW
// =========================================

if (memberPhoto) {

    memberPhoto.addEventListener(
        "change",
        () => {

            const file =
                memberPhoto.files[0];


            if (!file) {

                return;
            }


            if (
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please select an image file."
                );

                memberPhoto.value = "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    previewImage.src =
                        event.target.result;

                    memberImagePreview.style.display =
                        "flex";

                };


            reader.readAsDataURL(file);

        }
    );

}


// =========================================
// CLOSE MODAL
// =========================================

function closeModal() {

    memberModal.classList.remove(
        "active"
    );

    resetForm();

}


if (closeMemberModal) {

    closeMemberModal.addEventListener(
        "click",
        closeModal
    );

}


if (cancelMemberBtn) {

    cancelMemberBtn.addEventListener(
        "click",
        closeModal
    );

}


if (memberModal) {

    memberModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === memberModal
            ) {

                closeModal();

            }

        }
    );

}


// =========================================
// COMPRESS IMAGE
// =========================================

async function compressImage(file) {

    const maxWidth = 600;
    const maxHeight = 600;
    const quality = 0.65;


    const dataURL =
        await readFile(file);


    const image =
        new Image();


    await new Promise(
        (resolve, reject) => {

            image.onload =
                resolve;

            image.onerror =
                reject;

            image.src =
                dataURL;

        }
    );


    let width =
        image.width;

    let height =
        image.height;


    const scale =
        Math.min(
            maxWidth / width,
            maxHeight / height,
            1
        );


    width =
        Math.round(
            width * scale
        );


    height =
        Math.round(
            height * scale
        );


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        width;

    canvas.height =
        height;


    const context =
        canvas.getContext(
            "2d"
        );


    context.drawImage(
        image,
        0,
        0,
        width,
        height
    );


    return canvas.toDataURL(
        "image/jpeg",
        quality
    );

}


// =========================================
// READ FILE
// =========================================

function readFile(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Unable to read image."
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// =========================================
// SAVE MEMBER
// =========================================

if (memberForm) {

    memberForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // =================================
            // GET FORM VALUES
            // =================================

            const name =
                memberName
                    ? memberName.value.trim()
                    : "";


            /*
               IMPORTANT:
               Current HTML uses memberMobile,
               NOT memberPhone.
            */

            const phone =
                memberMobile
                    ? String(
                        memberMobile.value
                    ).replace(
                        /\D/g,
                        ""
                    )
                    : "";


            const position =
                memberDesignation
                    ? memberDesignation.value.trim()
                    : "";


            const status =
                memberStatus
                    ? memberStatus.value
                    : "active";


            // =================================
            // NAME VALIDATION
            // =================================

            if (!name) {

                alert(
                    "Please enter member name."
                );

                memberName.focus();

                return;
            }


            // =================================
            // DESIGNATION VALIDATION
            // =================================

            if (!position) {

                alert(
                    "Please enter member designation."
                );

                memberDesignation.focus();

                return;
            }


            // =================================
            // MOBILE VALIDATION
            // =================================

            console.log(
                "Mobile entered:",
                memberMobile.value
            );


            console.log(
                "Clean mobile:",
                phone
            );


            if (
                phone.length !== 10
            ) {

                alert(
                    "Please enter a valid 10-digit mobile number."
                );

                memberMobile.focus();

                return;
            }


            // =================================
            // SAVE CLEAN NUMBER
            // =================================

            memberMobile.value =
                phone;


            // =================================
            // DISABLE BUTTON
            // =================================

            saveMemberBtn.disabled =
                true;


            saveMemberBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                Saving...
            `;


            try {

                // =================================
                // PHOTO
                // =================================

                let photo =
                    existingPhoto || "";


                const selectedFile =
                    memberPhoto &&
                        memberPhoto.files
                        ? memberPhoto.files[0]
                        : null;


                if (selectedFile) {

                    photo =
                        await compressImage(
                            selectedFile
                        );


                    /*
                       Firestore document size
                       safety check.
                    */

                    if (
                        photo.length > 750000
                    ) {

                        throw new Error(
                            "Image is too large. Please choose a smaller image."
                        );

                    }

                }


                // =================================
                // MEMBER DATA
                // =================================

                const memberData = {

                    name: name,

                    phone: phone,

                    position:
                        position,

                    // Explicitly mark records created from Admin -> Add Member.
                    // Membership-form approvals use source: community_approved.
                    source: "admin_added",

                    status:
                        status || "active",

                    photo: photo,

                    updatedAt:
                        serverTimestamp()

                };


                // =================================
                // EDIT
                // =================================

                if (editingMemberId) {

                    await updateDoc(
                        doc(
                            db,
                            "members",
                            editingMemberId
                        ),
                        memberData
                    );


                    alert(
                        "Member updated successfully."
                    );

                }


                // =================================
                // ADD
                // =================================

                else {

                    memberData.createdAt =
                        serverTimestamp();


                    await addDoc(
                        collection(
                            db,
                            "members"
                        ),
                        memberData
                    );


                    alert(
                        "Member added successfully."
                    );

                }


                // =================================
                // CLOSE + RELOAD
                // =================================

                closeModal();

                await loadMembers();


            } catch (error) {

                console.error(
                    "Save Member Error:",
                    error
                );


                alert(
                    getErrorMessage(
                        error
                    )
                );

            } finally {

                saveMemberBtn.disabled =
                    false;


                saveMemberBtn.innerHTML = `
                    <i class="fas fa-save"></i>
                    ${editingMemberId
                        ? "Update Member"
                        : "Save Member"
                    }
                `;

            }

        }
    );

}


// =========================================
// DELETE MEMBER
// =========================================

async function deleteMember(id) {

    const member =
        members.find(
            (item) => item.id === id
        );


    if (!member) {

        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${member.name}"?`
        );


    if (!confirmed) {

        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "members",
                id
            )
        );


        alert(
            "Member deleted successfully."
        );


        await loadMembers();


    } catch (error) {

        console.error(
            "Delete Member Error:",
            error
        );


        alert(
            getErrorMessage(
                error
            )
        );

    }

}


// =========================================
// SEARCH
// =========================================

if (memberSearch) {

    memberSearch.addEventListener(
        "input",
        () => {

            const searchText =
                memberSearch.value
                    .trim()
                    .toLowerCase();


            const filtered =
                members.filter(
                    (member) => {

                        const name =
                            String(
                                member.name || ""
                            ).toLowerCase();


                        const phone =
                            String(
                                member.phone || ""
                            ).toLowerCase();


                        const position =
                            String(
                                member.position || ""
                            ).toLowerCase();


                        return (
                            name.includes(
                                searchText
                            ) ||
                            phone.includes(
                                searchText
                            ) ||
                            position.includes(
                                searchText
                            )
                        );

                    }
                );


            renderMembers(
                filtered
            );

        }
    );

}


// =========================================
// RESET FORM
// =========================================

function resetForm() {

    if (memberForm) {

        memberForm.reset();

    }


    editingMemberId =
        null;


    existingPhoto =
        "";


    memberStatus.value =
        "active";


    memberImagePreview.style.display =
        "none";


    previewImage.src =
        "";


    modalTitle.textContent =
        "Add Member";


    saveMemberBtn.disabled =
        false;


    saveMemberBtn.innerHTML = `
        <i class="fas fa-save"></i>
        Save Member
    `;

}


// =========================================
// LOGOUT
// =========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;
            }


            try {

                await signOut(
                    auth
                );


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                alert(
                    "Unable to logout."
                );

            }

        }
    );

}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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
// FIREBASE ERROR
// =========================================

function getErrorMessage(error) {

    if (!error) {

        return "Something went wrong.";

    }


    if (
        error.code ===
        "permission-denied"
    ) {

        return (
            "Permission denied. Please check your Firestore Rules."
        );

    }


    if (
        error.code ===
        "unavailable"
    ) {

        return (
            "Firestore is unavailable. Please check your internet connection."
        );

    }


    if (
        error.code ===
        "failed-precondition"
    ) {

        return (
            "Firestore database is not available."
        );

    }


    if (
        error.code ===
        "resource-exhausted"
    ) {

        return (
            "Firestore limit reached. Please use a smaller image."
        );

    }


    return (
        error.message ||
        "Something went wrong."
    );

}