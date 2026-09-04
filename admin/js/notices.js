/* =========================================
   SKL YUVA CLUB
   ADMIN NOTICES
   FIRESTORE
========================================= */

// =========================================
// FIREBASE
// =========================================

import { db } from "../../assets/js/firebase.js";

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

const noticeModal =
    document.getElementById("noticeModal");

const noticeForm =
    document.getElementById("noticeForm");

const addNoticeBtn =
    document.getElementById("addNoticeBtn");

const closeNoticeModal =
    document.getElementById("closeNoticeModal");

const cancelNoticeBtn =
    document.getElementById("cancelNoticeBtn");

const saveNoticeBtn =
    document.getElementById("saveNoticeBtn");

const modalTitle =
    document.getElementById("modalTitle");

const noticeTitle =
    document.getElementById("noticeTitle");

const noticeDescription =
    document.getElementById("noticeDescription");

const noticeDate =
    document.getElementById("noticeDate");

const noticePriority =
    document.getElementById("noticePriority");

const noticesTableBody =
    document.getElementById("noticesTableBody");

const noticeSearch =
    document.getElementById("noticeSearch");

const noticeFilter =
    document.getElementById("noticeFilter");

const logoutBtn =
    document.getElementById("logoutBtn");

const blogModal = document.getElementById("blogModal");
const blogForm = document.getElementById("blogForm");
const addBlogBtn = document.getElementById("addBlogBtn");
const closeBlogModal = document.getElementById("closeBlogModal");
const cancelBlogBtn = document.getElementById("cancelBlogBtn");
const blogModalTitle = document.getElementById("blogModalTitle");
const blogTitle = document.getElementById("blogTitle");
const blogImage = document.getElementById("blogImage");
const blogContent = document.getElementById("blogContent");
const blogDate = document.getElementById("blogDate");
const blogAuthor = document.getElementById("blogAuthor");
const blogOrder = document.getElementById("blogOrder");
const blogStatus = document.getElementById("blogStatus");
const blogsTableBody = document.getElementById("blogsTableBody");


// =========================================
// VARIABLES
// =========================================

let notices = [];

let editingNoticeId = null;
let blogs = [];
let editingBlogId = null;


// =========================================
// LOAD NOTICES
// =========================================

async function loadNotices() {

    if (!noticesTableBody) {
        return;
    }

    noticesTableBody.innerHTML = `
        <tr>
            <td colspan="4" class="table-loading">

                <i class="fas fa-spinner fa-spin"></i>

                Loading notices...

            </td>
        </tr>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "notices"
                )
            );


        notices = [];


        snapshot.forEach(
            (docSnap) => {

                notices.push({

                    id: docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        // =================================
        // SORT LATEST DATE FIRST
        // =================================

        notices.sort(
            (a, b) => {

                const dateA =
                    String(
                        a.date || ""
                    );

                const dateB =
                    String(
                        b.date || ""
                    );

                return dateB.localeCompare(
                    dateA
                );

            }
        );


        applyFilters();


    } catch (error) {

        console.error(
            "Load Notices Error:",
            error
        );


        noticesTableBody.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="table-loading"
                >

                    <i class="fas fa-circle-exclamation"></i>

                    Unable to load notices.

                </td>

            </tr>
        `;

    }

}


// =========================================
// APPLY SEARCH + FILTER
// =========================================

function applyFilters() {

    const searchText =
        noticeSearch
            ? noticeSearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedFilter =
        noticeFilter
            ? noticeFilter.value
            : "all";


    const filteredNotices =
        notices.filter(
            (notice) => {

                const title =
                    String(
                        notice.title || ""
                    ).toLowerCase();


                const description =
                    String(
                        notice.description || ""
                    ).toLowerCase();


                const searchMatch =

                    !searchText

                    ||

                    title.includes(
                        searchText
                    )

                    ||

                    description.includes(
                        searchText
                    );


                const priorityMatch =

                    selectedFilter ===
                    "all"

                    ||

                    String(
                        notice.priority ||
                        "normal"
                    ) ===
                    selectedFilter;


                return (
                    searchMatch &&
                    priorityMatch
                );

            }
        );


    renderNotices(
        filteredNotices
    );

}


// =========================================
// RENDER NOTICES
// =========================================

function renderNotices(data) {

    if (!noticesTableBody) {
        return;
    }


    // =================================
    // NO NOTICES
    // =================================

    if (data.length === 0) {

        noticesTableBody.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        padding:40px;
                    "
                >

                    <i
                        class="fas fa-bullhorn"
                        style="
                            font-size:32px;
                            margin-bottom:10px;
                        "
                    ></i>

                    <br>

                    <strong>
                        No Notices Found
                    </strong>

                    <p>
                        Add a new notice to display it here.
                    </p>

                </td>

            </tr>
        `;

        return;

    }


    noticesTableBody.innerHTML = "";


    data.forEach(
        (notice) => {

            const row =
                document.createElement(
                    "tr"
                );


            // =================================
            // NOTICE CELL
            // =================================

            const noticeCell =
                document.createElement(
                    "td"
                );


            noticeCell.innerHTML = `
                <div
                    style="
                        display:flex;
                        align-items:flex-start;
                        gap:12px;
                    "
                >

                    <div
                        style="
                            width:42px;
                            height:42px;
                            min-width:42px;
                            border-radius:10px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:rgba(255,193,7,0.12);
                        "
                    >

                        <i class="fas fa-bullhorn"></i>

                    </div>


                    <div>

                        <strong>
                            ${escapeHTML(
                notice.title ||
                "Untitled Notice"
            )}
                        </strong>


                        <div
                            style="
                                margin-top:4px;
                                font-size:13px;
                                opacity:.7;
                            "
                        >

                            ${escapeHTML(
                notice.description ||
                ""
            )}

                        </div>

                    </div>

                </div>
            `;


            row.appendChild(
                noticeCell
            );


            // =================================
            // DATE CELL
            // =================================

            const dateCell =
                document.createElement(
                    "td"
                );


            dateCell.textContent =
                formatDate(
                    notice.date
                );


            row.appendChild(
                dateCell
            );


            // =================================
            // PRIORITY CELL
            // =================================

            const priorityCell =
                document.createElement(
                    "td"
                );


            const priority =
                notice.priority ||
                "normal";


            const priorityBadge =
                document.createElement(
                    "span"
                );


            priorityBadge.style.cssText = `
                display:inline-flex;
                align-items:center;
                gap:6px;
                padding:6px 10px;
                border-radius:20px;
                font-size:12px;
                font-weight:600;
            `;


            if (
                priority ===
                "important"
            ) {

                priorityBadge.style.background =
                    "rgba(220,53,69,0.12)";

                priorityBadge.style.color =
                    "#dc3545";

                priorityBadge.innerHTML = `
                    <i class="fas fa-circle-exclamation"></i>
                    Important
                `;

            } else {

                priorityBadge.style.background =
                    "rgba(25,135,84,0.12)";

                priorityBadge.style.color =
                    "#198754";

                priorityBadge.innerHTML = `
                    <i class="fas fa-circle-check"></i>
                    Normal
                `;

            }


            priorityCell.appendChild(
                priorityBadge
            );


            row.appendChild(
                priorityCell
            );


            // =================================
            // ACTIONS CELL
            // =================================

            const actionsCell =
                document.createElement(
                    "td"
                );


            actionsCell.style.whiteSpace =
                "nowrap";


            // EDIT BUTTON

            const editBtn =
                document.createElement(
                    "button"
                );


            editBtn.type =
                "button";


            editBtn.className =
                "admin-btn admin-btn-secondary";


            editBtn.style.marginRight =
                "6px";


            editBtn.innerHTML = `
                <i class="fas fa-pen"></i>
            `;


            editBtn.title =
                "Edit Notice";


            editBtn.addEventListener(
                "click",
                () => {

                    openEditModal(
                        notice
                    );

                }
            );


            // DELETE BUTTON

            const deleteBtn =
                document.createElement(
                    "button"
                );


            deleteBtn.type =
                "button";


            deleteBtn.className =
                "admin-btn admin-btn-danger";


            deleteBtn.innerHTML = `
                <i class="fas fa-trash"></i>
            `;


            deleteBtn.title =
                "Delete Notice";


            deleteBtn.addEventListener(
                "click",
                () => {

                    deleteNotice(
                        notice.id
                    );

                }
            );


            actionsCell.appendChild(
                editBtn
            );


            actionsCell.appendChild(
                deleteBtn
            );


            row.appendChild(
                actionsCell
            );


            noticesTableBody.appendChild(
                row
            );

        }
    );

}


// =========================================
// OPEN ADD MODAL
// =========================================

function openAddModal() {

    editingNoticeId =
        null;


    if (noticeForm) {
        noticeForm.reset();
    }


    if (noticePriority) {

        noticePriority.value =
            "normal";

    }


    if (modalTitle) {

        modalTitle.textContent =
            "Add Notice";

    }


    if (saveNoticeBtn) {

        saveNoticeBtn.innerHTML = `
            <i class="fas fa-save"></i>
            Save Notice
        `;

    }


    openModal();

}


// =========================================
// OPEN EDIT MODAL
// =========================================

function openEditModal(notice) {

    if (!noticeModal) {
        return;
    }


    editingNoticeId =
        notice.id;


    if (modalTitle) {

        modalTitle.textContent =
            "Edit Notice";

    }


    if (noticeTitle) {

        noticeTitle.value =
            notice.title ||
            "";

    }


    if (noticeDescription) {

        noticeDescription.value =
            notice.description ||
            "";

    }


    if (noticeDate) {

        noticeDate.value =
            notice.date ||
            "";

    }


    if (noticePriority) {

        noticePriority.value =
            notice.priority ||
            "normal";

    }


    if (saveNoticeBtn) {

        saveNoticeBtn.innerHTML = `
            <i class="fas fa-save"></i>
            Update Notice
        `;

    }


    openModal();

}


// =========================================
// OPEN MODAL
// =========================================

function openModal() {

    if (!noticeModal) {
        return;
    }


    noticeModal.classList.add(
        "active"
    );

}


// =========================================
// CLOSE MODAL
// =========================================

function closeModal() {

    if (!noticeModal) {
        return;
    }


    noticeModal.classList.remove(
        "active"
    );


    editingNoticeId =
        null;


    if (noticeForm) {

        noticeForm.reset();

    }


    if (noticePriority) {

        noticePriority.value =
            "normal";

    }


    if (modalTitle) {

        modalTitle.textContent =
            "Add Notice";

    }


    if (saveNoticeBtn) {

        saveNoticeBtn.innerHTML = `
            <i class="fas fa-save"></i>
            Save Notice
        `;

    }

}


// =========================================
// SAVE NOTICE
// =========================================

async function saveNotice(event) {

    event.preventDefault();


    // =================================
    // GET VALUES
    // =================================

    const title =
        noticeTitle
            ? noticeTitle.value.trim()
            : "";


    const description =
        noticeDescription
            ? noticeDescription.value.trim()
            : "";


    const date =
        noticeDate
            ? noticeDate.value
            : "";


    const priority =
        noticePriority
            ? noticePriority.value
            : "normal";


    // =================================
    // VALIDATION
    // =================================

    if (!title) {

        alert(
            "Please enter notice title."
        );

        if (noticeTitle) {
            noticeTitle.focus();
        }

        return;

    }


    if (!description) {

        alert(
            "Please enter notice description."
        );

        if (noticeDescription) {
            noticeDescription.focus();
        }

        return;

    }


    if (!date) {

        alert(
            "Please select notice date."
        );

        if (noticeDate) {
            noticeDate.focus();
        }

        return;

    }


    // =================================
    // BUTTON LOADING
    // =================================

    if (saveNoticeBtn) {

        saveNoticeBtn.disabled =
            true;


        saveNoticeBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Saving...
        `;

    }


    try {

        // =================================
        // EDIT
        // =================================

        if (editingNoticeId) {

            const noticeRef =
                doc(
                    db,
                    "notices",
                    editingNoticeId
                );


            await updateDoc(
                noticeRef,
                {

                    title:
                        title,

                    description:
                        description,

                    date:
                        date,

                    priority:
                        priority,

                    updatedAt:
                        serverTimestamp()

                }
            );


            alert(
                "Notice updated successfully."
            );

        }


        // =================================
        // ADD
        // =================================

        else {

            await addDoc(
                collection(
                    db,
                    "notices"
                ),
                {

                    title:
                        title,

                    description:
                        description,

                    date:
                        date,

                    priority:
                        priority,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


            alert(
                "Notice added successfully."
            );

        }


        // =================================
        // CLOSE
        // =================================

        closeModal();


        // =================================
        // RELOAD
        // =================================

        await loadNotices();
loadBlogs();


    } catch (error) {

        console.error(
            "Save Notice Error:",
            error
        );


        alert(
            "Unable to save notice.\n\n" +
            error.message
        );

    }


    finally {

        if (saveNoticeBtn) {

            saveNoticeBtn.disabled =
                false;

        }

    }

}


// =========================================
// DELETE NOTICE
// =========================================

async function deleteNotice(id) {

    const notice =
        notices.find(
            (item) =>
                item.id === id
        );


    if (!notice) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${notice.title || "this notice"}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "notices",
                id
            )
        );


        alert(
            "Notice deleted successfully."
        );


        await loadNotices();


    } catch (error) {

        console.error(
            "Delete Notice Error:",
            error
        );


        alert(
            "Unable to delete notice.\n\n" +
            error.message
        );

    }

}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    );

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
// SEARCH
// =========================================

if (noticeSearch) {

    noticeSearch.addEventListener(
        "input",
        applyFilters
    );

}


// =========================================
// FILTER
// =========================================

if (noticeFilter) {

    noticeFilter.addEventListener(
        "change",
        applyFilters
    );

}


// =========================================
// ADD NOTICE
// =========================================




// =========================================
// CLOSE BUTTON
// =========================================

if (closeNoticeModal) {

    closeNoticeModal.addEventListener(
        "click",
        closeModal
    );

}


// =========================================
// CANCEL BUTTON
// =========================================

if (cancelNoticeBtn) {

    cancelNoticeBtn.addEventListener(
        "click",
        closeModal
    );

}


// =========================================
// FORM SUBMIT
// =========================================

if (noticeForm) {

    noticeForm.addEventListener(
        "submit",
        saveNotice
    );

}


// =========================================
// CLOSE MODAL ON BACKDROP CLICK
// =========================================

if (noticeModal) {

    noticeModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                noticeModal
            ) {

                closeModal();

            }

        }
    );

}


// =========================================
// ESC KEY CLOSE
// =========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            noticeModal &&
            noticeModal.classList.contains(
                "active"
            )
        ) {

            closeModal();

        }

    }
);


// =========================================
// LOGOUT
// =========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


            window.location.href =
                "index.html";

        }
    );

}




// =========================================
// BLOG MANAGEMENT
// =========================================
const CLOUD_NAME = "shrhhsz0";
const UPLOAD_PRESET = "skl_gallery";

function openBlogModal(blog = null) {
    if (!blogModal || !blogForm) return;
    editingBlogId = blog ? blog.id : null;
    blogModalTitle.textContent = blog ? "Edit Blog" : "Add Blog";
    blogForm.reset();
    blogDate.value = blog?.date || new Date().toISOString().slice(0,10);
    blogOrder.value = blog?.order ?? 0;
    blogStatus.value = String(blog?.active !== false);
    blogTitle.value = blog?.title || "";
    blogContent.value = blog?.content || "";
    blogAuthor.value = blog?.author || "";
    blogModal.classList.add("active");
}
function closeBlog() { blogModal?.classList.remove("active"); editingBlogId = null; }

async function uploadBlogImage(file) {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok || !data.secure_url) throw new Error(data.error?.message || "Image upload failed");
    return data.secure_url;
}

async function loadBlogs() {
    if (!blogsTableBody) return;
    try {
        const snapshot = await getDocs(collection(db, "blogs"));
        blogs = []; snapshot.forEach(d => blogs.push({id:d.id, ...d.data()}));
        blogs.sort((a,b) => (Number(a.order??999999)-Number(b.order??999999)) || String(b.date||"").localeCompare(String(a.date||"")));
        renderBlogs();
    } catch (e) {
        console.error("Load Blogs Error:", e);
        blogsTableBody.innerHTML = `<tr><td colspan="5" class="table-loading">Unable to load blogs.</td></tr>`;
    }
}
function renderBlogs() {
    if (!blogsTableBody) return;
    if (!blogs.length) { blogsTableBody.innerHTML = `<tr><td colspan="5" class="table-loading">No blogs added yet.</td></tr>`; return; }
    blogsTableBody.innerHTML = blogs.map(b => `<tr><td><strong>${escapeHTML(b.title||"Untitled")}</strong></td><td>${escapeHTML(b.date||"")}</td><td>${Number(b.order??0)}</td><td>${b.active === false ? "Inactive" : "Active"}</td><td><button class="admin-btn admin-btn-secondary blog-edit" data-id="${b.id}"><i class="fas fa-pen"></i></button> <button class="admin-btn admin-btn-danger blog-delete" data-id="${b.id}"><i class="fas fa-trash"></i></button></td></tr>`).join("");
    blogsTableBody.querySelectorAll(".blog-edit").forEach(btn => btn.addEventListener("click", () => openBlogModal(blogs.find(b=>b.id===btn.dataset.id))));
    blogsTableBody.querySelectorAll(".blog-delete").forEach(btn => btn.addEventListener("click", async () => { if (!confirm("Delete this blog?")) return; await deleteDoc(doc(db,"blogs",btn.dataset.id)); await loadBlogs(); }));
}
async function saveBlog(event) {
    event.preventDefault();
    try {
        const imageUrl = await uploadBlogImage(blogImage?.files?.[0]);
        const payload = { title: blogTitle.value.trim(), content: blogContent.value.trim(), date: blogDate.value, author: blogAuthor.value.trim(), order: Number(blogOrder.value||0), active: blogStatus.value === "true" };
        if (imageUrl) payload.imageUrl = imageUrl;
        if (editingBlogId) await updateDoc(doc(db,"blogs",editingBlogId), payload);
        else { payload.createdAt = serverTimestamp(); await addDoc(collection(db,"blogs"), payload); }
        closeBlog(); await loadBlogs();
    } catch (e) { console.error("Save Blog Error:",e); alert(e.message || "Unable to save blog."); }
}
// =========================================
// BLOG UI EVENTS
// =========================================

function initBlogEvents() {
    const addBtn = document.getElementById("addBlogBtn");
    const closeBtn = document.getElementById("closeBlogModal");
    const cancelBtn = document.getElementById("cancelBlogBtn");
    const form = document.getElementById("blogForm");
    const modal = document.getElementById("blogModal");

    if (addBtn && !addBtn.dataset.blogBound) {
        addBtn.dataset.blogBound = "1";
        addBtn.addEventListener("click", (event) => {
            event.preventDefault();
            openBlogModal();
        });
    }

    if (closeBtn && !closeBtn.dataset.blogBound) {
        closeBtn.dataset.blogBound = "1";
        closeBtn.addEventListener("click", closeBlog);
    }

    if (cancelBtn && !cancelBtn.dataset.blogBound) {
        cancelBtn.dataset.blogBound = "1";
        cancelBtn.addEventListener("click", closeBlog);
    }

    if (form && !form.dataset.blogBound) {
        form.dataset.blogBound = "1";
        form.addEventListener("submit", saveBlog);
    }

    if (modal && !modal.dataset.blogBound) {
        modal.dataset.blogBound = "1";
        modal.addEventListener("click", (event) => {
            if (event.target === modal) closeBlog();
        });
    }
}

function initNoticeEvents() {
    const addBtn = document.getElementById("addNoticeBtn");
    if (addBtn && !addBtn.dataset.noticeBound) {
        addBtn.dataset.noticeBound = "1";
        addBtn.addEventListener("click", (event) => {
            event.preventDefault();
            openAddModal();
        });
    }
}

initNoticeEvents();
initBlogEvents();

// =========================================
// START
// =========================================

loadNotices();
loadBlogs();