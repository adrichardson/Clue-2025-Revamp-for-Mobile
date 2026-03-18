export class SpriteAnimation {
  constructor({
    image,
    frameWidth,
    frameHeight,
    frameCount,
    position,
    scale = 1,
    rotation = 0,
    duration = 1000,        // total roll time (ms)
    finalFrame = null,      // 0-based index (0 = face 1)
    onFinish = null
  }) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;

    this.position = position;
    this.scale = scale;
    this.rotation = rotation;
    this.duration = duration;
    this.finalFrame = finalFrame;
    this.onFinish = onFinish;
    this.waitForClick = false;
    this.interactive = false;


    this.elapsed = 0;
    this.currentFrame = 0;
    this.finished = false;
  }

  update(dt) {
    if (this.finished) return;

    this.elapsed += dt;
    const t = Math.min(this.elapsed / this.duration, 1);

    if (t < 1) {
      // 🔑 Ease-out slowing (fast → slow)
      const speed = lerp(20, 2, t); // frames per second
      this.currentFrame =
        Math.floor((this.elapsed / 1000) * speed) % this.frameCount;

    } else {
        // 🔒 Lock final face
        this.currentFrame = this.finalFrame;
        this.yOffset = 0;
        this.squashX = 1;
        this.squashY = 1;

        // ⛔ DO NOT finish yet
        this.waitForClick = true;
        this.interactive = true;
    }
  }

  draw(ctx) {
    const sx = this.currentFrame * this.frameWidth;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    ctx.drawImage(
      this.image,
      sx, 0,
      this.frameWidth, this.frameHeight,
      -this.frameWidth * this.scale / 2,
      -this.frameHeight * this.scale / 2,
      this.frameWidth * this.scale,
      this.frameHeight * this.scale
    );

    ctx.restore();
  }

    containsPoint(x, y) {
    const halfW = (this.frameWidth * this.scale) / 2;
    const halfH = (this.frameHeight * this.scale) / 2;

    return (
        x >= this.position.x - halfW &&
        x <= this.position.x + halfW &&
        y >= this.position.y - halfH &&
        y <= this.position.y + halfH
    );
    }

}

// helpers
function lerp(a, b, t) {
  return a + (b - a) * t;
}
