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

onAuthStateChanged(auth, (user) => {

    // User is NOT logged in
    if (!user) {

        window.location.replace(
            loginPage
        );

        return;

    }

});


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