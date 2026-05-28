import { Schema, defineTypes } from "@colyseus/schema";
import { CARD_TYPES } from "../../../shared/data/index.js";

const CardTypesSet = new Set(Object.values(CARD_TYPES));

export class Card extends Schema {
  constructor(name = "", type = CARD_TYPES.PERSON, imagetag = "", id = 0) {
    super();

    type = type.toLowerCase();

    if (!CardTypesSet.has(type)) {
      throw new Error(`Invalid card type: ${type}`);
    }

    this.name = name;
    this.type = type;
    this.id = id;
    this.imagetag = imagetag;
  }
}

defineTypes(Card, {
  name: "string",
  id: "int32",
  type: "string",
  imagetag: "string",
});