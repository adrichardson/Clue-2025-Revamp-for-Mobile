// board/boardData.js
export const BOARD_ORIGIN_PX = {x: 73,y: 48};
export const TILE_SIZE = {w: 44,h: 44};
export const BOARD_COLS = 24;
export const BOARD_ROWS = 25;

export const ROOMS = [
  {
    id: "study",
    name: "Study",
    x: 0, y: 0, w: 7, h: 4,
    door: new Set(["6,4"])
  },
  {
    id: "hall",
    name: "Hall",
    x: 9, y: 0, w: 6, h: 7,
    door: new Set(["8,4", "11,7", "12,7"])
  },
  {
    id: "lounge",
    name: "Lounge",
    x: 17, y: 0, w: 7, h: 6,
    door: new Set(["17,6"])
  },
  {
    id: "library",
    name: "Library",
    x: 0, y: 6, w: 7, h: 5,
    exclude: new Set(["6,6","6,10"]),
    door: new Set(["7,8", "3,11"])
  },
  {
    id: "billiard",
    name: "Billiard Room",
    x: 0, y: 12, w: 6, h: 5,
    door: new Set(["1,11", "6,15"])
  },
  {
    id: "dining",
    name: "Dining Room",
    x: 16, y: 9, w: 6, h: 7,
    exclude: new Set(["16,15","17,15","18,15"]),
    door: new Set(["17,8", "15,12"])
  },
  {
    id: "conservatory",
    name: "Conservatory",
    x: 0, y: 19, w: 6, h: 5,
    exclude: new Set(["5,19"]),
    door: new Set(["5,19"])
  },
  {
    id: "ballroom",
    name: "Ballroom",
    x: 8, y: 17, w: 8, h: 8,
    exclude: new Set(["8,23","9,23","9,24","14,23","14,24","15,23"]),
    door: new Set(["7,19", "9,16", "14,16", "16,19"])
  },
  {
    id: "kitchen",
    name: "Kitchen",
    x: 18, y: 18, w: 6, h: 7,
    door: new Set(["19,17"])
  }
];
