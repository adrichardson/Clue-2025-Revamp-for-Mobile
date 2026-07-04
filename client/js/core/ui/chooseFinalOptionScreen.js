import { closeModal } from "../utils/modalutils.js";
import { colyseus } from "../colyseus.js";
import { EVENTS } from "../../../../shared/data/index.js";


export function renderChooseFinalOptionScreen(container, data) {

const chooseFinalHTML = data.isMyTurn ? `
      <div class="button-wrapper">
        <div class="interactable-button actionbtn makefinalbtn" id="makefinalbtn">MAKE FINAL</div>      
        <div class="interactable-button actionbtn endturnbtn" id="endturnbtn">END TURN</div>
      </div>` 
      :
      `<div class="button-wrapper">    
        <div class="interactable-button actionbtn" id="okbtn">OK</div>
      </div>`

  container.innerHTML = `
    <div class="actionmessage">
        ${data.message}
    </div>  
    <div class="actionarea">
      <div class="button-wrapper">
        ${chooseFinalHTML}
      </div>
    </div>
  `;

  container.querySelector("#makefinalbtn")?.addEventListener("click", () => {
    colyseus.send(EVENTS.CLIENT.CHOOSE_FINAL);
  });

  container.querySelector("#endturnbtn")?.addEventListener("click", () => {
      colyseus.send(EVENTS.CLIENT.NEW_TURN); //TODO CHECK THIS CAREFULLY
  });

  container.querySelector("#okbtn")?.addEventListener("click", () => {
      const openModal = document.querySelector(".modal.open");
      closeModal(openModal);
  }); 
}