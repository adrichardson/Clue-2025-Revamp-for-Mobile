import { setupUserBanner } from "./utils/user.js";
import * as game from "./gameBoard.js";
import * as chatmodule from "./utils/chat.js";
import * as colyseushelper from "./colyseus.js";
import { colyseus } from "./colyseus.js";
import { setupModal, toggleModal, openModal, closeModal } from "./utils/modalutils.js";
import { EVENTS } from "../../../shared/data/index.js";

export function init() {
    addEventListeners();  
    setupUserBanner();
    setupModal();
    const params = new URLSearchParams(window.location.search);
    const game_id = params.get("id");
    colyseushelper.joinGame(game_id);
}


function addEventListeners() {
    document.querySelectorAll(".gamemenuitem").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            switch(this.id) {
                case "gameactionbtn":
                    toggleModal("gameactionModal", this);
                    break;
                case "gamehandbtn":
                    toggleModal("gamehandModal", this);
                    break;
                case "gamesheetbtn":
                    let gamesheetModalOpen = toggleModal("gamesheetModal", this);
                    if (gamesheetModalOpen) {
                        requestAnimationFrame(() => {
                            truncateSheetHeaders();
                            colorOptionsBoxes();    
                        });  
                    }
                    break;
                case "gamemessagebtn":
                    toggleModal("gamemessageModal", this);
                    const chatsendbox = document.getElementById("chatsendbox");              
                    break;
                default:
                    break;
            }
        });
    });

    document.getElementById("chatsendbox").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            chatmodule.sendMessage();
        }
    });

    document.getElementById("sendbutton").addEventListener("click", async function(e) {
        chatmodule.sendMessage();
    });

    document.getElementById("lobbychatbtn").addEventListener("click", async function(e) {
        chatmodule.toggleMessageFeed("lobby");
    });

    document.getElementById("gamelogbtn").addEventListener("click", async function(e) {
        chatmodule.toggleMessageFeed("game");
    });     

    document.querySelectorAll(".sheetBox").forEach(box => {
        box.addEventListener("click", (e) => {
            e.preventDefault();
            fillBox(box);
        }
    )});

    document.getElementById("clearbtn").addEventListener("click", async function(e) {
        clearGrid();
    });     

    // document.getElementById("rollbtn").addEventListener("click", async function(e) {
    //     console.log("sending roll action");
    //     colyseus.send(EVENTS.CLIENT.ROLLED);
    // });     

    setupSheetOptionListeners();

    const canvas = document.getElementById("gameCanvas");
    // Disable default touch scrolling on mobile
    canvas.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchend", e => e.preventDefault(), { passive: false });    
}

function clearGrid() {
    document.querySelectorAll(".sheetBox").forEach(box => {
        box.innerHTML = "";
    });    
}

function truncateText(el) {
  if (!el.dataset.fullText) {
    el.dataset.fullText = el.textContent;
  }

  let text = el.dataset.fullText;
  el.textContent = text;

  while (el.scrollWidth > el.clientWidth && text.length > 0) {
    text = text.slice(0, -1);
    el.textContent = text;
  }
}

function truncateSheetHeaders() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".sheetColumnHeader span").forEach(el => {
      truncateText(el);
    });
  });
}

function setupSheetOptionListeners() {
    document.querySelectorAll(".optionsMarkerWrapper .markerOption").forEach(option => {
        option.addEventListener("click", () => {   
            document.querySelectorAll(".optionsMarkerWrapper .markerOption").forEach(opt => opt.classList.remove("selected"));
            option.classList.add("selected");
        })});

    document.querySelectorAll(".optionsColorWrapper .colorOption").forEach(option => {
        option.addEventListener("click", () => {   
            document.querySelectorAll(".optionsColorWrapper .colorOption").forEach(opt => opt.classList.remove("selected"));
            option.classList.add("selected");
        })});   
}

function fillBox(box) {
    var white = "var(--white)";
    var color = getColorOption();
    var marker = getMarkerOption();
    switch(color) {
        case "black":
            color = "var(--black)";
            break;
        case "blue":
            color = "var(--sheet-blue)";
            break;
        case "yellow":
            color = "var(--sheet-yellow)";
            break;
        case "red":
            color = "var(--sheet-red)";
            break;
        case "green":
            color = "var(--sheet-green)";
            break;    
        case "purple":
            color = "var(--sheet-purple)";
            break;
        default:
            color = color;
    }    

    if(box.innerHTML !== marker) {
        box.style.color = color;
        box.textContent = marker;
        return;
    } else if (box.style.color !== color) {
        box.style.color = color;
        return;
    }
    box.textContent = "";
}

function colorOptionsBoxes(){
    document.querySelectorAll(".colorOption").forEach(option => {
        const color = option.id.replace("sheet", "").toLowerCase();
        switch(color) {
            case "black":
                option.style.backgroundColor = "var(--black)";
                break;
            case "blue":
                option.style.backgroundColor = "var(--sheet-blue)";
                break;
            case "yellow":
                option.style.backgroundColor = "var(--sheet-yellow)";
                break;
            case "red":
                option.style.backgroundColor = "var(--sheet-red)";
                break;
            case "green":
                option.style.backgroundColor = "var(--sheet-green)";
                break;
            case "purple":
                option.style.backgroundColor = "var(--sheet-purple)";
                break;
            default:
                option.style.backgroundColor = color;
        }
    });    
}

function getColorOption() {
    const options = document.querySelectorAll(".optionsColorWrapper .optionlistWrapper .colorOption");
    for (const option of options) {
        if (option.classList.contains("selected")) {
            return option.id.replace("sheet", "").toLowerCase();
        }
    }
    return "black";
}

function getMarkerOption() {
    const options = document.querySelectorAll(".optionsMarkerWrapper .optionlistWrapper .markerOption");
    for (const option of options) {
        if (option.classList.contains("selected")) {
            return option.innerHTML;
        }
    }
    return "✔";
}