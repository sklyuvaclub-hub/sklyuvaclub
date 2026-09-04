/* =========================================
   SKL YUVA CLUB
   ADMIN DASHBOARD
   FIREBASE
========================================= */

import {
    auth,
    db
} from "../../assets/js/firebase.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    collection,
    getDocs,
    onSnapshot,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================
// ELEMENTS
// =========================================

const totalMembers =
    document.getElementById("totalMembers");

const totalGallery =
    document.getElementById("totalGallery");

const totalEvents =
    document.getElementById("totalEvents");

const totalNotices =
    document.getElementById("totalNotices");

const logoutBtn =
    document.getElementById("logoutBtn");

const websiteBtn =
    document.getElementById("websiteBtn");

const birthdayReminders =
    document.getElementById("birthdayReminders");

const birthdayMonthList =
    document.getElementById("birthdayMonthList");


// =========================================
// CHECK ADMIN LOGIN
// =========================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "index.html";

            return;

        }


        console.log(
            "Admin logged in:",
            user.email
        );


        // Load dashboard data

        await loadDashboardData();
        startMemberCountListener();
        startBirthdayListener();

    }
);


// =========================================
// LOAD DASHBOARD DATA
// =========================================

async function loadDashboardData() {

    try {

        // =================================
        // MEMBERS
        // =================================

        const membersSnapshot =
            await getDocs(
                collection(db, "members")
            );


        if (totalMembers) {

            // Dashboard Members count must match Admin -> Members.
            // Membership-form approvals are stored in the same collection
            // with source: community_approved and must not be counted here.
            const adminMembersCount = membersSnapshot.docs.filter((docSnap) => {
                const data = docSnap.data() || {};
                return data.source !== "community_approved";
            }).length;

            totalMembers.textContent =
                adminMembersCount;

        }


        // =================================
        // GALLERY
        // =================================

        const gallerySnapshot =
            await getDocs(
                collection(db, "gallery")
            );


        if (totalGallery) {

            totalGallery.textContent =
                gallerySnapshot.size;

        }


        // =================================
        // EVENTS
        // =================================

        const eventsSnapshot =
            await getDocs(
                collection(db, "events")
            );


        if (totalEvents) {

            totalEvents.textContent =
                eventsSnapshot.size;

        }


        // =================================
        // NOTICES
        // =================================

        const noticesSnapshot =
            await getDocs(
                collection(db, "notices")
            );


        if (totalNotices) {

            totalNotices.textContent =
                noticesSnapshot.size;

        }

    }

    catch (error) {

        console.error(
            "Dashboard data error:",
            error
        );

    }

}


// =========================================
// MEMBERS COUNT — ADMIN ADDED ONLY (LIVE)
// =========================================
let memberCountListenerStarted = false;

function startMemberCountListener() {
    if (memberCountListenerStarted || !totalMembers) return;
    memberCountListenerStarted = true;

    onSnapshot(
        collection(db, "members"),
        (snapshot) => {
            const adminMembersCount = snapshot.docs.filter((docSnap) => {
                const data = docSnap.data() || {};
                return data.source !== "community_approved";
            }).length;

            totalMembers.textContent = adminMembersCount;
        },
        (error) => {
            console.error("Members live update error:", error);
        }
    );
}


// =========================================
// BIRTHDAY DATA — APPROVED MEMBERS ONLY (LIVE)
// =========================================
let birthdayPeople = [];
let birthdayListenerStarted = false;

function startBirthdayListener() {
    if (birthdayListenerStarted) return;
    birthdayListenerStarted = true;

    const approvedQuery = query(
        collection(db, "joinApplications"),
        where("status", "==", "approved")
    );

    onSnapshot(
        approvedQuery,
        (snapshot) => {
            const byKey = new Map();

            snapshot.forEach((snap) => {
                const data = snap.data() || {};
                if (!data.dob) return;

                const key = String(
                    data.phone || data.mobile || data.name || snap.id
                ).replace(/\D/g, "") || snap.id;

                byKey.set(key, {
                    id: snap.id,
                    name: data.name || "SKL Member",
                    dob: data.dob
                });
            });

            birthdayPeople = Array.from(byKey.values());

            // Re-render immediately whenever an application is approved,
            // rejected, edited, or deleted in Firestore.
            loadBirthdayReminders();
            loadBirthdayMonthList();
        },
        (error) => {
            console.error("Birthday live update error:", error);
            birthdayPeople = [];
            if (birthdayReminders) {
                birthdayReminders.innerHTML = `
                    <div class="birthday-empty birthday-error">Unable to load birthday reminders.</div>`;
            }
            if (birthdayMonthList) {
                birthdayMonthList.innerHTML = `
                    <div class="birthday-empty birthday-error">Unable to load birthday list.</div>`;
            }
        }
    );
}

function getBirthdayPeople() {
    return birthdayPeople;
}

// =========================================
// BIRTHDAY REMINDERS — TODAY + NEXT 7 DAYS
// =========================================
async function loadBirthdayReminders() {
    if (!birthdayReminders) return;

    try {
        const people = getBirthdayPeople();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const items = [];

        people.forEach((person) => {
            const parts = String(person.dob).split("-");
            if (parts.length !== 3) return;
            const month = Number(parts[1]);
            const day = Number(parts[2]);
            if (!month || !day) return;

            let birthday = new Date(today.getFullYear(), month - 1, day);
            birthday.setHours(0, 0, 0, 0);
            if (birthday < today) {
                birthday = new Date(today.getFullYear() + 1, month - 1, day);
                birthday.setHours(0, 0, 0, 0);
            }

            const daysUntil = Math.round((birthday - today) / 86400000);
            // Birthday today or any time during the next 7 days.
            if (daysUntil >= 0 && daysUntil <= 7) {
                items.push({ ...person, daysUntil });
            }
        });

        items.sort((a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name));

        if (!items.length) {
            birthdayReminders.innerHTML = `
                <div class="birthday-empty">
                    <i class="fas fa-calendar-check"></i>
                    No birthdays today or in the next 7 days.
                </div>`;
            return;
        }

        birthdayReminders.innerHTML = items.map((item) => {
            const todayBirthday = item.daysUntil === 0;
            const dayLabel = todayBirthday
                ? "🎉 Birthday today"
                : `🎂 Birthday in ${item.daysUntil} day${item.daysUntil === 1 ? "" : "s"}`;
            return `
                <div class="birthday-reminder-card ${todayBirthday ? "birthday-today" : "birthday-week"}">
                    <div class="birthday-icon"><i class="fas fa-cake-candles"></i></div>
                    <div class="birthday-content">
                        <strong>${escapeBirthdayText(item.name)}</strong>
                        <span>${dayLabel} • ${formatBirthdayDate(item.dob)}</span>
                    </div>
                </div>`;
        }).join("");

    } catch (error) {
        console.error("Birthday reminder error:", error);
        birthdayReminders.innerHTML = `
            <div class="birthday-empty birthday-error">Unable to load birthday reminders.</div>`;
    }
}

// =========================================
// ALL BIRTHDAYS — MONTH WISE
// =========================================
async function loadBirthdayMonthList() {
    if (!birthdayMonthList) return;

    try {
        const people = getBirthdayPeople();
        const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, items: [] }));

        people.forEach((item) => {
            const parts = String(item.dob).split("-");
            const month = Number(parts[1]);
            const day = Number(parts[2]);
            if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                months[month - 1].items.push({ ...item, day });
            }
        });

        const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        birthdayMonthList.innerHTML = months.map(({ month, items }) => {
            items.sort((a, b) => a.day - b.day || a.name.localeCompare(b.name));
            const monthId = `birthday-month-${month}`;
            return `
                <div class="birthday-month-card ${items.length ? "has-birthdays" : "no-birthdays"}">
                    <button type="button" class="birthday-month-title" data-birthday-month="${month}" aria-controls="${monthId}" aria-expanded="false">
                        <span class="birthday-month-name">${monthNames[month - 1]}</span>
                        <span class="birthday-month-count">${items.length}</span>
                        <i class="fas fa-chevron-down birthday-month-chevron" aria-hidden="true"></i>
                    </button>
                    <div id="${monthId}" class="birthday-month-items" hidden>
                        ${items.length ? items.map(item => `<div class="birthday-month-item"><i class="fas fa-cake-candles"></i><span><strong>${escapeBirthdayText(item.name)}</strong><small>${formatBirthdayDate(item.dob)}</small></span></div>`).join("") : '<div class="birthday-month-empty">No birthdays in this month</div>'}
                    </div>
                </div>`;
        }).join("");

        if (!birthdayMonthList.dataset.bound) {
            birthdayMonthList.addEventListener("click", (event) => {
                const button = event.target.closest("[data-birthday-month]");
                if (!button) return;

                const card = button.closest(".birthday-month-card");
                const panel = card?.querySelector(".birthday-month-items");
                if (!panel || card.classList.contains("no-birthdays")) return;

                const expanded = button.getAttribute("aria-expanded") === "true";
                button.setAttribute("aria-expanded", String(!expanded));
                panel.hidden = expanded;
                card.classList.toggle("is-open", !expanded);
            });
            birthdayMonthList.dataset.bound = "true";
        }
    } catch (error) {
        console.error("Birthday month list error:", error);
        birthdayMonthList.innerHTML = `<div class="birthday-empty birthday-error">Unable to load birthday list.</div>`;
    }
}

function formatBirthdayDate(dob) {
    const parts = String(dob).split("-");
    if (parts.length !== 3) return String(dob);
    const date = new Date(2000, Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

function escapeBirthdayText(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
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

                await signOut(auth);


                window.location.href =
                    "index.html";

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Unable to logout. Please try again."
                );

            }

        }
    );

}


// =========================================
// VIEW WEBSITE
// =========================================

if (websiteBtn) {

    websiteBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "../index.html";

        }
    );

}