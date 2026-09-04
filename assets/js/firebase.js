// =========================================
// SKL YUVA CLUB
// FIREBASE CONFIGURATION
// =========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {

    apiKey: "AIzaSyCDZSiWoqMjGIIKnlcMoVlZTcLcFV5J-Lk",

    authDomain: "skl-yuva-club.firebaseapp.com",

    projectId: "skl-yuva-club",

    storageBucket: "skl-yuva-club.appspot.com",

    messagingSenderId: "1011818701427",

    appId: "1:1011818701427:web:3288f10f1553fdbbfc0006",

    measurementId: "G-TFPVYFK4HV"

};


// =========================================
// INITIALIZE FIREBASE
// =========================================

const app =
    initializeApp(firebaseConfig);


// =========================================
// AUTH
// =========================================

export const auth =
    getAuth(app);


// =========================================
// FIRESTORE
// =========================================

export const db =
    getFirestore(app);