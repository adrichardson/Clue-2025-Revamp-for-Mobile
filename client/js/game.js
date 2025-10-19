window.addEventListener("load", () => {
    addEventListeners();  
    setProfilePicId();
    setUsername();    
    const params = new URLSearchParams(window.location.search);
    const game_id = params.get("id");
    resizeCanvas();
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
                colyseus.createGame(colyseus.gamelobby.state.players);
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
}

function resizeCanvas() {
  const canvas = document.getElementById("gameCanvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  drawInitialGameArea();  
}

window.addEventListener("resize", resizeCanvas);

function drawInitialGameArea() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Calculate center based on actual canvas size
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Choose a radius - can scale based on canvas size if you want
    const radius = Math.min(canvas.width, canvas.height) * 0.1; // 10% of smallest dimension

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Optional: clear before drawing
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();    
}