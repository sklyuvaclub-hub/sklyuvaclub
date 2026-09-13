/* =========================================================
   SKL YUVA CLUB
   ADMIN AUTHENTICATION
   LOGIN CHECK + LOGOUT
========================================================= */

import { auth } from "../../assets/js/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// =========================================================
// LOGIN PAGE
// =========================================================

const loginPage = "index.html";


// =========================================================
// LOGOUT BUTTON
// =========================================================

const logoutBtn =
    document.getElementById("logoutBtn");


// =========================================================
// AUTH CHECK
// =========================================================

// All protected admin scripts wait for this promise before running.
// This prevents an unauthenticated user from using the admin page
// while Firebase is still restoring the previous session.
export const adminAuthReady = new Promise((resolve) => {

    onAuthStateChanged(auth, (user) => {

        if (!user) {
            window.location.replace(loginPage);
            resolve(false);
            return;
        }

        // Allow the protected page to become visible only after auth is confirmed.
        document.documentElement.classList.add("admin-authenticated");
        resolve(true);
    });

});

// Keep protected admin pages hidden until Firebase confirms login.
// The login page does not load this file, so it is unaffected.
document.documentElement.classList.add("admin-auth-pending");

// =========================================================
// LOGOUT
// =========================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


            try {

                await signOut(auth);


                // Firebase session cleared
                window.location.replace(
                    loginPage
                );


            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                alert(
                    "Unable to logout. Please try again."
                );

            }

        }
    );

}