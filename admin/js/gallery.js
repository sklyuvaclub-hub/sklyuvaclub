/* =========================================
   SKL YUVA CLUB
   ADMIN GALLERY MANAGEMENT

   CLOUDINARY + FIRESTORE

   FEATURES:
   - Add Image
   - Image Title
   - Image Caption
   - Image Preview
   - Edit
   - Update
   - Delete
   - Search
========================================= */


// =========================================
// FIREBASE
// =========================================

import { db } from "../../assets/js/firebase.js";

import {

    collection,

    addDoc,

    getDocs,

    updateDoc,

    deleteDoc,

    doc,

    query,

    orderBy

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================
// CLOUDINARY
// =========================================

const CLOUD_NAME =
    "shrhhsz0";


const UPLOAD_PRESET =
    "skl_gallery";


// =========================================
// ELEMENTS
// =========================================

const galleryForm =
    document.getElementById(
        "galleryForm"
    );


const galleryTitle =
    document.getElementById(
        "galleryTitle"
    );


const galleryCaption =
    document.getElementById(
        "galleryCaption"
    );


const galleryImage =
    document.getElementById(
        "galleryImage"
    );


const galleryPreview =
    document.getElementById(
        "galleryPreview"
    );


const galleryPreviewBox =
    document.getElementById(
        "galleryPreviewBox"
    );


const galleryList =
    document.getElementById(
        "galleryList"
    );


const gallerySearch =
    document.getElementById(
        "gallerySearch"
    );


const galleryCount =
    document.getElementById(
        "galleryCount"
    );


const uploadGalleryBtn =
    document.getElementById(
        "uploadGalleryBtn"
    );


const cancelGalleryEditBtn =
    document.getElementById(
        "cancelGalleryEditBtn"
    );


const galleryFormTitle =
    document.getElementById(
        "galleryFormTitle"
    );


const galleryFormSubtitle =
    document.getElementById(
        "galleryFormSubtitle"
    );


// =========================================
// VARIABLES
// =========================================

let galleryItems = [];

let editingGalleryId = null;

let oldImageUrl = "";


// =========================================
// IMAGE PREVIEW
// =========================================

if (galleryImage) {

    galleryImage.addEventListener(
        "change",
        () => {

            const file =
                galleryImage.files[0];


            if (!file) {

                return;

            }


            // =================================
            // FILE TYPE
            // =================================

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image."
                );

                galleryImage.value =
                    "";

                return;

            }


            // =================================
            // FILE SIZE
            // =================================

            const maxSize =
                10 * 1024 * 1024;


            if (
                file.size > maxSize
            ) {

                alert(
                    "Image size must be less than 10 MB."
                );

                galleryImage.value =
                    "";

                return;

            }


            // =================================
            // PREVIEW
            // =================================

            const previewURL =
                URL.createObjectURL(
                    file
                );


            showPreview(
                previewURL
            );

        }
    );

}


// =========================================
// SHOW PREVIEW
// =========================================

function showPreview(
    url
) {

    if (
        !galleryPreview ||
        !galleryPreviewBox
    ) {

        return;

    }


    const emptyPreview =
        galleryPreviewBox.querySelector(
            ".gallery-preview-empty"
        );


    if (emptyPreview) {

        emptyPreview.style.display =
            "none";

    }


    galleryPreview.src =
        url;


    galleryPreview.style.display =
        "block";

}


// =========================================
// HIDE PREVIEW
// =========================================

function hidePreview() {

    if (
        !galleryPreview ||
        !galleryPreviewBox
    ) {

        return;

    }


    galleryPreview.src =
        "";


    galleryPreview.style.display =
        "none";


    const emptyPreview =
        galleryPreviewBox.querySelector(
            ".gallery-preview-empty"
        );


    if (emptyPreview) {

        emptyPreview.style.display =
            "flex";

    }

}


// =========================================
// CLOUDINARY UPLOAD
// =========================================

async function uploadImage(
    file
) {

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

                method:
                    "POST",

                body:
                    formData

            }

        );


    const result =
        await response.json();


    console.log(
        "Cloudinary Response:",
        result
    );


    if (
        result.error
    ) {

        throw new Error(
            result.error.message ||
            "Cloudinary upload failed."
        );

    }


    if (
        !result.secure_url
    ) {

        throw new Error(
            "Image URL was not received."
        );

    }


    return result.secure_url;

}


// =========================================
// ADD / UPDATE
// =========================================

if (galleryForm) {

    galleryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // =================================
            // VALUES
            // =================================

            const title =
                galleryTitle
                    ? galleryTitle.value.trim()
                    : "";


            const caption =
                galleryCaption
                    ? galleryCaption.value.trim()
                    : "";


            const file =
                galleryImage &&
                    galleryImage.files
                    ? galleryImage.files[0]
                    : null;


            // =================================
            // VALIDATION
            // =================================

            if (!title) {

                alert(
                    "Please enter image title."
                );

                galleryTitle.focus();

                return;

            }


            // =================================
            // ADD MODE
            // =================================

            if (
                editingGalleryId === null &&
                !file
            ) {

                alert(
                    "Please select an image."
                );

                galleryImage.focus();

                return;

            }


            // =================================
            // BUTTON LOADING
            // =================================

            if (uploadGalleryBtn) {

                uploadGalleryBtn.disabled =
                    true;


                uploadGalleryBtn.innerHTML = `

                    <i class="fas fa-spinner fa-spin"></i>

                    ${editingGalleryId
                        ? "Updating..."
                        : "Uploading..."
                    }

                `;

            }


            try {

                // =================================
                // IMAGE URL
                // =================================

                let imageUrl =
                    oldImageUrl;


                // =================================
                // NEW IMAGE
                // =================================

                if (file) {

                    imageUrl =
                        await uploadImage(
                            file
                        );

                }


                // =================================
                // UPDATE
                // =================================

                if (
                    editingGalleryId !== null
                ) {

                    await updateDoc(

                        doc(
                            db,
                            "gallery",
                            editingGalleryId
                        ),

                        {

                            title:
                                title,

                            caption:
                                caption,

                            image:
                                imageUrl,

                            updatedAt:
                                new Date()

                        }

                    );


                    alert(
                        "Gallery image updated successfully."
                    );

                }


                // =================================
                // ADD
                // =================================

                else {

                    await addDoc(

                        collection(
                            db,
                            "gallery"
                        ),

                        {

                            title:
                                title,

                            caption:
                                caption,

                            image:
                                imageUrl,

                            createdAt:
                                new Date()

                        }

                    );


                    alert(
                        "Gallery image uploaded successfully."
                    );

                }


                // =================================
                // RESET
                // =================================

                resetGalleryForm();


                // =================================
                // RELOAD
                // =================================

                await loadGallery();

            }

            catch (error) {

                console.error(
                    "Gallery Save Error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to save gallery image."
                );

            }


            finally {

                if (uploadGalleryBtn) {

                    uploadGalleryBtn.disabled =
                        false;

                }

            }

        }
    );

}


// =========================================
// LOAD GALLERY
// =========================================

async function loadGallery() {

    if (!galleryList) {

        return;

    }


    galleryList.innerHTML = `

        <div class="gallery-loading">

            <i class="fas fa-spinner fa-spin"></i>

            <p>
                Loading gallery...
            </p>

        </div>

    `;


    try {


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
            (galleryDoc) => {

                galleryItems.push({

                    id:
                        galleryDoc.id,

                    ...galleryDoc.data()

                });

            }
        );


        updateGalleryCount();


        renderGallery(
            galleryItems
        );


    }

    catch (error) {

        console.error(
            "Load Gallery Error:",
            error
        );


        galleryList.innerHTML = `

            <div class="gallery-error">

                <i class="fas fa-circle-exclamation"></i>

                <h3>
                    Unable to load gallery
                </h3>

                <p>
                    Please check your internet connection.
                </p>

            </div>

        `;

    }

}


// =========================================
// RENDER GALLERY
// =========================================

function renderGallery(
    data
) {

    if (!galleryList) {

        return;

    }


    // =================================
    // EMPTY
    // =================================

    if (
        data.length === 0
    ) {

        galleryList.innerHTML = `

            <div class="gallery-empty">

                <div class="gallery-empty-icon">

                    <i class="fas fa-images"></i>

                </div>

                <h3>
                    No Images Found
                </h3>

                <p>
                    Add your first gallery image above.
                </p>

            </div>

        `;

        return;

    }


    // =================================
    // CLEAR
    // =================================

    galleryList.innerHTML =
        "";


    // =================================
    // CARDS
    // =================================

    data.forEach(
        (item) => {

            createGalleryCard(
                item
            );

        }
    );

}


// =========================================
// CREATE CARD
// =========================================

function createGalleryCard(
    item
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "gallery-admin-card";


    // =================================
    // IMAGE
    // =================================

    const image =
        document.createElement(
            "img"
        );


    image.src =
        item.image ||
        "../assets/images/logo.png";


    image.alt =
        item.title ||
        "Gallery Image";


    image.loading =
        "lazy";


    image.onerror =
        function () {

            this.onerror =
                null;

            this.src =
                "../assets/images/logo.png";

        };


    // =================================
    // CONTENT
    // =================================

    const content =
        document.createElement(
            "div"
        );


    content.className =
        "gallery-admin-card-content";


    // =================================
    // TITLE
    // =================================

    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        item.title ||
        "Untitled Image";


    // =================================
    // CAPTION
    // =================================

    const caption =
        document.createElement(
            "p"
        );


    caption.textContent =
        item.caption ||
        "No caption added.";


    caption.className =
        "gallery-card-caption";


    // =================================
    // ACTIONS
    // =================================

    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "gallery-card-actions";


    // =================================
    // EDIT BUTTON
    // =================================

    const editButton =
        document.createElement(
            "button"
        );


    editButton.type =
        "button";


    editButton.className =
        "admin-btn gallery-edit-btn";


    editButton.innerHTML = `

        <i class="fas fa-pen"></i>

        Edit

    `;


    editButton.addEventListener(
        "click",
        () => {

            editGalleryItem(
                item
            );

        }
    );


    // =================================
    // DELETE BUTTON
    // =================================

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.type =
        "button";


    deleteButton.className =
        "admin-btn gallery-delete-btn";


    deleteButton.innerHTML = `

        <i class="fas fa-trash"></i>

        Delete

    `;


    deleteButton.addEventListener(
        "click",
        () => {

            deleteGalleryItem(
                item.id,
                item.title
            );

        }
    );


    // =================================
    // APPEND
    // =================================

    actions.appendChild(
        editButton
    );


    actions.appendChild(
        deleteButton
    );


    content.appendChild(
        title
    );


    content.appendChild(
        caption
    );


    content.appendChild(
        actions
    );


    card.appendChild(
        image
    );


    card.appendChild(
        content
    );


    galleryList.appendChild(
        card
    );

}


// =========================================
// EDIT
// =========================================

function editGalleryItem(
    item
) {

    editingGalleryId =
        item.id;


    oldImageUrl =
        item.image ||
        "";


    // =================================
    // FORM VALUES
    // =================================

    if (galleryTitle) {

        galleryTitle.value =
            item.title ||
            "";

    }


    if (galleryCaption) {

        galleryCaption.value =
            item.caption ||
            "";

    }


    // =================================
    // OLD IMAGE PREVIEW
    // =================================

    if (
        item.image
    ) {

        showPreview(
            item.image
        );

    }


    // =================================
    // FORM TEXT
    // =================================

    if (galleryFormTitle) {

        galleryFormTitle.textContent =
            "Edit Gallery Image";

    }


    if (galleryFormSubtitle) {

        galleryFormSubtitle.textContent =
            "Update title, caption or replace the image.";

    }


    // =================================
    // BUTTON
    // =================================

    if (uploadGalleryBtn) {

        uploadGalleryBtn.innerHTML = `

            <i class="fas fa-save"></i>

            Update Image

        `;

    }


    // =================================
    // CANCEL
    // =================================

    if (cancelGalleryEditBtn) {

        cancelGalleryEditBtn.style.display =
            "inline-flex";

    }


    // =================================
    // SCROLL TO FORM
    // =================================

    const formCard =
        document.querySelector(
            ".gallery-form-card"
        );


    if (formCard) {

        formCard.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

}


// =========================================
// CANCEL EDIT
// =========================================

if (cancelGalleryEditBtn) {

    cancelGalleryEditBtn.addEventListener(
        "click",
        () => {

            resetGalleryForm();

        }
    );

}


// =========================================
// RESET FORM
// =========================================

function resetGalleryForm() {

    if (galleryForm) {

        galleryForm.reset();

    }


    editingGalleryId =
        null;


    oldImageUrl =
        "";


    hidePreview();


    if (galleryFormTitle) {

        galleryFormTitle.textContent =
            "Add Gallery Image";

    }


    if (galleryFormSubtitle) {

        galleryFormSubtitle.textContent =
            "Add a new image to the club gallery.";

    }


    if (uploadGalleryBtn) {

        uploadGalleryBtn.innerHTML = `

            <i class="fas fa-cloud-arrow-up"></i>

            Upload Image

        `;

    }


    if (cancelGalleryEditBtn) {

        cancelGalleryEditBtn.style.display =
            "none";

    }

}


// =========================================
// DELETE
// =========================================

async function deleteGalleryItem(
    id,
    title
) {


    const confirmed =
        confirm(

            `Are you sure you want to delete "${title || "this image"}"?`

        );


    if (!confirmed) {

        return;

    }


    try {


        await deleteDoc(

            doc(
                db,
                "gallery",
                id
            )

        );


        alert(
            "Gallery image deleted successfully."
        );


        // =================================
        // IF EDITING DELETED IMAGE
        // =================================

        if (
            editingGalleryId === id
        ) {

            resetGalleryForm();

        }


        await loadGallery();


    }

    catch (error) {

        console.error(
            "Delete Gallery Error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete image."
        );

    }

}


// =========================================
// SEARCH
// =========================================

if (gallerySearch) {

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
// COUNT
// =========================================

function updateGalleryCount() {

    if (!galleryCount) {

        return;

    }


    const count =
        galleryItems.length;


    galleryCount.textContent =

        `${count} ${count === 1
            ? "Image"
            : "Images"
        }`;

}


// =========================================
// START
// =========================================

loadGallery();