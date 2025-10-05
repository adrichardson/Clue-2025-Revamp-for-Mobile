window.addEventListener("load", () => { 
    setProfilePicId();
    setUsername();  
    const params = new URLSearchParams(window.location.search);
    const game_id = params.get("id");
    joinGameLobby(game_id);
});
