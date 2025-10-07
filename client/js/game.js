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
                console.log("user is ready");
            } else if (button.textContent === "Leave") {
                 window.history.back();
            }
        });
    });

    document.querySelectorAll(".character-pic-option").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            const newtag = button.querySelector(".characteroption");  
            if(newtag.innerHTML != 'Select') return;

            const newimage = button.querySelector("img");
            const characterinfo = document.getElementById("characterinfowrapper");
            const currentSelectedImg = document.querySelectorAll('.selected')[0];
            const currentSelectedTag = document.querySelectorAll('.selected')[1];

            currentSelectedImg.classList.remove("selected");
            currentSelectedTag.classList.remove("selected");
            currentSelectedTag.innerHTML = 'Select';
            newimage.classList.add("selected");
            newtag.classList.add("selected");
            newtag.innerHTML = 'You';
            characterinfo.innerHTML = newimage.alt;

            var user = await getUser();
            var character_id = await getCharacterIdByAltTag(newimage.alt); 
            colyseus.send("selectcharacter", { user : user, character_id : character_id});     
            updateSelectedImageColor(newimage.id);  
            updateAvailableCharacters();
        });
    });    
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

function getTagByUsername(username){
    let usertag = null;
     document.querySelectorAll(".character-pic-option").forEach(option => { 
        tag = option.querySelector(".characteroption");        
        if (tag.innerHTML === username) {
            usertag = tag;
        }
     });
     return usertag;
}

async function updateLobbyCharacters(username, character_id){
    let user = await getUser();
    if(user.username == username) {
        updateAvailableCharacters();
        return;
    }

    const prevtag = getTagByUsername(username);
    if (prevtag != null) {
        prevtag.innerHTML = 'Select';
        updateSelectedImageTag("remove", prevtag);
    }

    const newimagealt = getCharacterAltTagById(character_id);
    const newtag = getTagByImageAltTag(newimagealt);
    const newimage = getImageByAltTag(newimagealt);
    newtag.innerHTML = username;
    console.log(newimage.id);
    updateSelectedImageTag(newimage.id, newtag);

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