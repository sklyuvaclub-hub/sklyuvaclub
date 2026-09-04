import { auth, db } from "../../assets/js/firebase.js";

import { onAuthStateChanged, signOut } from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const CLOUD_NAME = "shrhhsz0";
const UPLOAD_PRESET = "skl_gallery";

const heroForm = document.getElementById("heroForm");
const heroTableBody = document.getElementById("heroTableBody");
const addHeroBtn = document.getElementById("addHeroBtn");
const heroModal = document.getElementById("heroModal");
const closeHeroModal = document.getElementById("closeHeroModal");
const cancelHeroBtn = document.getElementById("cancelHeroBtn");
const saveHeroBtn = document.getElementById("saveHeroBtn");
const heroModalTitle = document.getElementById("heroModalTitle");
const heroImage = document.getElementById("heroImage");
const heroImagePreview = document.getElementById("heroImagePreview");
const heroSearch = document.getElementById("heroSearch");
const heroFilter = document.getElementById("heroFilter");

let heroSlides = [];
let editingHeroId = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    await loadHeroSlides();
});

async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    const result = await response.json();

    if (result.error) {
        throw new Error(result.error.message || "Image upload failed.");
    }
    if (!result.secure_url) {
        throw new Error("Image URL was not received.");
    }

    return result.secure_url;
}

if (heroImage) {
    heroImage.addEventListener("change", () => {
        const file = heroImage.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            heroImage.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("Image size must be less than 10 MB.");
            heroImage.value = "";
            return;
        }

        const url = URL.createObjectURL(file);
        heroImagePreview.innerHTML = `<img src="${url}" alt="Preview">`;
    });
}

async function loadHeroSlides() {
    try {
        const snapshot = await getDocs(collection(db, "heroSlides"));
        heroSlides = [];
        snapshot.forEach((item) => heroSlides.push({ id: item.id, ...item.data() }));
        heroSlides.sort((a,b) => Number(a.order || 0) - Number(b.order || 0));
        renderHeroSlides();
    } catch (error) {
        console.error("Hero load error:", error);
        heroTableBody.innerHTML = `<tr><td colspan="5" class="table-loading">Unable to load slides.</td></tr>`;
    }
}

function renderHeroSlides() {
    const search = (heroSearch?.value || "").trim().toLowerCase();
    const filter = heroFilter?.value || "all";

    let items = heroSlides.filter((slide) => {
        const text = `${slide.title || ""} ${slide.description || ""}`.toLowerCase();
        const statusOk = filter === "all" || (slide.status || "active") === filter;
        return statusOk && (!search || text.includes(search));
    });

    if (!items.length) {
        heroTableBody.innerHTML = `<tr><td colspan="5" class="table-loading">No hero slides found.</td></tr>`;
        return;
    }

    heroTableBody.innerHTML = items.map((slide) => {
        const status = slide.status || "active";
        return `
        <tr>
            <td><img class="hero-current-image" src="${escapeHtml(slide.imageUrl || "")}" alt="Hero"></td>
            <td><strong>${escapeHtml(slide.title || "Untitled")}</strong></td>
            <td>${Number(slide.order || 1)}</td>
            <td><span class="status-badge ${status === "active" ? "status-active" : "status-inactive"}">${status === "active" ? "Active" : "Inactive"}</span></td>
            <td>
                <div class="table-actions">
                    <button type="button" class="admin-action-btn edit" data-action="edit" data-id="${slide.id}" title="Edit"><i class="fas fa-pen"></i></button>
                    <button type="button" class="admin-action-btn toggle" data-action="toggle" data-id="${slide.id}" title="Toggle"><i class="fas ${status === "active" ? "fa-eye-slash" : "fa-eye"}"></i></button>
                    <button type="button" class="admin-action-btn delete" data-action="delete" data-id="${slide.id}" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

function escapeHtml(value) {
    return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;")
        .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function openModal() {
    heroModal.classList.add("active");
}

function closeModal() {
    heroModal.classList.remove("active");
    heroForm.reset();
    editingHeroId = null;
    heroModalTitle.textContent = "Add Hero Slide";
    saveHeroBtn.innerHTML = '<i class="fas fa-save"></i> Save Slide';
    heroImagePreview.innerHTML = '<div><i class="fas fa-image"></i><span>Image Preview</span></div>';
}

addHeroBtn?.addEventListener("click", () => {
    heroForm.reset();
    editingHeroId = null;
    heroModalTitle.textContent = "Add Hero Slide";
    saveHeroBtn.innerHTML = '<i class="fas fa-save"></i> Save Slide';
    document.getElementById("heroOrder").value =
        heroSlides.length ? Math.max(...heroSlides.map(x => Number(x.order || 0))) + 1 : 1;
    document.getElementById("heroStatus").value = "active";
    heroImagePreview.innerHTML = '<div><i class="fas fa-image"></i><span>Image Preview</span></div>';
    openModal();
});

closeHeroModal?.addEventListener("click", closeModal);
cancelHeroBtn?.addEventListener("click", closeModal);
heroModal?.addEventListener("click", e => { if (e.target === heroModal) closeModal(); });

heroForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("heroTitle").value.trim();
    const description = document.getElementById("heroDescription").value.trim();
    const buttonText = document.getElementById("heroButtonText").value.trim();
    const buttonLink = document.getElementById("heroButtonLink").value.trim();
    const order = Number(document.getElementById("heroOrder").value || 1);
    const status = document.getElementById("heroStatus").value;
    const file = heroImage.files[0];

    if (!title) return alert("Please enter slide title.");
    if (!editingHeroId && !file) return alert("Please select a hero image.");
    if (!Number.isFinite(order) || order < 1) return alert("Display order must be 1 or greater.");

    saveHeroBtn.disabled = true;
    saveHeroBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        let imageUrl = null;
        if (file) imageUrl = await uploadImage(file);

        const data = {
            title, description, buttonText, buttonLink, order, status,
            updatedAt: serverTimestamp()
        };

        if (!editingHeroId) {
            data.imageUrl = imageUrl;
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "heroSlides"), data);
            alert("Hero slide added successfully.");
        } else {
            if (file) data.imageUrl = imageUrl;
            await updateDoc(doc(db, "heroSlides", editingHeroId), data);
            alert("Hero slide updated successfully.");
        }

        closeModal();
        await loadHeroSlides();
    } catch (error) {
        console.error("Hero save error:", error);
        alert("Unable to save hero slide.\n\n" + error.message);
    } finally {
        saveHeroBtn.disabled = false;
        saveHeroBtn.innerHTML = editingHeroId
            ? '<i class="fas fa-save"></i> Update Slide'
            : '<i class="fas fa-save"></i> Save Slide';
    }
});

heroTableBody?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        const slide = heroSlides.find(x => x.id === id);
        if (!slide) return;

        editingHeroId = id;
        heroModalTitle.textContent = "Edit Hero Slide";
        document.getElementById("heroTitle").value = slide.title || "";
        document.getElementById("heroDescription").value = slide.description || "";
        document.getElementById("heroButtonText").value = slide.buttonText || "";
        document.getElementById("heroButtonLink").value = slide.buttonLink || "";
        document.getElementById("heroOrder").value = slide.order || 1;
        document.getElementById("heroStatus").value = slide.status || "active";
        heroImage.value = "";

        if (slide.imageUrl) heroImagePreview.innerHTML = `<img src="${escapeHtml(slide.imageUrl)}" alt="Current image">`;

        saveHeroBtn.innerHTML = '<i class="fas fa-save"></i> Update Slide';
        openModal();
    }

    if (action === "toggle") {
        const slide = heroSlides.find(x => x.id === id);
        if (!slide) return;
        await updateDoc(doc(db, "heroSlides", id), {
            status: (slide.status || "active") === "active" ? "inactive" : "active",
            updatedAt: serverTimestamp()
        });
        await loadHeroSlides();
    }

    if (action === "delete") {
        const slide = heroSlides.find(x => x.id === id);
        if (!slide) return;
        if (!confirm(`Delete "${slide.title || "this slide"}"?`)) return;

        await deleteDoc(doc(db, "heroSlides", id));
        await loadHeroSlides();
        alert("Hero slide deleted successfully.");
    }
});

heroSearch?.addEventListener("input", renderHeroSlides);
heroFilter?.addEventListener("change", renderHeroSlides);

document.getElementById("logoutBtn")?.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        alert("Logout failed.\n\n" + error.message);
    }
});
