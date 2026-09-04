/* =========================================
   SKL YUVA CLUB
   WEBSITE MEMBERS
   FIRESTORE
========================================= */


// =========================================
// FIREBASE
// =========================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================
// ELEMENTS
// =========================================

const membersContainer =
    document.getElementById("membersContainer");

const memberSearch =
    document.getElementById("memberSearch");

const memberFilter =
    document.getElementById("memberFilter");


// =========================================
// VARIABLES
// =========================================

let members = [];


// =========================================
// LOAD MEMBERS
// =========================================

async function loadMembers() {

    if (!membersContainer) {
        return;
    }


    membersContainer.innerHTML = `

        <div class="members-loading">

            <i class="fas fa-spinner fa-spin"></i>

            <p>
                Loading members...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "members"
                )
            );


        // =================================
        // PUBLIC MEMBERS PAGE = ADMIN-ADDED ONLY
        // =================================
        // Membership-form approvals are kept separate from the
        // public Members directory. Only records explicitly created
        // through Admin -> Add Member are shown here.
        members = [];

        snapshot.forEach((memberDoc) => {

            const data = memberDoc.data();

            if (data.source !== "admin_added") {
                return;
            }

            members.push({
                id: memberDoc.id,
                ...data
            });

        });


        // =================================
        // ONLY ACTIVE MEMBERS
        // =================================

        members =
            members.filter(
                (member) =>
                    member.status !== "inactive"
            );


        // =================================
        // SORT BY NAME
        // =================================

        members.sort(
            (a, b) => {

                const nameA =
                    String(
                        a.name || ""
                    ).toLowerCase();


                const nameB =
                    String(
                        b.name || ""
                    ).toLowerCase();


                return nameA.localeCompare(
                    nameB
                );

            }
        );


        // =================================
        // CREATE POSITION FILTER
        // =================================

        updatePositionFilter();


        // =================================
        // SHOW MEMBERS
        // =================================

        applyFilters();


    }

    catch (error) {

        console.error(
            "Website Members Error:",
            error
        );


        membersContainer.innerHTML = `

            <div class="members-error">

                <i class="fas fa-circle-exclamation"></i>

                <h3>
                    Unable to load members
                </h3>

                <p>
                    Please check your internet connection
                    and try again.
                </p>

            </div>

        `;

    }

}


// =========================================
// UPDATE POSITION FILTER
// =========================================

function updatePositionFilter() {

    if (!memberFilter) {
        return;
    }


    const positions = [

        ...new Set(

            members

                .map(
                    (member) =>
                        member.position
                )

                .filter(
                    Boolean
                )

        )

    ];


    memberFilter.innerHTML = `

        <option value="all">
            All Positions
        </option>

    `;


    positions
        .sort()
        .forEach(
            (position) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    position;


                option.textContent =
                    position;


                memberFilter.appendChild(
                    option
                );

            }
        );

}


// =========================================
// APPLY FILTERS
// =========================================

function applyFilters() {

    const searchText =
        memberSearch
            ? memberSearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedPosition =
        memberFilter
            ? memberFilter.value
            : "all";


    const filtered =
        members.filter(
            (member) => {


                const name =
                    String(
                        member.name || ""
                    ).toLowerCase();


                const phone =
                    String(
                        member.phone || ""
                    ).toLowerCase();


                const position =
                    String(
                        member.position || ""
                    ).toLowerCase();


                const searchMatch =

                    !searchText

                    ||

                    name.includes(
                        searchText
                    )

                    ||

                    phone.includes(
                        searchText
                    )

                    ||

                    position.includes(
                        searchText
                    );


                const positionMatch =

                    selectedPosition ===
                    "all"

                    ||

                    String(
                        member.position || ""
                    ) ===
                    selectedPosition;


                return (
                    searchMatch &&
                    positionMatch
                );

            }
        );


    renderMembers(
        filtered
    );

}


// =========================================
// RENDER MEMBERS
// =========================================

function renderMembers(data) {

    if (!membersContainer) {
        return;
    }


    // =================================
    // NO MEMBERS
    // =================================

    if (
        data.length === 0
    ) {

        membersContainer.innerHTML = `

            <div class="members-empty">

                <div class="members-empty-icon">

                    <i class="fas fa-users"></i>

                </div>

                <h3>
                    No Members Found
                </h3>

                <p>
                    No active members match your search.
                </p>

            </div>

        `;

        return;

    }


    // =================================
    // MEMBER CARDS
    // =================================

    membersContainer.innerHTML = "";


    data.forEach(
        (member) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "team-card";


            // =================================
            // PHOTO
            // =================================

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                member.photo ||
                "assets/images/team/member1.jpg";


            image.alt =
                member.name ||
                "SKL Yuva Club Member";


            image.loading =
                "lazy";


            image.onerror =
                function () {

                    this.src =
                        "assets/images/logo.png";

                };


            card.appendChild(
                image
            );


            // =================================
            // CARD CONTENT
            // =================================

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "team-info";


            // NAME

            const name =
                document.createElement(
                    "h3"
                );


            name.textContent =
                member.name ||
                "SKL Member";


            content.appendChild(
                name
            );


            // POSITION

            const position =
                document.createElement(
                    "span"
                );


            position.className =
                "team-position";


            position.textContent =
                member.position ||
                "Member";


            content.appendChild(
                position
            );


            // =================================
            // PHONE
            // =================================

            if (
                member.phone
            ) {

                const phone =
                    document.createElement(
                        "p"
                    );


                phone.className =
                    "team-phone";


                const phoneIcon =
                    document.createElement(
                        "i"
                    );


                phoneIcon.className =
                    "fas fa-phone";


                phone.appendChild(
                    phoneIcon
                );


                phone.appendChild(
                    document.createTextNode(
                        " " +
                        member.phone
                    )
                );


                content.appendChild(
                    phone
                );

            }


            // =================================
            // SOCIAL
            // =================================

            const social =
                document.createElement(
                    "div"
                );


            social.className =
                "team-social";


            // FACEBOOK

            if (
                member.facebook
            ) {

                social.appendChild(
                    createSocialLink(
                        member.facebook,
                        "fab fa-facebook-f",
                        "Facebook"
                    )
                );

            }


            // INSTAGRAM

            if (
                member.instagram
            ) {

                social.appendChild(
                    createSocialLink(
                        member.instagram,
                        "fab fa-instagram",
                        "Instagram"
                    )
                );

            }


            // WHATSAPP

            if (
                member.phone
            ) {

                let whatsapp =
                    String(
                        member.phone
                    ).replace(
                        /\D/g,
                        ""
                    );

                if (whatsapp.length === 10) {
                    whatsapp = "91" + whatsapp;
                } else if (whatsapp.length === 11 && whatsapp.startsWith("0")) {
                    whatsapp = "91" + whatsapp.slice(1);
                }

                if (
                    whatsapp.length >= 12
                ) {

                    social.appendChild(
                        createSocialLink(
                            "https://wa.me/" +
                            whatsapp,
                            "fab fa-whatsapp",
                            "WhatsApp"
                        )
                    );

                }

            }


            content.appendChild(
                social
            );


            card.appendChild(
                content
            );


            membersContainer.appendChild(
                card
            );

        }
    );

}


// =========================================
// SOCIAL LINK
// =========================================

function createSocialLink(
    url,
    iconClass,
    label
) {

    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.target =
        "_blank";


    link.rel =
        "noopener noreferrer";


    link.setAttribute(
        "aria-label",
        label
    );


    const icon =
        document.createElement(
            "i"
        );


    icon.className =
        iconClass;


    link.appendChild(
        icon
    );


    return link;

}


// =========================================
// SEARCH EVENT
// =========================================

if (
    memberSearch
) {

    memberSearch.addEventListener(
        "input",
        applyFilters
    );

}


// =========================================
// FILTER EVENT
// =========================================

if (
    memberFilter
) {

    memberFilter.addEventListener(
        "change",
        applyFilters
    );

}


// =========================================
// LOAD
// =========================================

loadMembers();