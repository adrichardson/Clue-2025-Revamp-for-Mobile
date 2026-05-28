import { colyseus } from "../colyseus.js";
import { closeModal } from "../utils/modalutils.js";
import { EVENTS } from "../../../../shared/data/index.js";


export function renderObjectionFoundScreen(container, data) {

    console.log("recieved a card", data);

    const objectionHTML = `
        <div class="objectionCardHolder">
            <div class="card" data-card-id="${data.card.id}" data-card-type="${data.card.type}">
            <img 
                src="../assets/imgs/${data.card.type}/${data.card.imagetag}.png"
                class="cardimage"
            >
            </div>
        </div>
        <div class="button-wrapper actionbutton-wrapper">
            <div class="interactable-button actionbtn" id="okbtn">OK</div>
        </div>`
    container.innerHTML = `
        <div class="actionmessage"> ${data.message} </div>  
        <div class="actionarea">
            ${objectionHTML}
        </div>`

    container.querySelector("#okbtn")?.addEventListener("click", () => {
        const openModal = document.querySelector(".modal.open");
        closeModal(openModal);
        colyseus.send(EVENTS.CLIENT.NEW_TURN); //TODO CHECK THIS CAREFULLY
    });
}