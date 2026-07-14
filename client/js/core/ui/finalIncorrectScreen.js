import { closeModal } from "../utils/modalutils.js";
import { colyseus } from "../colyseus.js";
import { EVENTS } from "../../../../shared/data/index.js";


export function renderFinalIncorrectScreen(container, data) {

const failedFinalHTML = data.isMyTurn ? `
      <div class="button-wrapper">    
        <div class="interactable-button actionbtn" id="okbtncurrplayer">OK</div>
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
        ${failedFinalHTML}
      </div>
    </div>
  `;

  container.querySelector("#okbtn")?.addEventListener("click", () => {
      const openModal = document.querySelector(".modal.open");
      closeModal(openModal);
  });

  container.querySelector("#okbtncurrplayer")?.addEventListener("click", () => {
      colyseus.send(EVENTS.CLIENT.NEW_TURN); //TODO CHECK THIS CAREFULLY
  });
}