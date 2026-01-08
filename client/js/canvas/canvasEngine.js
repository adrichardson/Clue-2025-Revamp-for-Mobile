// canvasEngine.js

export function setupCanvas(canvas, onDraw) {
  const ctx = canvas.getContext("2d");

  function resize() {
    const dpr = window.devicePixelRatio || 1;

    // CSS size
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    // Set actual buffer size
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    // Reset transform before scaling (VERY IMPORTANT)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Redraw after resize
    if (onDraw) onDraw(ctx, cssWidth, cssHeight);
  }

  // Initial sizing
  resize();

  // Recalculate on resize / orientation change
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);

  return {
    ctx,
    resize
  };
}
