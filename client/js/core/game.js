import { setupUserBanner, getUser } from "./utils/user.js";
import * as game from "./gameBoard.js";
import MessageManager from "./utils/MessageManager.js";
import ChatManager from "./utils/ChatManager.js";
import * as colyseushelper from "./colyseus.js";
import { colyseus } from "./colyseus.js";
import UIManager from "./utils/UIManager.js";
import GameActions from "./utils/GameActions.js";
import { on } from "./handlers/colyseusCallbacks.js";
import { EVENTS, FEED_TYPES } from "../../../shared/data/index.js";
import { state } from "../core/gameState.js";

export function init() {
    addEventListeners();  
    setupUserBanner();
    UIManager.init();
    GameActions.register();
    initGameFeeds();
    const params = new URLSearchParams(window.location.search);
    const game_id = params.get("id");
    colyseushelper.joinGame(game_id);  
}

function addEventListeners() {
    document.querySelectorAll(".gamemenuitem").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            if(button.classList.contains("disabled")) return;
            switch(this.id) {
                case "gameactionbtn":
                    UIManager.toggleModal("gameactionModal", this);
                    break;
                case "gamehandbtn":
                    UIManager.toggleModal("gamehandModal", this);
                    break;
                case "gamesheetbtn":
                    let gamesheetModalOpen = UIManager.toggleModal("gamesheetModal", this);
                    if (gamesheetModalOpen) {
                        requestAnimationFrame(() => {
                            truncateSheetHeaders();
                            colorOptionsBoxes();
                            renderSheetFromState();
                        });  
                    }
                    break;
                case "gamemessagebtn":
                    UIManager.toggleModal("gamemessageModal", this);
                    MessageManager.scrollToBottom();   
                    MessageManager.markAllRead();                      
                    const chatsendbox = document.getElementById("chatsendbox");              
                    break;
                default:
                    break;
            }
        });
    });

    document.getElementById("chatsendbox").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            ChatManager.sendMessage();
        }
    });

    document.getElementById("sendbutton").addEventListener("click", async function(e) {
        ChatManager.sendMessage();
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

    setupSheetOptionListeners();

    const canvas = document.getElementById("gameCanvas");
    // Disable default touch scrolling on mobile
    canvas.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchend", e => e.preventDefault(), { passive: false });    
}

function initGameFeeds(){
    MessageManager.init();

    MessageManager.register({
        type: FEED_TYPES.GAME_LOG,
        feed: "gamelogfeed",
        notification: "chatnotification"
    });

    MessageManager.register({
        type: FEED_TYPES.PLAYER_MESSAGE,
        feed: "lobbychatfeed",
        notification: "chatnotification"
    });    
}

function clearGrid() {
    document.querySelectorAll(".sheetBox").forEach(box => {
        box.innerHTML = "";
        box.style.color = "var(--sheet-black)";
    });

    state.sheet.marks = Array.from({ length: 105 }, () => ({ symbol: "", color: "black" }));
    colyseus.send(EVENTS.CLIENT.SHEET_UPDATE, { clear: true });
}

function renderSheetFromState() {
    const boxes = document.querySelectorAll(".sheetBox");
    const marks = state.sheet?.marks || [];

    boxes.forEach((box, index) => {
        const mark = marks[index] || { symbol: "", color: "black" };
        box.textContent = mark.symbol || "";
        box.style.color = mark.symbol ? getSheetColor(mark.color) : "var(--sheet-black)";
    });
}

function updateSheetState(index, symbol, color) {
    state.sheet.marks = state.sheet.marks || Array.from({ length: 105 }, () => ({ symbol: "", color: "black" }));
    state.sheet.marks[index] = { symbol, color };
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
    var colorName = getColorOption();
    var marker = getMarkerOption();
    var color = getSheetColor(colorName);

    if(box.innerHTML !== marker) {
        box.style.color = color;
        box.textContent = marker;
    } else if (box.style.color !== color) {
        box.style.color = color;
    } else {
        box.textContent = "";
        box.style.color = getSheetColor("black");
        marker = "";
        colorName = "black";
    }

    const index = Array.from(document.querySelectorAll('.sheetBox')).indexOf(box);
    if (index >= 0) {
        updateSheetState(index, box.textContent, colorName);
        colyseus.send(EVENTS.CLIENT.SHEET_UPDATE, { mark: { index, symbol: box.textContent, color: colorName } });
    }
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

function getSheetColor(colorName) {
    switch(colorName) {
        case "black":
            return "var(--black)";
        case "blue":
            return "var(--sheet-blue)";
        case "yellow":
            return "var(--sheet-yellow)";
        case "red":
            return "var(--sheet-red)";
        case "green":
            return "var(--sheet-green)";
        case "purple":
            return "var(--sheet-purple)";
        default:
            return "var(--black)";
    }
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