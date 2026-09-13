/* =========================================
   SKL YUVA CLUB
   PUBLIC MEMBER ID CARD LOOKUP
   Approved membership applications only
========================================= */

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const lookupForm = document.getElementById("idCardLookupForm");
const phoneInput = document.getElementById("idCardPhone");
const dobInput = document.getElementById("idCardDob");
const lookupBtn = document.getElementById("idCardLookupBtn");
const message = document.getElementById("idCardMessage");
const result = document.getElementById("idCardResult");

function showMessage(text, type = "error") {
    if (!message) return;
    message.className = `id-card-message ${type}`;
    message.textContent = text;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDob(value) {
    if (!value) return "—";
    const parts = String(value).split("-");
    if (parts.length !== 3) return value;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function makeMembershipId(docId) {
    const clean = String(docId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return `SKL-${clean.slice(-8) || "MEMBER"}`;
}

let matchedCardName = "SKL-Member";

function waitForImages(container) {
    const images = Array.from(container.querySelectorAll("img"));
    return Promise.all(images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
        });
    }));
}

function printCard() {
    const card = document.getElementById("printableIdCard");
    if (!card) {
        showMessage("ID card is not available to print.");
        return;
    }

    // Print directly from the current page. This avoids about:blank popup
    // windows being blocked by Android/mobile browsers. The @media print
    // CSS in id-card.css hides the rest of the page and prints only the card.
    setTimeout(() => {
        window.print();
    }, 50);
}

function renderCard(application) {
    matchedCardName = application.name || "SKL-Member";
    const photo = application.photo || application.imageUrl || "assets/images/logo.webp";
    const membershipId = application.membershipId || makeMembershipId(application.id);

    result.innerHTML = `
        <div class="member-id-card" id="printableIdCard">
            <div class="member-id-card-top">
                <div class="member-id-brand">
                    <img src="assets/images/logo.webp" alt="SKL Yuva Club Logo">
                    <div>
                        <strong>SKL YUVA CLUB</strong>
                        <span>Ekta • Seva • Samarpan</span>
                    </div>
                </div>
                <div class="member-id-label">MEMBERSHIP ID CARD</div>
            </div>

            <div class="member-id-card-body">
                <div class="member-id-photo-wrap">
                    <img src="${escapeHTML(photo)}" alt="Member Photo" class="member-id-photo" onerror="this.onerror=null;this.src='assets/images/logo.webp';">
                </div>
                <div class="member-id-details">
                    <h3>${escapeHTML(application.name || "SKL Member")}</h3>
                    <p><span>Membership ID</span><strong>${escapeHTML(membershipId)}</strong></p>
                    <p><span>Date of Birth</span><strong>${escapeHTML(formatDob(application.dob))}</strong></p>
                    <p><span>Mobile</span><strong>${escapeHTML(application.phone || application.mobile || "—")}</strong></p>
                    <p><span>Occupation</span><strong>${escapeHTML(application.occupation || "Member")}</strong></p>
                </div>
            </div>

            <div class="member-id-card-bottom">
                <span>Community Member</span>
                <span>Approved Member</span>
            </div>
        </div>

        <div class="id-card-actions">
            <button type="button" class="btn btn-primary id-card-print-btn" id="printIdCardBtn">
                <i class="fas fa-print"></i> Print ID Card
            </button>
            <button type="button" class="btn btn-primary id-card-pdf-btn" id="downloadIdCardPdfBtn">
                <i class="fas fa-file-pdf"></i> Download PDF
            </button>
        </div>
    `;

    const printBtn = document.getElementById("printIdCardBtn");
    if (printBtn) printBtn.addEventListener("click", printCard);

    const pdfBtn = document.getElementById("downloadIdCardPdfBtn");
    if (pdfBtn) {
        pdfBtn.addEventListener("click", () => {
            const card = document.getElementById("printableIdCard");
            if (!card) {
                showMessage("ID card is not available to download.");
                return;
            }

            // Use the browser's native print dialog. On Android/Chrome the
            // user can choose "Save as PDF". No popup or external PDF library
            // is required, so about:blank/popup blocking cannot break it.
            showMessage("Print screen is opening. Choose 'Save as PDF' to download the ID card.", "success");
            setTimeout(() => {
                window.print();
            }, 50);
        });
    }
}

if (phoneInput) {
    phoneInput.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 10);
    });
}

if (lookupForm) {
    lookupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const phone = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";
        const dob = dobInput ? dobInput.value : "";

        if (phone.length !== 10) {
            showMessage("Please enter your registered 10 digit mobile number.");
            return;
        }
        if (!dob) {
            showMessage("Please enter your date of birth.");
            return;
        }

        showMessage("", "");
        if (result) result.innerHTML = "";
        if (lookupBtn) {
            lookupBtn.disabled = true;
            lookupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        }

        try {
            // Lookup is restricted to the registered mobile number.
            // DOB and approval status are verified before displaying any card.
            // Query only approved applications so the Firestore security rule
            // can safely authorize the public query. We then verify the
            // registered mobile number and DOB locally. This also avoids
            // requiring a new composite Firestore index.
            const memberQuery = query(
                collection(db, "joinApplications"),
                where("status", "==", "approved")
            );
            const snapshot = await getDocs(memberQuery);

            let matched = null;
            snapshot.forEach((docSnap) => {
                const data = docSnap.data() || {};
                const savedPhone = String(data.phone || data.mobile || "").replace(/\D/g, "");
                if (
                    !matched &&
                    String(data.status || "").toLowerCase() === "approved" &&
                    savedPhone === phone &&
                    String(data.dob || "") === dob
                ) {
                    matched = { id: docSnap.id, ...data };
                }
            });

            if (!matched) {
                showMessage("No approved membership found for this mobile number and date of birth.");
                return;
            }

            showMessage("ID card found successfully.", "success");
            renderCard(matched);
        } catch (error) {
            console.error("ID Card Lookup Error:", error);
            showMessage("Unable to find the ID card right now. Please try again later.");
        } finally {
            if (lookupBtn) {
                lookupBtn.disabled = false;
                lookupBtn.innerHTML = '<i class="fas fa-id-card"></i> Find My ID Card';
            }
        }
    });
}
