// renderer.js
export function render(ctx, state) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();
  ctx.translate(state.camera.x, state.camera.y);
  ctx.scale(state.camera.zoom, state.camera.zoom);

  // Example: draw board
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(0, 0, state.board.width, state.board.height);

  // Example: draw center circle
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(
    state.board.width / 2,
    state.board.height / 2,
    80,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.restore();
}
