import { colyseus } from "../colyseus.js";
import { closeModal } from "../utils/modalutils.js";
import { EVENTS } from "../../../../shared/data/index.js";


export function renderTurnStartScreen(container, data) {
  const btnHTML = data.isMyTurn ? `
        <div class="interactable-button actionbtn ${(data.pass.mustPass || (data.pass.cantleaveroom && (data.passage.canPassage || data.canStay)))? "disabled" : ""}" id="rollbtn">ROLL</div>
        <div class="interactable-button actionbtn ${data.canStay ? "" : "disabled"}" id="staybtn">STAY</div>
        <div class="interactable-button actionbtn ${data.passage.canPassage ? "" : "disabled"}" id="passagebtn">PASSAGE</div>
        <div class="interactable-button actionbtn ${data.pass.mustPass ? "" : "disabled"}" id="passbtn">PASS</div>`
        : 
        `<div class="interactable-button actionbtn" id="okbtn">OK</div>`;

  container.innerHTML = `
    <div class="actionmessage"> ${data.message} </div>  
    <div class="actionarea">
      <div class="button-wrapper">
        ${btnHTML}
      </div>    
    </div>
  `;

  container.querySelector("#rollbtn")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (btn.classList.contains("disabled")) return;
      console.log("sending roll action");
      colyseus.send(EVENTS.CLIENT.ROLLED);
  });

  container.querySelector("#staybtn")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (btn.classList.contains("disabled")) return;    
      console.log("staying in room action");
      colyseus.send(EVENTS.CLIENT.MOVED, { tileId: null, roomId: null, stay: true, pass: false, passage: false });
  });

  container.querySelector("#passagebtn")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (btn.classList.contains("disabled")) return;    
      console.log("secret passage to ", data.passage.room);
      colyseus.send(EVENTS.CLIENT.MOVED, { tileId: null, roomId: data.passage?.room, stay: false, pass: false, passage: true });
  });  

  container.querySelector("#passbtn")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (btn.classList.contains("disabled")) return;    
      console.log("unable to move, passing");
      colyseus.send(EVENTS.CLIENT.MOVED, { tileId: null, roomId: null, stay: true, pass: true, passage: false });
  });   

  container.querySelector("#okbtn")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (btn.classList.contains("disabled")) return;    
      const openModal = document.querySelector(".modal.open");
      closeModal(openModal);
  });  
}