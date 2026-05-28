import * as colyseushelper from "./colyseus.js";
import { colyseus } from "./colyseus.js";
import { getUser, setupUserBanner } from "./utils/user.js";
import { initMainLobbyHandlers } from "./handlers/mainLobbyHandlers.js";

export function init() {
  addEventListeners();
  setupUserBanner();
  initMainLobbyHandlers();
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
                var user = await getUser();
                colyseus.joinlobby(user, gamelobby_id);
            } else if (button.textContent === "Match History") {
                window.location.href = "/history";
            }
        });
    });

    const searchbox = document.getElementById("searchbox");
    searchbox.addEventListener("input", (e) => {
        const value = e.target.value.trim();
        if (value !="")
        {
            document.getElementById("searchicon").classList.add("hidden");
        } else {
            document.getElementById("searchicon").classList.remove("hidden");
        }
    });

    const newgamebtn = document.getElementById("newgamebtn");
    newgamebtn.addEventListener("click", async function(e){
        e.preventDefault();
        document.getElementById("matchlisthome").classList.add("hidden");        
        document.getElementById("newgamehome").classList.remove("hidden");

    });

    const cancelcreategamebtn = document.getElementById("cancelcreategamebtn");
    cancelcreategamebtn.addEventListener("click", async function(e){
        e.preventDefault();
        document.getElementById("matchlisthome").classList.remove("hidden");        
        document.getElementById("newgamehome").classList.add("hidden");

    });    

    const creategamebtn = document.getElementById("creategamebtn");
    creategamebtn.addEventListener("click", async function(e){
        e.preventDefault();
        if (!colyseus) return;        
        var user = await getUser();
        let owner = user.username;
        let type = document.getElementsByClassName("type selected")[0].innerText;
        let mode = document.getElementsByClassName("mode selected")[0].innerText;        
        let maxplayers = document.getElementById("playerslider").value;        
        let password = document.getElementById("gamepassword").value;    
        let gamelobby = {owner, type, mode, password, maxplayers };

        colyseus.createlobby(gamelobby);
    });    

    const slider = document.getElementById("playerslider");
    slider.addEventListener("input", updateSliderFill);

    const groups = ["type", "mode"];
    const passwordWrapper = document.getElementById("passwordwrapper");
    groups.forEach(group => {
        const buttons = document.querySelectorAll(`.${group}`);

        buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            // Special logic for type buttons (private/public)
            if (group === "type") {
            if (button.id === "setupprivatebtn") {
                passwordWrapper.classList.remove("hide");
            } else if (button.id === "setuppublicbtn") {
                passwordWrapper.classList.add("hide");
            }
            }            
        });
        });
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