import * as colyseushelper from "./colyseus.js";
import { colyseus } from "./colyseus.js";
import { getUser, setupUserBanner } from "./utils/user.js";
import { initMainLobbyHandlers } from "./handlers/mainLobbyHandlers.js";
import { setupModal, toggleModal } from "./utils/modalutils.js";
import * as chatmodule from "./utils/chat.js";

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
            } else if (button.textContent === "Match History") {
                window.location.href = "/history";
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

function updateSliderFill() {
    const slider = document.getElementById("playerslider");    
    const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(
        to right,
        var(--active-button) 0% ${percent}%,
        var(--disabled-button-bg) ${percent}% 100%
    )`;
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