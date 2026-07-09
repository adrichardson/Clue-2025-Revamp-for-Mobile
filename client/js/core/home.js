import * as colyseushelper from "./colyseus.js";
import { colyseus } from "./colyseus.js";
import { getUser, setupUserBanner } from "./utils/user.js";
import { initMainLobbyHandlers } from "./handlers/mainLobbyHandlers.js";
import { setupModal, toggleModal } from "./utils/modalutils.js";
import * as chatmodule from "./utils/chat.js";
import { getCharacterHexColorById} from "./utils/imagehelper.js";
import { SUSPECTS } from "../../../shared/data/CardData.js";
import { showToast } from "./utils/utils.js";

export function init() {
  addEventListeners();
  setupUserBanner();
  initMainLobbyHandlers();
  setupModal();
  colyseushelper.joinMainLobby();
  colyseushelper.getAvailableGames();
  updateSliderFill();
}

function addEventListeners() {
    document.querySelectorAll(".interactable-button").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            if (button.classList.contains("disabled")) return;
            if (button.textContent === "Join") {
                let gamelobby_id = "";
                document.querySelectorAll(".selected-game").forEach(selectedgame => {
                    gamelobby_id = selectedgame.id;
                });
                const user = await getUser();
                colyseus.joinlobby(user, gamelobby_id);
            }
        });
    });

    const searchbox = document.getElementById("searchbox");
    const searchicon = document.getElementById("searchicon");
    if (searchbox) {
        searchbox.addEventListener("input", (e) => {
            const value = e.target.value.trim();
            if (value !== "") {
                if (searchicon) searchicon.classList.add("hidden");
            } else if (searchicon) {
                searchicon.classList.remove("hidden");
            }
        });
    }

    const matchistorybtn = document.getElementById("matchhistbtn");
    if (matchistorybtn) {
        matchistorybtn.addEventListener("click", async function(e){
            e.preventDefault();
            await getMatchHistory();
            const matchlistHome = document.getElementById("matchlisthome");
            const matchhistoryHome = document.getElementById("matchhistoryhome");
            if (matchlistHome) matchlistHome.classList.add("hidden");
            if (matchhistoryHome) matchhistoryHome.classList.remove("hidden");
        });
    }   
    
    const cancelmatchhistorybtn = document.getElementById("cancelmatchhistorybtn");
    if (cancelmatchhistorybtn) {
        cancelmatchhistorybtn.addEventListener("click", async function(e){
            e.preventDefault();
            const matchlistHome = document.getElementById("matchlisthome");
            const matchhistoryHome = document.getElementById("matchhistoryhome");
            const matchesareawrapper = document.getElementById("matchesareawrapper");
            if (matchlistHome) matchlistHome.classList.remove("hidden");
            if (matchhistoryHome) matchhistoryHome.classList.add("hidden");
            if( matchesareawrapper ){
                matchesareawrapper.childNodes.forEach(child => {
                    if( child.classList && child.classList.contains("matchhistorylisting") ){
                        matchesareawrapper.removeChild(child);
                    }
                });
            }

        });
    }    

    const newgamebtn = document.getElementById("newgamebtn");
    if (newgamebtn) {
        newgamebtn.addEventListener("click", async function(e){
            e.preventDefault();
            const matchlistHome = document.getElementById("matchlisthome");
            const newgameHome = document.getElementById("newgamehome");
            if (matchlistHome) matchlistHome.classList.add("hidden");
            if (newgameHome) newgameHome.classList.remove("hidden");
        });
    }

    const cancelcreategamebtn = document.getElementById("cancelcreategamebtn");
    if (cancelcreategamebtn) {
        cancelcreategamebtn.addEventListener("click", async function(e){
            e.preventDefault();
            const matchlistHome = document.getElementById("matchlisthome");
            const newgameHome = document.getElementById("newgamehome");
            if (matchlistHome) matchlistHome.classList.remove("hidden");
            if (newgameHome) newgameHome.classList.add("hidden");
        });
    }

    const creategamebtn = document.getElementById("creategamebtn");
    if (creategamebtn) {
        creategamebtn.addEventListener("click", async function(e){
            e.preventDefault();
            if (!colyseus) return;
            const user = await getUser();
            const selectedTypeButton = document.querySelector(".type.selected");
            const selectedModeButton = document.querySelector(".mode.selected");
            const playerslider = document.getElementById("playerslider");
            const gamepassword = document.getElementById("gamepassword");

            if (!selectedTypeButton || !selectedModeButton || !playerslider || !gamepassword) return;

            const owner = user.username;
            const type = selectedTypeButton.innerText;
            const mode = selectedModeButton.innerText;
            const maxplayers = playerslider.value;
            const password = gamepassword.value;
            const gamelobby = { owner, type, mode, password, maxplayers };

            colyseus.createlobby(gamelobby);
        });
    }

    const slider = document.getElementById("playerslider");
    if (slider) slider.addEventListener("input", updateSliderFill);

    const groups = ["type", "mode"];
    const passwordWrapper = document.getElementById("passwordwrapper");
    groups.forEach(group => {
        const buttons = document.querySelectorAll(`.${group}`);

        buttons.forEach(button => {
            button.addEventListener("click", () => {
                if (button.classList.contains("disabled")) {
                    showToast("This option will be available soon!", "error", 3000);
                    return;
                }
                buttons.forEach(btn => btn.classList.remove("selected"));
                button.classList.add("selected");
                if (group === "type") {
                    if (button.id === "setupprivatebtn") {
                        passwordWrapper?.classList.remove("hide");
                    } else if (button.id === "setuppublicbtn") {
                        passwordWrapper?.classList.add("hide");
                    }
                }
            });
        });
    });

    const chatbox = document.getElementById("homemessagebtn");
    const chatsendbox = document.getElementById("chatsendbox");
    const sendbtn = document.getElementById("sendbutton");
    const lobbychatbtn = document.getElementById("lobbychatbtn");
    const onlineusersbtn = document.getElementById("onlineusersbtn");

    chatbox.addEventListener("click", async function(e) {
        chatbox.classList.add("hidden");
        toggleModal("homemessageModal", this);
    });

   chatsendbox.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && chatsendbox.value!== "") {
            chatmodule.sendMessage();
        }
    });

    sendbtn.addEventListener("click", async function(e) {
        if (chatsendbox.value!== "") {
            chatmodule.sendMessage();
        }
    });

    lobbychatbtn.addEventListener("click", async function(e) {
        chatmodule.toggleMessageFeed("lobby");
    });

    onlineusersbtn.addEventListener("click", async function(e) {
        chatmodule.toggleMessageFeed("online");
    });
}

async function getMatchHistory() {
    const user = await getUser();
    const res = await fetch(`/api/matchhistory`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    let matchdata = JSON.parse(await res.text());
    if(matchdata.length === 0){
        const matchesfilter = document.getElementById("matchhistoryfiltercontrols");
        const nomatches = document.getElementById("nomatches");
        matchesfilter.classList.add("hide");
        nomatches.classList.remove("hidden");
    } else {
        matchesfilter.classList.remove("hide");
        nomatches.classList.add("hidden");        
        matchdata.forEach(match => {
            const date = new Date(match.createdAt);
            const matchDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
            const result = match.player.result === "win" ? "W" : "L";        
            const characterId = match.player.character_id;

            const bgcolor = getCharacterHexColorById(characterId);
            const characterName = SUSPECTS.find(suspect => suspect.id === characterId)?.name || "Unknown Character";

            const matcheswrapper = document.getElementById("matchesareawrapper");
            const matchdiv = document.createElement("div");
            matchdiv.classList.add("matchhistorylisting");
            matchdiv.style.backgroundColor = bgcolor;
            matchdiv.innerHTML = `
                <div class="matchhistory-character">${characterName}</div>
                <div class="matchhistory-date">${matchDate}</div>            
                <div class="matchhistory-result">${result}</div>
            `;
            matcheswrapper.appendChild(matchdiv);
        });
    }
}

function updateSliderFill() {
    const slider = document.getElementById("playerslider");    
    const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(
        to right,
        var(--active-button) 0% ${percent}%,
        var(--disabled-button-bg) ${percent}% 100%
    )`;
}

export async function listOnlineUsers(usernames) {
    const onlineuserslist = document.getElementById("onlineusersfeed");
    const currentUser = await getUser();

    if (!onlineuserslist) return;

    onlineuserslist.innerHTML = "";
    for (const username of usernames) {
        if(username === currentUser.username) continue;
        const userElement = document.createElement("div");
        userElement.classList.add("online-user");
        userElement.textContent = username;
        onlineuserslist.appendChild(userElement);
    }
}

export async function listGames(gameslist){
    const searchbox = document.getElementById("searchbox");
    const searchicon = document.getElementById("searchicon");
    const filtercontrols = document.getElementById("filtercontrols");
    const matchsubtext = document.getElementById("matchsubtext");
    const nogames = document.getElementById("nogames");
    const matcheswrapper = document.getElementById("matcheswrapper");
    const user = await getUser();

    matcheswrapper.innerHTML = "";

    if (!gameslist || gameslist.length === 0) {
        searchbox.classList.add("hide");
        searchicon.classList.add("hide");        
        filtercontrols.classList.add("hide");
        matchsubtext.classList.add("hide");        
        nogames.classList.remove("hidden");
        return;
    }

    searchbox.classList.remove("hide");
    searchicon.classList.remove("hide");        
    filtercontrols.classList.remove("hide");
    matchsubtext.classList.remove("hide");    
    nogames.classList.add("hidden"); 
      
    gameslist.forEach(game => {
        const { owner, type, mode, maxplayers, gamelobby_id } = game.metadata;
        const currplayers = game.clients == 0 ?  1 : game.clients;
        if (owner == user.username ) return;
        const matchdiv = document.getElementById("matcheswrapper");

        const listing = document.createElement("div");
        listing.id = gamelobby_id;
        listing.classList.add("matchlisting");
        listing.addEventListener("click", function () {
            if (listing.classList.contains("selected-game")){
                listing.classList.remove("selected-game");
                document.getElementById("joinbtn").classList.add("disabled"); 
                return;               
            }
            document.querySelectorAll(".selected-game").forEach(match => {
                match.classList.remove("selected-game");
            });
            listing.classList.add("selected-game");
            document.getElementById("joinbtn").classList.remove("disabled");
        });

        const matchusername = document.createElement("div");
        matchusername.classList.add("match-username");
        matchusername.textContent = owner;

        const matchtype = document.createElement("div");
        matchtype.classList.add("match-type");
        matchtype.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} (${mode.toUpperCase()[0]})`;

        const matchcount = document.createElement("div");        
        matchcount.classList.add("match-count");
        matchcount.textContent = `${currplayers}/${maxplayers}`;

        listing.appendChild(matchusername);
        listing.appendChild(matchtype);        
        listing.appendChild(matchcount);        
        matchdiv.appendChild(listing);
    });
}