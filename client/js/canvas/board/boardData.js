export const BOARD_ORIGIN_PX = { x: 73, y: 48 };
export const TILE_SIZE = { w: 44, h: 44 };
export const BOARD_COLS = 24;
export const BOARD_ROWS = 25;

export const ROOM_DEFS = [
  {
    id: "study",
    name: "Study",
    rect: { x: 0, y: 0, w: 7, h: 4 },
    doors: ["6,4"],
    excludes: []
  },
  {
    id: "hall",
    name: "Hall",
    rect: { x: 9, y: 0, w: 6, h: 7 },
    doors: ["8,4", "11,7", "12,7"],
    excludes: []
  },
  {
    id: "lounge",
    name: "Lounge",
    rect: { x: 17, y: 0, w: 7, h: 6 },
    doors: ["17,6"],
    excludes: []
  },
  {
    id: "library",
    name: "Library",
    rect: { x: 0, y: 6, w: 7, h: 5 },
    doors: ["7,8", "3,11"],
    excludes: ["6,6", "6,10"]
  },
  {
    id: "billiard",
    name: "Billiard Room",
    rect: { x: 0, y: 12, w: 6, h: 5 },
    doors: ["1,11", "6,15"],
    excludes: []
  },
  {
    id: "dining",
    name: "Dining Room",
    rect: { x: 16, y: 9, w: 6, h: 7 },
    doors: ["17,8", "15,12"],
    excludes: ["16,15", "17,15", "18,15"]
  },
  {
    id: "conservatory",
    name: "Conservatory",
    rect: { x: 0, y: 19, w: 6, h: 5 },
    doors: ["5,19"],
    excludes: ["5,19"]
  },
  {
    id: "ballroom",
    name: "Ballroom",
    rect: { x: 8, y: 17, w: 8, h: 8 },
    doors: ["7,19", "9,16", "14,16", "16,19"],
    excludes: ["8,23", "9,23", "9,24", "14,23", "14,24", "15,23"]
  },
  {
    id: "kitchen",
    name: "Kitchen",
    rect: { x: 18, y: 18, w: 6, h: 7 },
    doors: ["19,17"],
    excludes: []
  }
];
