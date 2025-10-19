let unreadmessagecount = 0;

window.addEventListener("load", () => {
    addEventListeners();    
    setProfilePicId();
    setUsername();
    const params = new URLSearchParams(window.location.search);
    const game_id = params.get("id");
    joinGameLobby(game_id);  
});

function addEventListeners() {
    document.querySelectorAll(".interactable-button").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            if (button.classList.contains("disabled")) return;
            if (button.textContent === "Ready") {
                var user = await getUser();                
                colyseus.send("toggleready", { user });
                button.classList.add("hidden");
                document.getElementById("cancelbtn").classList.remove("hidden");
                colyseus.creategame(colyseus.gamelobby.state.players);
            } else if (button.textContent === "Leave") {
                 window.history.back();
            } else if(button.textContent === "Cancel"){
                var user = await getUser();                
                colyseus.send("toggleready", { user });
                button.classList.add("hidden");
                document.getElementById("readybtn").classList.remove("hidden");                
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
                var character_id = await getCharacterIdByAltTag(newimage.alt);                           
            }
            var user = await getUser();
            colyseus.send("selectcharacter", { user : user, character_id : character_id});     
        });
    });

    document.getElementById("chatbox").addEventListener("click", async function(e) {
        document.getElementById("chatbox").classList.add("hidden");
        openChatModal();
    });

    document.getElementById("closechat").addEventListener("click", async function(e) {
        document.getElementById("chatbox").classList.remove("hidden");
        closeChatModal();
    });

    document.getElementById("chatsendbox").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    document.getElementById("sendbutton").addEventListener("click", async function(e) {
        sendMessage();
    });
}

async function sendMessage(){
    var user = await getUser();
    var chatbox = document.getElementById("chatsendbox");
    var message = chatbox.value;
    chatbox.value = "";
    colyseus.send("chatmessage", { message : message, user : user});
}

function updateChatNotification(count) {
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

function createChatMessage(usernametext, color, message) {
    const chatfeed = document.getElementById("chatfeed");

    var chatmessage = document.createElement("div");
    chatmessage.classList.add("chat-message");

    if(usernametext != "") {
        var username = document.createElement("span");
        username.classList.add("chat-username");
        username.textContent = usernametext;
        username.style.color = color;
        chatmessage.appendChild(username);        
    }

    var messagetext = document.createElement("span");
    messagetext.classList.add("chat-messagetext");
    messagetext.textContent = message;

    //server messages styling
    if(usernametext == "") {
        messagetext.style.fontStyle = "italic";
        messagetext.style.color = "#555555";        
    }

    chatmessage.appendChild(messagetext);
    chatfeed.appendChild(chatmessage);
    chatfeed.scrollTop = chatfeed.scrollHeight;     

    if(!document.getElementById("chatmodal").classList.contains("open")){
        unreadmessagecount++;
        updateChatNotification(unreadmessagecount);
    } else {
        unreadmessagecount = 0;
        updateChatNotification(unreadmessagecount);        
    }
}

async function newservermessage(messagetype, player){
    var usernametext = "";
    var color = '#333333';
    let message = "";

    if(messagetype == "toggleready"){
        var username = player.username;
        var curruser = await getUser();
        var charactername = getCharacterAltTagById(player.character_id);
        var checkboxColor = getCharacterHexColorById(player.character_id);     

        if(username != curruser.username){
            var youOption = [...document.querySelectorAll(".character-pic-option")];
            const selectedElement = youOption.find(el => {
                const characterText = el.querySelector(".characteroption")?.textContent?.trim();
                return characterText === username;
            });
            var checkbox = selectedElement.querySelector(".checksvg");
            checkbox.style.setProperty('--checkmark-color', checkboxColor);

            if(player.readystate){
                var readymessage = `${username} (${charactername}) is ready.`;             
                checkbox.classList.add("selected");                
            } else {
                var readymessage = `${username} (${charactername}) is not ready.`;
                checkbox.classList.remove("selected");                 
            }
            
        } else {
            var youOption = [...document.querySelectorAll(".character-pic-option")];
            const selectedElement = youOption.find(el => {
                const characterText = el.querySelector(".characteroption")?.textContent?.trim();
                return characterText === "You";
            });
            var checkbox = selectedElement.querySelector(".checksvg");
            checkbox.style.setProperty('--checkmark-color', checkboxColor);
            if(player.readystate){
                var readymessage = `You (${charactername}) are ready.`;             
                checkbox.classList.add("selected");                
            } else {
                var readymessage = `You (${charactername}) are not ready.`;
                checkbox.classList.remove("selected");                 
            }
        }

        message = readymessage;
    } else if (messagetype == "character_id"){
        var username = player.username;
        var curruser = await getUser();
        var charactername = getCharacterAltTagById(player.character_id);

        if(charactername === "Spectator"){
            if(username != curruser.username){
                var characterselectmessage = `${username} has selected Spectator mode.`; 
            } else {
                var characterselectmessage =  `You have selected Spectator mode.`;
            }  
        } else {
            if(username != curruser.username){
                var characterselectmessage = `${username} changed their character to ${charactername}.`; 
            } else {
                var characterselectmessage =  `You changed your character to ${charactername}.`;
            }
        } 
        message = characterselectmessage;        
    } 
    else if (messagetype == "playerjoined"){
        var username = player.username;
        var curruser = await getUser();
        var charactername = getCharacterAltTagById(player.character_id);      

        if(username != curruser.username){
            var joinmessage = `${username} joined the lobby as ${charactername}.`; 
        } else {
            var joinmessage =  `You joined the lobby as ${charactername}.`;
        }
        message = joinmessage;
    }
    else if (messagetype == "playerleft"){
        var username = player.username;
        var leftmessage = `${username} left the lobby.`;
        message = leftmessage;
    }    


    createChatMessage(usernametext, color, message); 
}

async function newchatmessage(message, player){
    var curruser = await getUser();
    var charactername = getCharacterAltTagById(player.character_id);
    var usernametext = player.username + ` (${charactername}): `;
    var color = getCharacterHexColorById(player.character_id);    

    if(player.username == curruser.username){
        usernametext = `You (${charactername}): `;
    }

    createChatMessage(usernametext, color, message); 
}


function closeChatModal() {
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

function openChatModal() {
    const modal = document.getElementById("chatmodal");
    // Ensure transition is enabled
    modal.style.transition = '';
    modal.style.transform = 'scale(1)';
    modal.style.opacity = '1';
    modal.classList.add("open");
    unreadmessagecount = 0;
    updateChatNotification(unreadmessagecount);       
}

function getCharacterIdByAltTag(character){
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

function getCharacterAltTagById(id){
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

function getTagByImageAltTag(id){
    let newtag = null;
     document.querySelectorAll(".character-pic-option").forEach(option => {
        tag = option.querySelector(".characteroption");           
        const image = option.querySelector("img");        
        if (image.alt === id) {
            newtag = tag;
        }
     });
     return newtag;
}

function getImageByAltTag(alt){
    let newimage = null;
     document.querySelectorAll(".character-pic-option").forEach(option => { 
        image = option.querySelector("img");        
        if (image.alt === alt) {
            newimage = image;
        }
     });
     return newimage;
}

function getElementsByUsername(username){
    let elements = {tag : null, image: null};
     document.querySelectorAll(".character-pic-option").forEach(option => { 
        tag = option.querySelector(".characteroption");        
        image = option.querySelector("img");   
        if (tag.innerHTML === username) {
            elements.tag = tag;
            elements.image = image;            
        }
     });
     return elements;
}

function toggleGrayscale(image) {
  if (!image) return;

  if (image.src.includes("-grayscale")) {
    image.src = image.src.replace("-grayscale", "");
  } else {
    image.src = image.src.replace(".png", "-grayscale.png");
  }
}

function clearUserCharacter(username){
    let prevelements = getElementsByUsername(username);
    prevtag = prevelements.tag;
    previmage = prevelements.image;
    if (prevtag != null) {
        prevtag.innerHTML = 'Select';
        prevcheck = prevtag.parentElement.querySelector(".checksvg");        
        updateSelectedImageTag("remove", prevtag);
        toggleGrayscale(previmage);
        if(self){
            prevtag.classList.remove("selected");
            previmage.classList.remove("selected");
            prevcheck.classList.remove("selected");
        }
    }
}

async function updateLobbyCharacters(player, character_id){
    let self = false;

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

function updateAvailableCharacters(){
    document.querySelectorAll(".character-pic-option").forEach(option => {
        const tag = option.querySelector(".characteroption");
        if(tag.classList.contains("selected") || tag.innerHTML!='Select') return;
        tag.innerHTML = "Select";
    });
}

async function setLobbyTitle(metadata) {
    let owner = metadata.owner;
    let maxplayers = metadata.maxplayers;
    let currentplayers = metadata.currentplayers;
    let mode = metadata.mode;
    //Username's Lobby<br />Standard (1/6)
    document.getElementById('lobbytitle').innerHTML = `${owner}'s Lobby<br / >${mode} (${currentplayers}/${maxplayers})`;
}