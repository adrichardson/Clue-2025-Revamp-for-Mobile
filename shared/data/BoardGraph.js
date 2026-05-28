import { BOARD_ROWS, BOARD_COLS, EXCLUDE_TILES, ROOM_DEFS } from "../data/index.js";

export function buildBoardGraph() {

  const graph = new Map();

  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {

      const tileId = `${col},${row}`;

      if (!isWalkableTile(tileId)) continue;

      const neighbors = [];

      const directions = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0]
      ];

      for (const [dx, dy] of directions) {

        const nx = col + dx;
        const ny = row + dy;

        const neighborId = `${nx},${ny}`;

        if (
          nx < 0 ||
          ny < 0 ||
          nx >= BOARD_COLS ||
          ny >= BOARD_ROWS
        ) {
          continue;
        }

        if (!isWalkableTile(neighborId)) continue;

        neighbors.push(neighborId);
      }

      graph.set(tileId, neighbors);
    }
  }

  return graph;
}

export function getReachableTiles(
  graph,
  startTileId,
  maxSteps,
  blockedTiles = new Set(),
  startRoomId = null
) {
  const traversable = new Set();
  const movable = new Set();
  const distances = new Map();
  const queue = [];

  // -----------------------------
  // 1. Determine starting points
  // -----------------------------

  if (startRoomId) {

    const room = ROOM_DEFS.find(r => r.id === startRoomId);
    const doorTiles = room?.doors || [];
    for (const doorTileId of doorTiles) {

      if (blockedTiles.has(doorTileId)) continue;

      queue.push({
        tileId: doorTileId,
        steps: 1, // leaving room costs 1 step
        visited: new Set([doorTileId])
      });

      const prev = distances.get(doorTileId);

      if (prev === undefined || 1 < prev) {
        distances.set(doorTileId, 1);
      }
    }
  } else {
    queue.push({
      tileId: startTileId,
      steps: 0,
      visited: new Set([startTileId])
    });

    distances.set(startTileId, 0);
  }

  // -----------------------------
  // 2. BFS
  // -----------------------------

  while (queue.length > 0) {

    const current = queue.shift();

    const bestDistance =
      distances.get(current.tileId);

    if (
      bestDistance === undefined ||
      current.steps < bestDistance
    ) {
      distances.set(current.tileId, current.steps);
    }

    if (current.steps > 0) {
      traversable.add(current.tileId);
    }

    if (current.steps === maxSteps) {
      movable.add(current.tileId);
    }

    if (current.steps >= maxSteps) {
      continue;
    }

    const neighbors =
      graph.get(current.tileId) || [];

    for (const neighborId of neighbors) {

      if (current.visited.has(neighborId)) continue;
      if (blockedTiles.has(neighborId)) continue;

      const nextVisited =
        new Set(current.visited);

      nextVisited.add(neighborId);

      queue.push({
        tileId: neighborId,
        steps: current.steps + 1,
        visited: nextVisited
      });
    }
  }

  return {
    traversable,
    movable,
    distances
  };
}

export function getBlockedTiles(
  characters,
  currentCharacterId
) {

  const blocked = new Set();

  for (const character of characters.values()) {

    // don't block self
    if (
      character.character_id ===
      currentCharacterId
    ) {
      continue;
    }

    if (character.currentTileId) {
      blocked.add(character.currentTileId);
    }
  }

  return blocked;
}

export function getReachableRooms(
  distances,
  maxSteps,
  startingRoomId
) {
  const rooms = [];

  for (const room of ROOM_DEFS) {

    if (room.canEnter === false) continue;
    if (room.id === startingRoomId) continue;    

    const canEnterRoom =
      room.doors.some(doorId => {

        const distance =
          distances.get(doorId);

        // Must reach door
        // AND still have 1 move left
        return (
          distance !== undefined &&
          distance < maxSteps
        );
      });

    if (canEnterRoom) {
      rooms.push(room.id);
    }
  }

  return rooms;
}

export function isWalkableTile(tileId) {

  // Explicit exclusions
  if (EXCLUDE_TILES.has(tileId)) {
    return false;
  }

  const [x, y] = tileId
    .split(",")
    .map(Number);

  // Room interiors
  for (const room of ROOM_DEFS) {

    const { rect, excludes } = room;

    const insideRoom =
      x >= rect.x &&
      x < rect.x + rect.w &&
      y >= rect.y &&
      y < rect.y + rect.h;

    if (!insideRoom) continue;

    // Door openings / exclusions remain walkable
    if (excludes.includes(tileId)) {
      return true;
    }

    return false;
  }

  return true;
}

export const BOARD_GRAPH = buildBoardGraph();