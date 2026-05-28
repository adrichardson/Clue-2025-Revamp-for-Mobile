export const BOARD_ORIGIN_PX = { x: 73, y: 50};
export const TILE_SIZE = { w: 42, h: 42 };

export const BOARD_ROWS = 25;
export const ROW_OFFSETS = [
  0, 42, 84, 126, 168, 
  210, 252, 295, 338, 380,
  424, 464, 507, 549, 591,
  634, 676, 719, 762, 804,
  845, 887, 930, 975, 1017
];

export const BOARD_COLS = 24;
export const COL_OFFSETS = [
  0.5, 43, 85.5, 128.3, 170, 
  212, 255, 296, 339, 381,
  424, 467, 509, 550, 593,
  635, 678, 720, 763, 805,
  846, 888, 931, 973
];

export const EXCLUDE_TILES = new Set([
  "0,4", "0,6", "0,10", "0,11","0,17", "0,19",
  "0,24", "1,24", "2,24", "3,24", "4,24", "5,24", "6,24", "7,24", "8,24",
  "15,24", "16,24", "17,24", "18,24", "19,24", "20,24", "21,24", "22,24", "23,24",
  "23,18", "23,16", "23,8", "23,6",
  "17,0", "15,0", "8,0",
  "6,23", "17,23"
]);

export const ROOM_DEFS = [
  {
    id: "study",
    name: "Study",
    rect: { x: 0, y: 0, w: 7, h: 4 },
    doors: ["6,4"],
    passage: "kitchen",
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
    passage: "conservatory",    
    excludes: ["17,0"]
  },
  {
    id: "library",
    name: "Library",
    rect: { x: 0, y: 6, w: 7, h: 5 },
    doors: ["7,8", "3,11"],
    excludes: ["6,6", "6,10", "0,6", "0,10"]
  },
  {
    id: "billiardroom",
    name: "Billiard Room",
    rect: { x: 0, y: 12, w: 6, h: 5 },
    doors: ["1,11", "6,15"],
    excludes: []
  },
  {
    id: "diningroom",
    name: "Dining Room",
    rect: { x: 16, y: 9, w: 8, h: 7 },
    doors: ["17,8", "15,12"],
    excludes: ["16,15", "17,15", "18,15"]
  },
  {
    id: "conservatory",
    name: "Conservatory",
    rect: { x: 0, y: 19, w: 6, h: 5 },
    doors: ["5,19"],
    passage: "lounge",
    excludes: ["5,19", "0,19"]
  },
  {
    id: "ballroom",
    name: "Ballroom",
    rect: { x: 8, y: 17, w: 8, h: 8 },
    doors: ["7,19", "9,16", "14,16", "16,19"],
    excludes: ["8,23", "9,23", "9,24", "14,23", "14,24", "15,23", "8,24", "15,24"]
  },
  {
    id: "kitchen",
    name: "Kitchen",
    rect: { x: 18, y: 18, w: 6, h: 6 },
    doors: ["19,17"],
    passage: "study",    
    excludes: ["23,18"]
  },
  {
    id: "stairs",
    name: "Stairs",
    rect: { x: 9, y: 8, w: 5, h: 7 },
    doors: [],
    excludes: [],
    canEnter: false
  }  
];