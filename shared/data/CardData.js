import { CARD_TYPES } from "./index.js";

export const SUSPECTS = [
  { id: 0, name: "Miss Scarlet", type: CARD_TYPES.PERSON, imagetag: "msscarlet" },
  { id: 1, name: "Mrs. Peacock", type: CARD_TYPES.PERSON, imagetag: "mrspeacock" },
  { id: 2, name: "Mrs. White", type: CARD_TYPES.PERSON, imagetag: "mrswhite" },
  { id: 3, name: "Mr. Green", type: CARD_TYPES.PERSON, imagetag: "mrgreen" },  
  { id: 4, name: "Prof. Plum", type: CARD_TYPES.PERSON, imagetag: "profplum" },
  { id: 5, name: "Col. Mustard", type: CARD_TYPES.PERSON, imagetag: "colmustard" }
];

export const WEAPONS = [
  { id: 0, name: "Candlestick", type: CARD_TYPES.WEAPON, imagetag: "candlestick" },
  { id: 1, name: "Knife", type: CARD_TYPES.WEAPON, imagetag: "knife" },
  { id: 2, name: "Lead Pipe", type: CARD_TYPES.WEAPON, imagetag: "leadpipe" },
  { id: 3, name: "Revolver", type: CARD_TYPES.WEAPON, imagetag: "revolver" },
  { id: 4, name: "Rope", type: CARD_TYPES.WEAPON, imagetag: "rope" },
  { id: 5, name: "Wrench", type: CARD_TYPES.WEAPON, imagetag: "wrench" }
];

export const ROOMS = [
  { id: 0, name: "Study", type: CARD_TYPES.ROOM, imagetag: "study" },
  { id: 1, name: "Hall", type: CARD_TYPES.ROOM, imagetag: "hall" },
  { id: 2, name: "Lounge", type: CARD_TYPES.ROOM, imagetag: "lounge" },
  { id: 3, name: "Library", type: CARD_TYPES.ROOM, imagetag: "library" },
  { id: 4, name: "Billiard Room", type: CARD_TYPES.ROOM, imagetag: "billiardroom" },
  { id: 5, name: "Dining Room", type: CARD_TYPES.ROOM, imagetag: "diningroom" },
  { id: 6, name: "Conservatory", type: CARD_TYPES.ROOM, imagetag: "conservatory" },
  { id: 7, name: "Ballroom", type: CARD_TYPES.ROOM, imagetag: "ballroom" },
  { id: 8, name: "Kitchen", type: CARD_TYPES.ROOM, imagetag: "kitchen" }
];

export const ALL_CARDS = [
  ...SUSPECTS,
  ...WEAPONS,
  ...ROOMS
];