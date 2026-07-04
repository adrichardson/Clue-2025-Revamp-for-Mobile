import { colyseus } from "../colyseus.js";
import { fitText } from "../utils/utils.js";
import { closeModal } from "../utils/modalutils.js";
import { showToast } from "../utils/utils.js";
import { EVENTS, SUSPECTS, WEAPONS, ROOMS, TOASTS, TOAST_DURATIONS } from "../../../../shared/data/index.js";

let suspectId = null;
let weaponId = null;
let roomId = null;

export function renderSuggestionScreen(container, data) {

  const suggestionHTML = data.isMyTurn ? `
        <div class="suggestionContainer">
            <div class="suggestSection">
                <div class="suggestTitle">SUSPECTS</div>
                <div class="suggestGrid" id="suggestSuspect"></div>
            </div>
            <div class="suggestSection">
                <div class="suggestTitle">WEAPONS</div>
                <div class="suggestGrid" id="suggestWeapon"></div>
            </div>
            <div class="suggestSection">
                <div class="suggestTitle">ROOMS</div>
                <div class="suggestGrid" id="suggestRoom"></div>
            </div>
        </div>
        <div class="button-wrapper actionbutton-wrapper">
            <div class="interactable-button actionbtn disabled" id="submitbtn">SUBMIT</div>
        </div>`
        : 
        `<div class="button-wrapper actionbutton-wrapper">
            <div class="interactable-button actionbtn" id="okbtn">OK</div>
        </div`;    

  container.innerHTML = `
    <div class="actionmessage"> ${data.message} </div>  
    <div class="actionarea">
        ${suggestionHTML}
    </div>
  `;

  if(data.isMyTurn)
  {
   SUSPECTS.forEach(suspect => {
    const btn = document.createElement("div");
    btn.classList.add("suggestionOption");
    btn.id = `suggestSuspect-${suspect.id}`;
    btn.textContent = suspect.name;
    document.querySelector("#suggestSuspect").appendChild(btn);
    requestAnimationFrame(() => {
        fitText(btn);
    });
   });

   WEAPONS.forEach(weapon => {
    const btn = document.createElement("div");
    btn.classList.add("suggestionOption");
    btn.id = `suggestWeapon-${weapon.id}`;
    btn.textContent = weapon.name;
    document.querySelector("#suggestWeapon").appendChild(btn);
    requestAnimationFrame(() => {
        fitText(btn);
    });
   });

   ROOMS.forEach(room => {
    const btn = document.createElement("div");
    btn.classList.add("suggestionOption");
    btn.id = `suggestRoom-${room.imagetag}`;
    btn.textContent = room.name;
    document.querySelector("#suggestRoom").appendChild(btn);
    requestAnimationFrame(() => {
        fitText(btn);
    });   
   });

   document.querySelectorAll(".suggestionOption").forEach(btn => {
        const [type, id] = btn.id.split("-");
        btn.addEventListener("click", () => {
            if(type == "suggestSuspect" || type == "suggestWeapon" || (type == "suggestRoom" && data.isFinal) ) {
                const oldSelection = btn.parentElement.querySelectorAll(".selected")[0];
                if (oldSelection != btn) {
                    oldSelection?.classList.toggle("selected");
                }
                btn.classList.toggle("selected");
            }
            
            const selectedSuspect = document.querySelector(".suggestionOption.selected[id^='suggestSuspect']");
            const selectedWeapon = document.querySelector(".suggestionOption.selected[id^='suggestWeapon']");
            const selectedRoom = document.querySelector(".suggestionOption.selected[id^='suggestRoom']");
            if (selectedSuspect && selectedWeapon && selectedRoom) {
                suspectId = selectedSuspect.id.split("-")[1];
                weaponId = selectedWeapon.id.split("-")[1];
                roomId =selectedRoom.id.split("-")[1];
                document.querySelector("#submitbtn").classList.remove("disabled");
            } else {
                document.querySelector("#submitbtn").classList.add("disabled");
            }
        });
    });

    roomId = data.room?.id;
    const roomBtn = document.querySelector(`#suggestRoom-${roomId}`);    
    if (roomId && roomBtn) {
        roomBtn.classList.add("selected");
    }

    container.querySelector("#submitbtn").addEventListener("click", () => {
        if (document.querySelector("#submitbtn").classList.contains("disabled")) {
            showToast("Please make a full accusation.", TOASTS.WARNING, TOAST_DURATIONS.ALERT);
            return;
        }
        const suggestion = { suspectId,  weaponId,  roomId };
        console.log(suggestion);
        console.log(data);
        if(data.isFinal) {
            console.log("making final");
            colyseus.send(EVENTS.CLIENT.SUBMIT_FINAL, suggestion);
        } else {
            colyseus.send(EVENTS.CLIENT.SUGGESTED, suggestion);
        }
        
    }); 
  }
    container.querySelector("#okbtn")?.addEventListener("click", () => {
        const openModal = document.querySelector(".modal.open");
        closeModal(openModal);
    });      
}