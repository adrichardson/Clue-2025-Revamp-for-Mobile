import * as chatmodule from "./utils/chat.js";
import * as colyseushelper from "./colyseus.js";
import { colyseus } from "./colyseus.js";
import {updateSelectedImageColor, updateSelectedImageTag, getCharacterHexColorById} from "./utils/imagehelper.js";
import { getUser, setupUserBanner} from "./utils/user.js";
import { setupModal, toggleModal } from "./utils/modalutils.js";
import { EVENTS } from "../../../shared/data/index.js";
import { initGameLobbyHandlers } from "./handlers/gameLobbyHandlers.js";

export function init() {
    addEventListeners();    
    setupUserBanner();
    setupModal();
    initGameLobbyHandlers();
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
                var user = await getUser();                 
                colyseus.send("startgame", { user } );
            }
        });
    });

    document.querySelectorAll(".character-pic-option").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            const newtag = button.querySelector(".characteroption");  
            if(newtag.innerHTML != 'Select' && newtag.innerHTML != 'You') return;

            if(newtag.innerHTML === 'You'){
                var character_id = -1
            } else {
                const newimage = button.querySelector("img");
                var character_id = await chatmodule.getCharacterIdByAltTag(newimage.alt);                           
            }
            var user = await getUser();
            colyseus.send(EVENTS.GAME_LOBBY.CHARACTER_CHANGE, { user : user, character_id : character_id});     
        });
    });

    let chatbox = document.getElementById("gamemessagebtn");
    chatbox.addEventListener("click", async function(e) {
        chatbox.classList.add("hidden");
        toggleModal("gamemessageModal", this);
        const chatsendbox = document.getElementById("chatsendbox");        
        chatsendbox.focus();
        chatsendbox.select();        
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
}

export async function checkGameStartConditions(readyvalue) {
    let user = await getUser();

    if (!user || colyseus.gamelobby.metadata.owner != user.username) return;

    let startgamebtn = document.getElementById("startgamebtn");
    let leavegamebtn = document.getElementById("leavebtn");

    if (readyvalue){
        leavegamebtn.classList.add("hidden");        
        startgamebtn.classList.remove("hidden");
    } else {
        startgamebtn.classList.add("hidden");
        leavegamebtn.classList.remove("hidden");               
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
        const newimagealt = chatmodule.getCharacterAltTagById(character_id);
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