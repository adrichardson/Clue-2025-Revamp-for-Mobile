import { colyseus } from "../colyseus.js";
import { closeModal } from "../utils/modalutils.js";
import { EVENTS } from "../../../../shared/data/index.js";


export function renderObjectionScreen(container, data) {

    console.log("recieved objection data", data);

    const objectionHTML = data.objector ? `
        <div class="objectionCardHolder">
            ${data.suggestion?.cards.map(card => `
                <div class="card" data-card-id="${card.id}" data-card-type="${card.type}">
                <img 
                    src="../assets/imgs/${card.type}/${card.imagetag}.png"
                    class="cardimage"
                >
                </div>
            `).join("")}
        </div>
        <div class="button-wrapper actionbutton-wrapper">
            <div class="interactable-button actionbtn disabled" id="showbtn">SHOW</div>
        </div>`
        : 
        `<div class="button-wrapper actionbutton-wrapper">
            <div class="interactable-button actionbtn" id="okbtn">OK</div>
        </div`;
    container.innerHTML = `
        <div class="actionmessage"> ${data.message} </div>  
        <div class="actionarea">
            ${objectionHTML}
        </div>`

    container.querySelector("#okbtn")?.addEventListener("click", () => {
        const openModal = document.querySelector(".modal.open");
        closeModal(openModal);
    });
    container.querySelector("#showbtn")?.addEventListener("click", () => {
        if(container.querySelector("#showbtn")?.classList.contains("disabled")) return;
        const showcard = container.querySelector(".card.selected");
        const cardId = showcard.dataset.cardId;
        const cardType = showcard.dataset.cardType;
        const cardData = {cardId, cardType};
        colyseus.send(EVENTS.CLIENT.OBJECTED, cardData);
        const openModal = document.querySelector(".modal.open");
        closeModal(openModal);        
    });    
    container.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const showbtn = document.querySelector("#showbtn");            
            const selectedCard = container.querySelector(".card.selected");
            if(selectedCard) {
                selectedCard?.classList.remove("selected");
                selectedCard != card ? card.classList.add("selected") && showbtn.classList.remove("disabled") : showbtn.classList.add("disabled");
            } else {
                card.classList.add("selected");
                showbtn.classList.remove("disabled");
            }
        });
    });
}