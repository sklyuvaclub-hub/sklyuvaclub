/* SKL Yuva Club - Passport Photo Cropper
   Ratio: 35:45 (standard passport-photo portrait ratio)
   Returns a JPEG Blob after the user confirms the crop.
*/

const CROP_W = 413;
const CROP_H = 531;
const ASPECT = CROP_W / CROP_H;

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

export function openPassportCropper(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith("image/")) {
            reject(new Error("Please select a valid image file."));
            return;
        }

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            let scale = Math.max(1, Math.min(4, Math.max(CROP_W / img.naturalWidth, CROP_H / img.naturalHeight)));
            let cropW, cropH;
            if ((img.naturalWidth / img.naturalHeight) > ASPECT) {
                cropH = img.naturalHeight;
                cropW = cropH * ASPECT;
            } else {
                cropW = img.naturalWidth;
                cropH = cropW / ASPECT;
            }

            let x = (img.naturalWidth - cropW) / 2;
            let y = (img.naturalHeight - cropH) / 2;
            let zoom = 1;
            let dragX = 0, dragY = 0, startX = 0, startY = 0;
            let dragging = false;

            const overlay = document.createElement("div");
            overlay.className = "passport-cropper-overlay";
            overlay.innerHTML = `
                <div class="passport-cropper-modal" role="dialog" aria-modal="true" aria-label="Crop passport photo">
                    <div class="passport-cropper-head">
                        <div><strong>Crop Passport Photo</strong><small>35 × 45 mm ratio • Move and zoom to fit</small></div>
                        <button type="button" class="passport-cropper-close" aria-label="Close">&times;</button>
                    </div>
                    <div class="passport-cropper-stage"><canvas></canvas></div>
                    <div class="passport-cropper-controls">
                        <button type="button" class="passport-cropper-minus">−</button>
                        <input type="range" min="1" max="3" step="0.01" value="1" aria-label="Zoom">
                        <button type="button" class="passport-cropper-plus">+</button>
                    </div>
                    <div class="passport-cropper-actions">
                        <button type="button" class="passport-cropper-cancel">Cancel</button>
                        <button type="button" class="passport-cropper-use">Use This Photo</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);

            const canvas = overlay.querySelector("canvas");
            const ctx = canvas.getContext("2d");
            const range = overlay.querySelector("input[type=range]");
            canvas.width = CROP_W; canvas.height = CROP_H;

            function draw() {
                const baseScale = Math.max(CROP_W / cropW, CROP_H / cropH);
                const s = baseScale * zoom;
                const dw = cropW * s, dh = cropH * s;
                const dx = (CROP_W - dw) / 2 + dragX;
                const dy = (CROP_H - dh) / 2 + dragY;
                ctx.clearRect(0, 0, CROP_W, CROP_H);
                ctx.save();
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, CROP_W, CROP_H);
                ctx.drawImage(img, x, y, cropW, cropH, dx, dy, dw, dh);
                ctx.restore();
            }

            function close(result, error) {
                document.removeEventListener("keydown", keyHandler);
                overlay.remove(); URL.revokeObjectURL(url);
                if (error) reject(error); else resolve(result);
            }

            function keyHandler(e) { if (e.key === "Escape") close(null, new Error("Photo crop cancelled.")); }
            document.addEventListener("keydown", keyHandler);

            overlay.querySelector(".passport-cropper-close").onclick = () => close(null, new Error("Photo crop cancelled."));
            overlay.querySelector(".passport-cropper-cancel").onclick = () => close(null, new Error("Photo crop cancelled."));
            overlay.querySelector(".passport-cropper-minus").onclick = () => { zoom = clamp(zoom - .1, 1, 3); range.value = zoom; draw(); };
            overlay.querySelector(".passport-cropper-plus").onclick = () => { zoom = clamp(zoom + .1, 1, 3); range.value = zoom; draw(); };
            range.oninput = () => { zoom = Number(range.value); draw(); };

            canvas.addEventListener("pointerdown", e => {
                dragging = true; canvas.setPointerCapture(e.pointerId); startX = e.clientX - dragX; startY = e.clientY - dragY;
            });
            canvas.addEventListener("pointermove", e => {
                if (!dragging) return;
                dragX = e.clientX - startX; dragY = e.clientY - startY; draw();
            });
            canvas.addEventListener("pointerup", () => dragging = false);
            canvas.addEventListener("pointercancel", () => dragging = false);

            overlay.querySelector(".passport-cropper-use").onclick = () => {
                canvas.toBlob(blob => {
                    if (!blob) return close(null, new Error("Could not create cropped photo."));
                    close(new File([blob], "passport-photo.jpg", { type: "image/jpeg", lastModified: Date.now() }));
                }, "image/jpeg", .92);
            };
            draw();
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read the selected image.")); };
        img.src = url;
    });
}
