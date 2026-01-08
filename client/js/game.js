window.addEventListener("load", () => {
    addEventListeners();  
    setProfilePicId();
    setUsername();    
    const params = new URLSearchParams(window.location.search);
    const game_id = params.get("id");
    // resizeCanvas();
});

function addEventListeners() {
    document.querySelectorAll(".gamemenuitem").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            console.log("Gamemenu item clicked:", button.id);
        });
    });

    const canvas = document.getElementById("gameCanvas");

    // Disable default touch scrolling on mobile
    canvas.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchend", e => e.preventDefault(), { passive: false });    
}

// function resizeCanvas() {
//   const canvas = document.getElementById("gameCanvas");
//   canvas.width = canvas.clientWidth;
//   canvas.height = canvas.clientHeight;
//   drawInitialGameArea();  
// }

// function setupHiDPICanvas(canvas) {
//     const ctx = canvas.getContext('2d');
//     const dpr = window.devicePixelRatio || 1;

//     // Get the CSS pixel size of the canvas
//     const rect = canvas.getBoundingClientRect();

//     // Only update if necessary to avoid infinite resize loops
//     if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
//         canvas.width = rect.width * dpr;
//         canvas.height = rect.height * dpr;
//         ctx.scale(dpr, dpr);
//     }

//     return ctx;
// }


// window.addEventListener("resize", resizeCanvas);

// function drawInitialGameArea() {
//     const canvas = document.getElementById("gameCanvas");
//     const ctx = setupHiDPICanvas(canvas);

//     const rect = canvas.getBoundingClientRect();
//     const centerX = rect.width / 2;
//     const centerY = rect.height / 2;
//     const radius = 40;

//     ctx.clearRect(0, 0, rect.width, rect.height); // Clear before redraw
//     ctx.beginPath();
//     ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
//     ctx.stroke();
// }
