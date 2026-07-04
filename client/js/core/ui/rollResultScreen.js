import { closeModal } from "../utils/modalutils.js";
import { EVENTS } from "../../../../shared/data/index.js";


export function renderRollResultScreen(container, data) {

  container.innerHTML = `
    <div class="actionmessage">
        ${data.message}
    </div>  
    <div class="actionarea">
      <div class="button-wrapper">    
        <div class="interactable-button actionbtn" id="okbtn">OK</div>
      </div>
    </div>
  `;

  container.querySelector("#okbtn").addEventListener("click", () => {
      const openModal = document.querySelector(".modal.open");
      closeModal(openModal);
  });
}