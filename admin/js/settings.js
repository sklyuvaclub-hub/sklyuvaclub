import { auth, db } from "../../assets/js/firebase.js";
import { onAuthStateChanged, signOut } from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
    doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const settingsRef = doc(db, "settings", "site");
const form = document.getElementById("settingsForm");
const saveBtn = document.getElementById("saveSettingsBtn");

const fields = [
    "clubName","clubDescription","clubAddress","googleMapsLink",
    "clubPhone","clubEmail","whatsappNumber","footerText",
    "facebook","instagram","youtube","logoUrl","websiteStatus"
];

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    await loadSettings();
});

async function loadSettings() {
    try {
        const snap = await getDoc(settingsRef);
        if (!snap.exists()) return;
        const data = snap.data();
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el && data[id] != null) el.value = data[id];
        });
        updateLogoPreview();
    } catch (error) {
        console.error("Settings load error:", error);
        alert("Unable to load settings.\n\n" + error.message);
    }
}

form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        const data = {};
        fields.forEach(id => {
            const el = document.getElementById(id);
            data[id] = el ? el.value.trim() : "";
        });
        data.updatedAt = serverTimestamp();
        await setDoc(settingsRef, data, { merge: true });
        updateLogoPreview();
        alert("Settings saved successfully.");
    } catch (error) {
        console.error("Settings save error:", error);
        alert("Unable to save settings.\n\n" + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
    }
});

function updateLogoPreview() {
    const url = document.getElementById("logoUrl")?.value.trim();
    const preview = document.getElementById("logoPreview");
    if (preview && url) preview.src = url;
}
document.getElementById("logoUrl")?.addEventListener("input", updateLogoPreview);

document.getElementById("logoutBtn")?.addEventListener("click", async (event) => {
    event.preventDefault();
    await signOut(auth);
    window.location.href = "index.html";
});
