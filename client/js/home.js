window.addEventListener("load", () => {
  addEventListeners();
  setProfilePicId();
  setUsername();
});

function addEventListeners() {
    document.querySelectorAll(".interactable-button").forEach(button => {
        button.addEventListener("click", function(e) {
            e.preventDefault();
            if (button.classList.contains("disabled")) return;
            if (button.textContent === "Play") {
                window.location.href = "/lobby";
            } else if (button.textContent === "Match History") {
                window.location.href = "/history";
            }
        });
    });
}

async function setProfilePicId() {
    try {
        const res = await fetch("/api/user/profileImageId", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        var character = "";
        switch (data.imageId) {
            case 1:
                character = "msscarlet";
                break;
            case 2:
                character = "mrspeacock";
                break;    
            case 3:
                character = "mrswhite";
                break;    
            case 4:
                character = "mrgreen";
                break;                                    
            case 5:
                character = "profplum";
                break;
            case 6:
                character = "colmustard";
                break;                                     
            default:
                break;
        }
        
        const imgpath = `../../assets/imgs/people/${character}-thumb.png`;
        document.getElementById('banner-thumb').src = imgpath;
        document.getElementById('banner-thumb').alt = character;
        
    } catch (err) {
      console.error("Error getting profile data:", err);
    }
}

async function setUsername() {
    try {
        const res = await fetch("/api/user", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        const username = data.username;

        document.getElementById('banner-username').innerHTML = username;

    } catch (err) {
      console.error("Error getting profile data:", err);
    }
}