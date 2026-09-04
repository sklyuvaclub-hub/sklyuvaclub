/* =========================================
   SKL YUVA CLUB
   PUBLIC NOTICES PAGE
   FIRESTORE
========================================= */

// =========================================
// FIREBASE
// =========================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================
// ELEMENTS
// =========================================

const noticesContainer =
    document.getElementById("publicNoticesContainer");

const noticeSearch =
    document.getElementById("noticeSearch");

const noticeFilter =
    document.getElementById("noticeFilter");

const blogsContainer = document.getElementById("publicBlogsContainer");


// =========================================
// VARIABLES
// =========================================

let notices = [];


// =========================================
// LOAD NOTICES
// =========================================

async function loadNotices() {

    if (!noticesContainer) {
        return;
    }


    // Loading

    noticesContainer.innerHTML = `

        <div class="public-notice-loading">

            <i class="fas fa-spinner fa-spin"></i>

            <p>
                Loading notices...
            </p>

        </div>

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


        // =========================================
        // SORT LATEST NOTICE FIRST
        // =========================================

        notices.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.date || 0
                    ).getTime();


                const dateB =
                    new Date(
                        b.date || 0
                    ).getTime();


                return dateB - dateA;

            }
        );


        // =========================================
        // DISPLAY
        // =========================================

        applyNoticeFilters();


    } catch (error) {

        console.error(
            "Public Notices Error:",
            error
        );


        noticesContainer.innerHTML = `

            <div class="public-notice-error">

                <div class="notice-error-icon">

                    <i class="fas fa-circle-exclamation"></i>

                </div>

                <h3>
                    Unable to Load Notices
                </h3>

                <p>
                    Please check your internet connection
                    and try again later.
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    id="retryNoticesBtn"
                >

                    <i class="fas fa-rotate-right"></i>

                    Try Again

                </button>

            </div>

        `;


        const retryButton =
            document.getElementById(
                "retryNoticesBtn"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadNotices
            );

        }

    }

}


// =========================================
// APPLY SEARCH + FILTER
// =========================================

function applyNoticeFilters() {

    if (!noticesContainer) {
        return;
    }


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


                // =================================
                // SEARCH
                // =================================

                const title =
                    String(
                        notice.title || ""
                    ).toLowerCase();


                const description =
                    String(
                        notice.description || ""
                    ).toLowerCase();


                const date =
                    String(
                        notice.date || ""
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
                    )

                    ||

                    date.includes(
                        searchText
                    );


                // =================================
                // PRIORITY FILTER
                // =================================

                const priority =
                    String(
                        notice.priority ||
                        "normal"
                    ).toLowerCase();


                const priorityMatch =

                    selectedFilter === "all"

                    ||

                    priority ===
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

    if (!noticesContainer) {
        return;
    }


    // =========================================
    // NO NOTICES
    // =========================================

    if (data.length === 0) {

        noticesContainer.innerHTML = `

            <div class="public-notice-empty">

                <div class="notice-empty-icon">

                    <i class="fas fa-bell-slash"></i>

                </div>

                <h3>
                    No Notices Found
                </h3>

                <p>
                    There are no notices matching
                    your search or filter.
                </p>

            </div>

        `;

        return;

    }


    // =========================================
    // CLEAR CONTAINER
    // =========================================

    noticesContainer.innerHTML = "";


    // =========================================
    // CREATE CARDS
    // =========================================

    data.forEach(
        (notice) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "public-notice-card";


            // =================================
            // PRIORITY
            // =================================

            const priority =
                String(
                    notice.priority ||
                    "normal"
                ).toLowerCase();


            const isImportant =
                priority ===
                "important";


            // =================================
            // CARD HEADER
            // =================================

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "public-notice-header";


            // ICON

            const iconBox =
                document.createElement(
                    "div"
                );


            iconBox.className =
                "public-notice-icon";


            iconBox.innerHTML = `

                <i class="fas fa-bullhorn"></i>

            `;


            header.appendChild(
                iconBox
            );


            // =================================
            // META
            // =================================

            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "public-notice-meta";


            // DATE

            const date =
                document.createElement(
                    "span"
                );


            date.className =
                "public-notice-date";


            date.innerHTML = `

                <i class="far fa-calendar"></i>

                ${formatNoticeDate(
                notice.date
            )}

            `;


            meta.appendChild(
                date
            );


            // PRIORITY BADGE

            const badge =
                document.createElement(
                    "span"
                );


            badge.className =
                "public-notice-priority";


            if (isImportant) {

                badge.classList.add(
                    "important"
                );


                badge.innerHTML = `

                    <i class="fas fa-star"></i>

                    Important

                `;

            } else {

                badge.classList.add(
                    "normal"
                );


                badge.innerHTML = `

                    <i class="fas fa-info-circle"></i>

                    Notice

                `;

            }


            meta.appendChild(
                badge
            );


            header.appendChild(
                meta
            );


            card.appendChild(
                header
            );


            // =================================
            // CONTENT
            // =================================

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "public-notice-content";


            // TITLE

            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                notice.title ||
                "Club Notice";


            content.appendChild(
                title
            );


            // DESCRIPTION

            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                notice.description ||
                "No additional details available.";


            content.appendChild(
                description
            );


            card.appendChild(
                content
            );


            // =================================
            // IMPORTANT STRIP
            // =================================

            if (isImportant) {

                const importantStrip =
                    document.createElement(
                        "div"
                    );


                importantStrip.className =
                    "notice-important-strip";


                importantStrip.innerHTML = `

                    <i class="fas fa-circle-exclamation"></i>

                    Important Notice

                `;


                card.appendChild(
                    importantStrip
                );

            }


            // =================================
            // ADD CARD
            // =================================

            noticesContainer.appendChild(
                card
            );

        }
    );

}


// =========================================
// FORMAT DATE
// =========================================

function formatNoticeDate(dateValue) {

    if (!dateValue) {

        return "Date not available";

    }


    try {

        const date =
            new Date(
                dateValue
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                dateValue
            );

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch (error) {

        return String(
            dateValue
        );

    }

}


// =========================================
// SEARCH
// =========================================

if (noticeSearch) {

    noticeSearch.addEventListener(
        "input",
        applyNoticeFilters
    );

}


// =========================================
// FILTER
// =========================================

if (noticeFilter) {

    noticeFilter.addEventListener(
        "change",
        applyNoticeFilters
    );

}


// =========================================
// FOOTER YEAR
// =========================================

const yearElement =
    document.getElementById(
        "year"
    );


if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


// =========================================
// LOAD
// =========================================

loadNotices();

// =========================================
// LOAD BLOGS
// =========================================

async function loadBlogs() {
    if (!blogsContainer) return;
    try {
        const snapshot = await getDocs(collection(db, "blogs"));
        const blogs = [];
        snapshot.forEach(docSnap => {
            const b = docSnap.data();
            if (b.active === false) return;
            blogs.push({ id: docSnap.id, ...b });
        });
        blogs.sort((a,b) => {
            const oa = Number(a.order ?? 999999), ob = Number(b.order ?? 999999);
            if (oa !== ob) return oa-ob;
            return String(b.date || "").localeCompare(String(a.date || ""));
        });
        if (!blogs.length) { blogsContainer.innerHTML = `<div class="public-notice-empty"><div class="notice-empty-icon"><i class="fas fa-newspaper"></i></div><h3>No Blogs Yet</h3><p>Club blogs will appear here.</p></div>`; return; }
        blogsContainer.innerHTML = blogs.map(blog => `
            <article class="blog-card">
                ${blog.imageUrl ? `<img src="${escapeHTML(blog.imageUrl)}" alt="${escapeHTML(blog.title || 'Club Blog')}" class="blog-image">` : ''}
                <div class="blog-content">
                    <div class="blog-meta"><span><i class="far fa-calendar"></i> ${escapeHTML(formatNoticeDate(blog.date))}</span>${blog.author ? `<span><i class="fas fa-user"></i> ${escapeHTML(blog.author)}</span>` : ''}</div>
                    <h3>${escapeHTML(blog.title || 'Club Blog')}</h3>
                    <div class="blog-text-wrap">
                        <p class="blog-excerpt">${escapeHTML(blog.content || '')}</p>
                        <button type="button" class="blog-read-more" aria-expanded="false">Read More</button>
                    </div>
                </div>
            </article>`).join('');

        // Show Read More only when the blog content is actually longer than the preview.
        blogsContainer.querySelectorAll('.blog-text-wrap').forEach(wrap => {
            const text = wrap.querySelector('.blog-excerpt');
            const button = wrap.querySelector('.blog-read-more');
            if (!text || !button) return;
            requestAnimationFrame(() => {
                if (text.scrollHeight > text.clientHeight + 2) {
                    button.hidden = false;
                } else {
                    button.hidden = true;
                }
            });
        });

        if (!blogsContainer.dataset.readMoreBound) {
            blogsContainer.addEventListener('click', event => {
                const button = event.target.closest('.blog-read-more');
                if (!button) return;
                const wrap = button.closest('.blog-text-wrap');
                const text = wrap?.querySelector('.blog-excerpt');
                if (!text) return;
                const expanded = text.classList.toggle('expanded');
                button.setAttribute('aria-expanded', String(expanded));
                button.textContent = expanded ? 'Read Less' : 'Read More';
            });
            blogsContainer.dataset.readMoreBound = 'true';
        }
    } catch (error) {
        console.error("Public Blogs Error:", error);
        blogsContainer.innerHTML = `<div class="public-notice-error"><div class="notice-error-icon"><i class="fas fa-circle-exclamation"></i></div><h3>Unable to Load Blogs</h3><p>Please try again later.</p></div>`;
    }
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

loadBlogs();

