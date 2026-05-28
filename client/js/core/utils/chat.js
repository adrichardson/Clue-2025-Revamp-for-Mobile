import { getUser } from "../utils/user.js";
import { colyseus } from "../colyseus.js";
import { getCharacterHexColorById } from "./imagehelper.js";
import { modalIsOpen } from "./modalutils.js";
import { EVENTS } from "../../../../shared/data/index.js";

let unreadmessagecount = 0;

export function toggleMessageFeed(feedType) {
    const gamefeed = document.getElementById("gamelogfeed");
    const lobbyfeed = document.getElementById("lobbychatfeed");

    if (feedType === "game") {
        document.getElementById("gamelogbtn").classList.add("selected");
        document.getElementById("lobbychatbtn").classList.remove("selected");
        gamefeed.classList.remove("hidden");   
        lobbyfeed.classList.add("hidden");      
        let messagecontainer = gamefeed.querySelector(".messages");
        messagecontainer.scrollTop = messagecontainer.scrollHeight;        
    } else if (feedType === "lobby") {
        document.getElementById("gamelogbtn").classList.remove("selected");
        document.getElementById("lobbychatbtn").classList.add("selected");
        lobbyfeed.classList.remove("hidden");   
        gamefeed.classList.add("hidden");  
        let messagecontainer = lobbyfeed.querySelector(".messages");
        messagecontainer.scrollTop = messagecontainer.scrollHeight;            
    }
}

export async function sendMessage(){
    let user = await getUser();
    let chatbox = document.getElementById("chatsendbox");
    let message = chatbox.value;
    chatbox.value = "";
    colyseus.send(EVENTS.CLIENT.CHAT_MESSAGE, { message : message, user : user});
}

export function updateChatNotification(count) {
  const bubble = document.querySelector('.chat-notification');

  if (count > 0) {
    bubble.textContent = count;
    bubble.classList.remove("hidden");

    // Reset animation so it re-triggers even if it already exists
    bubble.style.animation = 'none';
    void bubble.offsetWidth; // Force reflow
    bubble.style.animation = 'pop 0.3s ease-out';
  } else {
    bubble.classList.add("hidden"); // Hide when no messages
  }
}

export function createChatMessage(usernametext, color, message, eventtype) {

    let chatfeed = null;

    if(eventtype === "player" && lobbychatfeed) {
        chatfeed = document.getElementById("lobbychatfeed");;
    } else if (eventtype === "server" && gamelogfeed) {
        chatfeed = document.getElementById("gamelogfeed");;
    }

    let chatmessage = document.createElement("div");
    chatmessage.classList.add("chat-message");

    if(eventtype === "player" && usernametext != "") {
        let username = document.createElement("span");
        username.classList.add("chat-username");
        username.textContent = usernametext;
        username.style.color = color;
        chatmessage.appendChild(username);        
    }

    let messagetext = document.createElement("span");
    messagetext.classList.add("chat-messagetext");
    messagetext.textContent = message;

    //server messages styling
    if(eventtype === "server"  && usernametext == "") {
        messagetext.style.fontStyle = "italic";
        messagetext.style.color = "#555555";        
    }

    chatmessage.appendChild(messagetext);

    let messagecontainer = chatfeed.querySelector(".messages");
    messagecontainer.appendChild(chatmessage);
    messagecontainer.scrollTop = messagecontainer.scrollHeight;

    if(!modalIsOpen()) {
        unreadmessagecount++;
        updateChatNotification(unreadmessagecount);
    } else {
        unreadmessagecount = 0;
        updateChatNotification(unreadmessagecount);        
    }
}

export async function newservermessage(eventtype, player, data = null){
    let usernametext = "";
    let color = '#333333';
    let message = "";

    console.log("newservermessage:", eventtype, player);

    if(eventtype == EVENTS.GAME_LOBBY.READYSTATE_CHANGE){
        let username = player.username;
        let curruser = await getUser();
        let charactername = getCharacterAltTagById(player.character_id);
        let checkboxColor = getCharacterHexColorById(player.character_id);
        let readymessage = ""; 

        if(username != curruser.username){
            let youOption = [...document.querySelectorAll(".character-pic-option")];
            const selectedElement = youOption.find(el => {
                const characterText = el.querySelector(".characteroption")?.textContent?.trim();
                return characterText === username;
            });
            let checkbox = selectedElement.querySelector(".checksvg");
            checkbox.style.setProperty('--checkmark-color', checkboxColor);

            if(player.readystate){
                readymessage = `${username} (${charactername}) is ready.`;             
                checkbox.classList.add("selected");                
            } else {
                readymessage = `${username} (${charactername}) is not ready.`;
                checkbox.classList.remove("selected");                 
            }
            
        } else {
            let youOption = [...document.querySelectorAll(".character-pic-option")];
            const selectedElement = youOption.find(el => {
                const characterText = el.querySelector(".characteroption")?.textContent?.trim();
                return characterText === "You";
            });
            let checkbox = selectedElement.querySelector(".checksvg");
            checkbox.style.setProperty('--checkmark-color', checkboxColor);
            if(player.readystate){
                readymessage = `You (${charactername}) are ready.`;             
                checkbox.classList.add("selected");                             
            } else {
                readymessage = `You (${charactername}) are not ready.`;
                checkbox.classList.remove("selected");                 
            }
        }

        message = readymessage;
    } else if (eventtype == EVENTS.GAME_LOBBY.CHARACTER_CHANGE){
        let username = player.username;
        let curruser = await getUser();
        let charactername = getCharacterAltTagById(player.character_id);
        let characterselectmessage = "";

        if(charactername === "Spectator"){
            if(username != curruser.username){
                characterselectmessage = `${username} has selected Spectator mode.`; 
            } else {
                characterselectmessage =  `You have selected Spectator mode.`;
            }  
        } else {
            if(username != curruser.username){
                characterselectmessage = `${username} changed their character to ${charactername}.`; 
            } else {
                characterselectmessage =  `You changed your character to ${charactername}.`;
            }
        } 
        message = characterselectmessage;        
    } 
    else if (eventtype == EVENTS.GAME_LOBBY.PLAYER_JOINED){
        let username = player.username;
        let curruser = await getUser();
        let charactername = getCharacterAltTagById(player.character_id);
        let joinmessage = "";    

        if(username != curruser.username){
            joinmessage = `${username} joined the lobby as ${charactername}.`; 
        } else {
            joinmessage =  `You joined the lobby as ${charactername}.`;
        }
        message = joinmessage;
    }
    else if (eventtype == EVENTS.GAME_LOBBY.PLAYER_LEFT){
        let username = player.username;
        let leftmessage = `${username} left the lobby.`;
        message = leftmessage;
    }
    else if (eventtype == EVENTS.SERVER.PLAYER_REMOVED){
        let username = player.username;
        let leftmessage = `${username} left the game.`;
        message = leftmessage;
    }    
    else if (eventtype == EVENTS.SERVER.PLAYER_ADDED){
        let username = player.username;
        let curruser = await getUser();
        let charactername = getCharacterAltTagById(player.character_id);
        let joinmessage = "";    

        if(username != curruser.username){
            joinmessage = `${username} joined the game as ${charactername}.`; 
        } else {
            joinmessage =  `You joined the game as ${charactername}.`;
        }
        message = joinmessage;
    }    
    else if (eventtype == EVENTS.SERVER.ROLL_RESULT){
        let username = player.username;
        let rollmessage = `${username} rolled a ${data.roll}`;
        message = rollmessage;
    }    

    createChatMessage(usernametext, color, message, "server"); 
}

export async function newchatmessage(message, player){
    let curruser = await getUser();
    let charactername = getCharacterAltTagById(player.character_id);
    let usernametext = player.username + ` (${charactername}): `;
    let color = getCharacterHexColorById(player.character_id);    

    if(player.username == curruser.username){
        usernametext = `You (${charactername}): `;
    }

    createChatMessage(usernametext, color, message, "player"); 
}

export function getCharacterIdByAltTag(character){
    let characters = {
        "Miss Scarlet" : 0, 
        "Mrs. Peacock" : 1,         
        "Mrs. White" : 2,         
        "Mr. Green" : 3,         
        "Professor Plum" : 4,         
        "Colonel Mustard" : 5   
    }
    return Object.keys(characters).indexOf(character);
}

export function getCharacterAltTagById(id){
    let characters = {
        "Spectator" : -1,
        "Miss Scarlet" : 0, 
        "Mrs. Peacock" : 1,         
        "Mrs. White" : 2,         
        "Mr. Green" : 3,         
        "Professor Plum" : 4,         
        "Colonel Mustard" : 5   
    }
    let name = Object.keys(characters).find(key => characters[key] === id);
    return name;
}

export function closeChatModal() {
    const modal = document.getElementById("chatmodal");

    // Temporarily disable transition for instant hide
    modal.style.transition = 'none';
    modal.style.transform = 'scale(0)'; 
    modal.style.opacity = '0';

    // Force a reflow so the browser applies the new state immediately
    modal.offsetHeight; 

    // Restore transition for next time it opens
    modal.style.transition = '';
    modal.classList.remove("open");     
}

export function openChatModal() {
    const modal = document.getElementById("chatmodal");
    // Ensure transition is enabled
    modal.style.transition = '';
    modal.style.transform = 'scale(1)';
    modal.style.opacity = '1';
    modal.classList.add("open");
    unreadmessagecount = 0;
    updateChatNotification(unreadmessagecount);       
}