window.addEventListener("load", () => {
  addEventListeners();
  setProfilePicId();
  setUsername();
  joinMainLobby();
  getAvailableGames();
});

function addEventListeners() {
    document.querySelectorAll(".interactable-button").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            if (button.classList.contains("disabled")) return;
            if (button.textContent === "Join") {
                let game_id = "";
                document.querySelectorAll(".selected-game").forEach(selectedgame => {
                    game_id = selectedgame.id;
                });
                var user = await getUser();            
                console.log(`attempting to join game lobby with id: ${game_id} as ${user.username}`)
                colyseus.joingamelobby(user, game_id); 
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
        if (!colyseus) return;
        var user = await getUser();
        let username = user.username;
        let game = {username : username, type : `public`, mode : `standard`, maxplayers : 6, game_id : `${username}001`};
        //TODO - add settings for type/mode/max users
        colyseus.createnewgame(game, user);    
    });
}

async function listGames(gameslist){
    const searchbox = document.getElementById("searchbox");
    const searchicon = document.getElementById("searchicon");
    const filtercontrols = document.getElementById("filtercontrols");
    const matchsubtext = document.getElementById("matchsubtext");
    const nogames = document.getElementById("nogames");

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
        const { owner, type, mode, maxplayers, game_id } = game.metadata;
        const matchdiv = document.getElementById("matcheswrapper");

        const listing = document.createElement("div");
        listing.id = game_id;
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
        matchcount.textContent = `1/${maxplayers}`;

        listing.appendChild(matchusername);
        listing.appendChild(matchtype);        
        listing.appendChild(matchcount);        
        matchdiv.appendChild(listing);
    });
}

async function getAvailableGames() { 
    if(!colyseus) return;

    colyseus.send("listgames");
}