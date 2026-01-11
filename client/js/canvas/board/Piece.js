export class Piece {
  constructor({ tile, owner, id, radius = 20, color }) {
    this.tile = tile;          // Tile instance (current)
    this.owner = owner;        // string | player id | enum
    this.id = id;    
    this.radius = radius;
    this.color = color;

    // World position (used while dragging)
    this.x = 0;
    this.y = 0;

    this.dragging = false;
    this.dragPointerId = null;
  }

  /** Sync world position from tile */
  snapToTile(boardOrigin) {
    if (!this.tile) return;

    const center = this.tile.getWorldCenter(boardOrigin);
    this.x = center.x;
    this.y = center.y;
  }

  /** Start dragging */
  beginDrag(pointerId) {
    this.dragging = true;
    this.dragPointerId = pointerId;
  }

  /** End dragging */
  endDrag() {
    this.dragging = false;
    this.dragPointerId = null;
  }

  /** Hit test in world space */
  containsWorld(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}
