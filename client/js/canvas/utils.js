 export function showToast(text) {
    let toast = document.getElementById("debug-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "debug-toast";
      document.body.appendChild(toast);

      Object.assign(toast.style, {
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        padding: "8px 14px",
        borderRadius: "8px",
        fontSize: "14px",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.2s"
      });
    }

    toast.textContent = text;
    toast.style.opacity = 1;

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = 0;
    }, 1200);
}

 /* =========================
     CAMERA HELPERS
  ========================= */

export function zoomAtPoint(state, factor, canvasX, canvasY) {
    const cam = state.camera;

    factor = Math.max(0.9, Math.min(1.1, factor));

    const worldX = (canvasX - cam.x) / cam.scale;
    const worldY = (canvasY - cam.y) / cam.scale;

    const newScale = Math.max(
      cam.minScale,
      Math.min(cam.maxScale, cam.scale * factor)
    );

    cam.x = canvasX - worldX * newScale;
    cam.y = canvasY - worldY * newScale;
    cam.scale = newScale;
  }

export function clampCamera(state, canvas) {
    const cam = state.camera;
    const img = state.boardImage;

    const scaledW = img.width * cam.scale;
    const scaledH = img.height * cam.scale;

    if (scaledW <= canvas.width) {
      cam.x = (canvas.width - scaledW) / 2;
    } else {
      cam.x = Math.min(0, Math.max(canvas.width - scaledW, cam.x));
    }

    if (scaledH <= canvas.height) {
      cam.y = (canvas.height - scaledH) / 2;
    } else {
      cam.y = Math.min(0, Math.max(canvas.height - scaledH, cam.y));
    }
  }