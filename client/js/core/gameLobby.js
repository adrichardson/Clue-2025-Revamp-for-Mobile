import MessageManager from "./utils/MessageManager.js";
import ChatManager from "./utils/ChatManager.js";
import * as colyseushelper from "./colyseus.js";
import { colyseus } from "./colyseus.js";
import {updateSelectedImageColor, updateSelectedImageTag, getCharacterHexColorById, getCharacterIdByAltTag, getCharacterAltTagById} from "./utils/imagehelper.js";
import { getUser, setupUserBanner} from "./utils/user.js";
import UIManager from "./utils/UIManager.js";
import { EVENTS, FEED_TYPES } from "../../../shared/data/index.js";
import { initGameLobbyHandlers } from "./handlers/gameLobbyHandlers.js";

let gamestarting = false;
let startGameInterval = null;

export function init() {
    addEventListeners();    
    setupUserBanner();
    UIManager.init();
    initGameLobbyHandlers();
    initGameLobbyFeeds();
    const params = new URLSearchParams(window.location.search);
    const game_id = params.get("id");
    colyseushelper.joinGameLobby(game_id);
}

function addEventListeners() {
    document.querySelectorAll(".interactable-button").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            if (button.classList.contains("disabled")) return;
            if (button.textContent === "Ready") {
                var user = await getUser();                
                colyseus.send(EVENTS.GAME_LOBBY.READYSTATE_CHANGE, { user });
                button.classList.add("hidden");
                document.getElementById("cancelbtn").classList.remove("hidden");
            } else if (button.textContent === "Leave") {
                 window.history.back();
            } else if(button.textContent === "Cancel"){
                var user = await getUser();                
                colyseus.send(EVENTS.GAME_LOBBY.READYSTATE_CHANGE, { user });
                button.classList.add("hidden");
                document.getElementById("readybtn").classList.remove("hidden");            
            } else if(button.textContent === "Start Game"){
                if (gamestarting || startGameInterval) return;
                startGame();
            }
        });
    });

    document.querySelectorAll(".character-pic-option").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            if (gamestarting || startGameInterval) return;
            const newtag = button.querySelector(".characteroption");  
            if(newtag.innerHTML != 'Select' && newtag.innerHTML != 'You') return;

            if(newtag.innerHTML === 'You'){
                var character_id = -1
            } else {
                const newimage = button.querySelector("img");
                var character_id = await getCharacterIdByAltTag(newimage.alt);                           
            }
            var user = await getUser();
            colyseus.send(EVENTS.GAME_LOBBY.CHARACTER_CHANGE, { user : user, character_id : character_id});     
        });
    });

    const chatbox = document.getElementById("gamemessagebtn");
    const chatsendbox = document.getElementById("chatsendbox");
    const sendbtn = document.getElementById("sendbutton");

    chatbox.addEventListener("click", async function(e) {
        chatbox.classList.add("hidden");
        UIManager.toggleModal("gamemessageModal", this);
        MessageManager.scrollToBottom();   
        MessageManager.markAllRead();          
    });

   chatsendbox.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && chatsendbox.value!== "") {
            ChatManager.sendMessage();
        }
    });

    sendbtn.addEventListener("click", async function(e) {
        if (chatsendbox.value!== "") {
            ChatManager.sendMessage();
        }
    }); 
}

function initGameLobbyFeeds(){
    MessageManager.init();

    MessageManager.register({
        type: FEED_TYPES.PLAYER_MESSAGE,
        feed: "lobbychatfeed",
        notification: "chatnotification"
    });

    MessageManager.register({
        type: FEED_TYPES.GAME_LOG,
        feed: "gamelogfeed",
        notification: "chatnotification"
    });    
}

async function startGame() {
    const user = await getUser();
    colyseus.send(EVENTS.GAME_LOBBY.START_GAME_REQUEST, { user });
}


function clearLobbyCountdown() {
    if (startGameInterval) {
        clearInterval(startGameInterval);
        startGameInterval = null;
    }
    gamestarting = false;
}

export function startLobbyCountdown(seconds = 5) {
    const countdownEl = document.getElementById("lobby-status");
    const startgamebtn = document.getElementById("startgamebtn");

    if (!countdownEl || gamestarting) return;

    clearLobbyCountdown();
    gamestarting = true;

    startgamebtn?.classList.add("hide");
    countdownEl.textContent = `Game starting in ... ${seconds}`;

    startGameInterval = setInterval(() => {
        seconds -= 1;

        if (seconds < 0) {
            clearLobbyCountdown();
            return;
        }

        countdownEl.textContent = `Game starting in ... ${seconds}`;
    }, 1000);
}

export function cancelLobbyCountdown() {
    clearLobbyCountdown();
    const countdownEl = document.getElementById("lobby-status");
    if (countdownEl) {
        countdownEl.textContent = "Waiting for Players...";
    }
}

export async function checkGameStartConditions(readyvalue) {
    let user = await getUser();

    if (!user || colyseus.gamelobby.metadata.owner !== user.username) return;   

    let startgamebtn = document.getElementById("startgamebtn");
    let leavegamebtn = document.getElementById("leavebtn");
    let countdownEl = document.getElementById("lobby-status");

    if (readyvalue){
        leavegamebtn?.classList.add("hidden");        
        startgamebtn?.classList.remove("hidden");
        startgamebtn?.classList.remove("hide");
    } else {
        startgamebtn?.classList.add("hidden");
        leavegamebtn?.classList.remove("hidden");         
        if (gamestarting) {
            cancelLobbyCountdown();
        }           
    }
}

export function getTagByImageAltTag(id){
    let newtag = null;
     document.querySelectorAll(".character-pic-option").forEach(option => {
        let tag = option.querySelector(".characteroption");           
        const image = option.querySelector("img");        
        if (image.alt === id) {
            newtag = tag;
        }
     });
     return newtag;
}

export function getImageByAltTag(alt){
    let newimage = null;
     document.querySelectorAll(".character-pic-option").forEach(option => { 
        let image = option.querySelector("img");        
        if (image.alt === alt) {
            newimage = image;
        }
     });
     return newimage;
}

export function getElementsByUsername(username){
    let elements = {tag : null, image: null};
     document.querySelectorAll(".character-pic-option").forEach(option => { 
        let tag = option.querySelector(".characteroption");        
        let image = option.querySelector("img");   
        if (tag.innerHTML === username) {
            elements.tag = tag;
            elements.image = image;            
        }
     });
     return elements;
}

export function toggleGrayscale(image) {
  if (!image) return;

  if (image.src.includes("-grayscale")) {
    image.src = image.src.replace("-grayscale", "");
  } else {
    image.src = image.src.replace(".png", "-grayscale.png");
  }
}

export function clearUserCharacter(username){
    let prevelements = getElementsByUsername(username);
    let prevtag = prevelements.tag;
    let previmage = prevelements.image;
    if (prevtag != null) {
        prevtag.innerHTML = 'Select';
        let prevcheck = prevtag.parentElement.querySelector(".checksvg");        
        updateSelectedImageTag("remove", prevtag);
        toggleGrayscale(previmage);
        if(self){
            prevtag.classList.remove("selected");
            previmage.classList.remove("selected");
            prevcheck.classList.remove("selected");
        }
    }
}

export async function updateLobbyCharacters(player, character_id){
    let self = false;
    let username = "";
    let user = await getUser();
    if(user.username == player.username) {
        self = true;
        username = "You";
    } else {
        username = player.username;
    }

    clearUserCharacter(username);

    if(character_id == -1 && self) {
        const characterinfo = document.getElementById("characterinfowrapper");             
        updateSelectedImageColor('spectator');
        characterinfo.innerHTML = 'Spectator';          

    } else if (character_id== -1) {
        return;
    } else {
        const newimagealt = getCharacterAltTagById(character_id);
        const newtag = getTagByImageAltTag(newimagealt);
        const newimage = getImageByAltTag(newimagealt);
        const newcheck = newimage.parentElement.querySelector(".checksvg");
        if(player.readystate){
            var checkboxColor = getCharacterHexColorById(character_id); 
            newcheck.style.setProperty('--checkmark-color', checkboxColor);
            newcheck.classList.add("selected");         
        } else {
            newcheck.classList.remove("selected");
        }
        newtag.innerHTML = username;
        toggleGrayscale(newimage);
        updateSelectedImageTag(newimage.id, newtag);
        if (self){
            const characterinfo = document.getElementById("characterinfowrapper");        
            newimage.classList.add("selected");
            newtag.classList.add("selected");              
            updateSelectedImageColor(newimage.id);
            characterinfo.innerHTML = newimage.alt; 
        }
    }
}

export function updateAvailableCharacters(){
    document.querySelectorAll(".character-pic-option").forEach(option => {
        const tag = option.querySelector(".characteroption");
        if(tag.classList.contains("selected") || tag.innerHTML!='Select') return;
        tag.innerHTML = "Select";
    });
}

export async function setLobbyTitle(metadata) {
    let owner = metadata.owner;
    let maxplayers = metadata.maxplayers;
    let currentplayers = metadata.currentplayers;
    let mode = metadata.mode;
    //Username's Lobby<br />Standard (1/6)
    document.getElementById('lobbytitle').innerHTML = `${owner}'s Lobby<br / >${mode} (${currentplayers}/${maxplayers})`;
}