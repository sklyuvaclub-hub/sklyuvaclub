import { db } from "./firebase.js";
import { doc, getDoc } from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function loadSiteSettings() {
    try {
        const snap = await getDoc(doc(db, "settings", "site"));
        if (!snap.exists()) return {};
        const s = snap.data();

        const textMap = {
            clubName: ["[data-setting='clubName']"],
            clubDescription: ["[data-setting='clubDescription']"],
            clubPhone: ["[data-setting='clubPhone']"],
            clubEmail: ["[data-setting='clubEmail']"],
            clubAddress: ["[data-setting='clubAddress']"],
            footerText: ["[data-setting='footerText']"]
        };

        for (const [key, selectors] of Object.entries(textMap)) {
            if (s[key] == null) continue;
            selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.textContent = s[key]));
        }

        if (s.logoUrl) document.querySelectorAll("[data-setting='logoUrl']").forEach(el => el.src = s.logoUrl);


        // Dynamic phone / email links
        if (s.clubPhone) {
            let digits = String(s.clubPhone).replace(/\D/g, "");

            // Normalize Indian club numbers for the tel: scheme.
            // 9882288938   -> +919882288938
            // 09882288938  -> +919882288938
            // 919882288938 -> +919882288938
            if (digits.length === 10) {
                digits = `91${digits}`;
            } else if (digits.length === 11 && digits.startsWith("0")) {
                digits = `91${digits.slice(1)}`;
            }

            document.querySelectorAll("[data-setting-phone]").forEach(el => {
                if (digits.length >= 10) {
                    el.href = `tel:+${digits}`;
                    el.setAttribute("href", `tel:+${digits}`);
                }
            });
        }

        if (s.clubEmail) {
            document.querySelectorAll("[data-setting-email]").forEach(el => {
                el.href = `mailto:${s.clubEmail}`;
            });
        }

        // Dynamic Google Maps iframe/button
        if (s.clubAddress) {
            document.querySelectorAll("[data-setting-map]").forEach(el => {
                el.src = `https://www.google.com/maps?q=${encodeURIComponent(s.clubAddress)}&output=embed`;
            });
        }

        const maps = document.querySelectorAll("[data-setting='googleMapsLink']");
        maps.forEach(el => { if (s.googleMapsLink) el.href = s.googleMapsLink; });

        const socials = ["facebook","instagram","youtube"];
        socials.forEach(key => {
            document.querySelectorAll(`[data-setting='${key}']`).forEach(el => {
                if (s[key]) el.href = s[key];
                else el.style.display = "none";
            });
        });

        // Dynamic club WhatsApp links. Keep member WhatsApp numbers untouched.
        document.querySelectorAll("[data-setting='whatsapp']").forEach(el => {
            if (s.whatsappNumber) {
                let digits = String(s.whatsappNumber).replace(/\D/g, "");

                // Admin Settings normally stores an Indian 10-digit number.
                // Convert it to international format so WhatsApp can open it correctly.
                if (digits.length === 10) {
                    digits = `91${digits}`;
                } else if (digits.length === 11 && digits.startsWith("0")) {
                    digits = `91${digits.slice(1)}`;
                }

                el.href = `https://wa.me/${digits}`;
                el.target = "_blank";
                el.rel = "noopener noreferrer";
            }
        });

        return s;
    } catch (error) {
        console.error("Site settings error:", error);
        return {};
    }
}
