// utils/animationHandler.js

export class AnimationHandler {
  constructor() {
    this.animations = [];
  }

  add(animation) {
    this.animations.push(animation);
  }

  update(dt) {
    // dt in milliseconds
    this.animations = this.animations.filter(anim => {
      anim.update(dt);
      return !anim.finished;
    });
  }

  draw(ctx) {
    for (const anim of this.animations) {
      anim.draw(ctx);
    }
  }

  clear() {
    this.animations.length = 0;
  }

  handleClick(x, y) {
    for (const anim of this.animations) {
        if (anim.interactive && anim.containsPoint(x, y)) {
        anim.finished = true;
        return true; // click consumed
        }
    }
    return false;
  }

}
