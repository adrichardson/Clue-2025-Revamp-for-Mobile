export class Piece {
  constructor({ tile, room, owner, id, radius = 20, color }) {
    this.tile = tile;          // Tile instance (current)
    this.room = room;         // Room instance (current)
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
    if (this.room) {
      this.room.removePiece(this);
      this.room = null;
    }

    const center = this.tile.getWorldCenter(boardOrigin);
    this.x = center.x;
    this.y = center.y;
  }

  circlesOverlap(a, b, margin = 0) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.hypot(dx, dy);
    return dist < a.radius + b.radius + margin;
  }  

  snapToRoom(room, boardOrigin) {
    this.tile = null;

    const center = room.getCenterWorld(boardOrigin);
    const others = room.getPiecesInRoom().filter(p => p !== this);

    // Try center first
    let candidate = {
      x: center.x,
      y: center.y,
      radius: this.radius
    };

    const MARGIN = 6;

    let blocked = others.some(p =>
      this.circlesOverlap(candidate, p, MARGIN)
    );

    if (!blocked) {
      this.x = candidate.x;
      this.y = candidate.y;
      room.addPiece(this);
      return;
    }

    // Spiral placement
    const STEP_ANGLE = Math.PI / 6;
    const STEP_RADIUS = this.radius * 2 + MARGIN;
    const MAX_RINGS = 10;

    for (let ring = 1; ring <= MAX_RINGS; ring++) {
      const r = ring * STEP_RADIUS;

      for (let a = 0; a < Math.PI * 2; a += STEP_ANGLE) {
        candidate.x = center.x + Math.cos(a) * r;
        candidate.y = center.y + Math.sin(a) * r;

        blocked = others.some(p =>
          this.circlesOverlap(candidate, p, MARGIN)
        );

        if (!blocked) {
          this.x = candidate.x;
          this.y = candidate.y;
          room.addPiece(this);          
          return;
        }
      }
    }

    // Fallback: still place near center
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
