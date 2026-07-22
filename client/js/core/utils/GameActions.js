import UIManager from "./UIManager.js";
import { colyseus } from "../colyseus.js";
import { EVENTS } from "../../../../shared/data/EventData.js";

class GameActions {
    register() {
        UIManager.registerAction("roll",  button => {
            if(UIManager.isDisabled(button)) return;
            colyseus.send(EVENTS.CLIENT.ROLLED);
        });

        UIManager.registerAction("stay",  button => {
            if(UIManager.isDisabled(button)) return;
            colyseus.send(EVENTS.CLIENT.MOVED, { tileId: null, roomId: null, stay: true, pass: false, passage: false });
        });        

        UIManager.registerAction("passage",  (button, data) => {
            if(UIManager.isDisabled(button)) return;
            colyseus.send(EVENTS.CLIENT.MOVED, { tileId: null, roomId: data.passage?.room, stay: false, pass: false, passage: true });
        });        

        UIManager.registerAction("pass",  button => {
            if(UIManager.isDisabled(button)) return;
            colyseus.send(EVENTS.CLIENT.MOVED, { tileId: null, roomId: null, stay: true, pass: true, passage: false });
        });

        UIManager.registerAction("makefinal",  button => {
            if(UIManager.isDisabled(button)) return;
            colyseus.send(EVENTS.CLIENT.CHOOSE_FINAL);
        });

        UIManager.registerAction("endturn",  button => {
            if(UIManager.isDisabled(button)) return;
            colyseus.send(EVENTS.CLIENT.NEW_TURN); //TODO CHECK THIS CAREFULLY
        });

        UIManager.registerAction("leavegame",  button => {
            if(UIManager.isDisabled(button)) return;
            window.location.href = `/home`;
        });        
        

        UIManager.registerAction("showcard",  (button, data, container) => {
            if(UIManager.isDisabled(button)) return;
            const showcard = container.querySelector(".card.selected");
            const cardId = showcard.dataset.cardId;
            const cardType = showcard.dataset.cardType;
            const cardData = {cardId, cardType};
            colyseus.send(EVENTS.CLIENT.OBJECTED, cardData);
            const openModal = document.querySelector(".modal.open");
            UIManager.toggleModal(openModal); 
        });                  
    }
}

export default new GameActions();