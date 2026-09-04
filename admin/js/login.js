/* =========================================
   SKL YUVA CLUB
   ADMIN LOGIN
   FIREBASE AUTHENTICATION
========================================= */


// =========================================
// FIREBASE
// =========================================

import { auth } from "../../assets/js/firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// =========================================
// ELEMENTS
// =========================================

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");


// =========================================
// SHOW / HIDE PASSWORD
// =========================================

if (
    togglePassword &&
    passwordInput
) {

    togglePassword.addEventListener(
        "click",
        function () {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                togglePassword.innerHTML =
                    '<i class="fas fa-eye-slash"></i>';

            }

            else {

                passwordInput.type =
                    "password";

                togglePassword.innerHTML =
                    '<i class="fas fa-eye"></i>';

            }

        }
    );

}


// =========================================
// LOGIN FORM
// =========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            // =================================
            // VALIDATION
            // =================================

            if (!email) {

                alert(
                    "Please enter your email address."
                );

                emailInput.focus();

                return;

            }


            if (!password) {

                alert(
                    "Please enter your password."
                );

                passwordInput.focus();

                return;

            }


            // =================================
            // LOGIN BUTTON
            // =================================

            const loginButton =
                loginForm.querySelector(
                    'button[type="submit"]'
                );


            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>

                    <span>
                        Logging in...
                    </span>
                `;

            }


            // =================================
            // FIREBASE LOGIN
            // =================================

            try {

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                console.log(
                    "Admin logged in:",
                    userCredential.user.uid
                );


                window.location.href =
                    "dashboard.html";

            }


            // =================================
            // ERROR
            // =================================

            catch (error) {

                console.error(
                    "Firebase Login Error:",
                    error
                );


                let message =
                    "Login failed.";


                switch (error.code) {

                    case "auth/invalid-credential":

                        message =
                            "Incorrect email or password.";

                        break;


                    case "auth/user-not-found":

                        message =
                            "No account found with this email.";

                        break;


                    case "auth/wrong-password":

                        message =
                            "Incorrect password.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Please enter a valid email address.";

                        break;


                    case "auth/too-many-requests":

                        message =
                            "Too many login attempts. Please try again later.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "Network error. Please check your internet connection.";

                        break;


                    case "auth/user-disabled":

                        message =
                            "This account has been disabled.";

                        break;


                    default:

                        message =
                            error.message ||
                            "Unable to login.";

                }


                alert(message);

            }


            // =================================
            // RESTORE BUTTON
            // =================================

            finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.innerHTML = `
                        <i class="fas fa-right-to-bracket"></i>

                        <span>
                            Login to Admin Panel
                        </span>
                    `;

                }

            }

        }
    );

}