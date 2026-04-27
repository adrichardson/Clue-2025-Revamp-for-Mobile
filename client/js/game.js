window.addEventListener("load", () => {
    addEventListeners();  
    setProfilePicId();
    setUsername();
    setupModal();
    const params = new URLSearchParams(window.location.search);
    const game_id = params.get("id");
    // resizeCanvas();
});

function addEventListeners() {
    document.querySelectorAll(".gamemenuitem").forEach(button => {
        button.addEventListener("click", async function(e) {
            e.preventDefault();
            switch(this.id) {
                case "gameactionbtn":
                    toggleModal("gameactionModal", this);
                    break;
                case "gamehandbtn":
                    toggleModal("gamehandModal", this);
                    break;
                case "gamesheetbtn":
                    toggleModal("gamesheetModal", this);
                    break;
                case "gamemessagebtn":
                    toggleModal("gamemessageModal", this);
                    break;
                default:
                    break;
            }
        });
    });

    const canvas = document.getElementById("gameCanvas");

    // Close buttons
    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const modal = e.target.closest(".modal");
            closeModal(modal);
        });
    });    

    // Disable default touch scrolling on mobile
    canvas.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchend", e => e.preventDefault(), { passive: false });    
}

function setupModal() {
    document.querySelectorAll(".modal").forEach(modal => {

        const header = modal.querySelector(".modal-header");

        let offsetX = 0;
        let offsetY = 0;

        header.addEventListener("pointerdown", (e) => {
            e.preventDefault();

            const rect = modal.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            header.setPointerCapture(e.pointerId);
        });

        header.addEventListener("pointermove", (e) => {        
            if (!header.hasPointerCapture(e.pointerId)) return;

            modal.style.left = `${e.clientX - offsetX}px`;
            modal.style.top = `${e.clientY - offsetY}px`;
        });

        header.addEventListener("pointerup", (e) => {
            header.releasePointerCapture(e.pointerId);
        });
    });
}

function openModal(modal) {
  modal.classList.remove("hidden");

  requestAnimationFrame(() => {
    modal.classList.add("open");
  });  
}

function closeModal(modal) {
  modal.classList.remove("open");

  // wait for animation to finish
  setTimeout(() => {
    modal.classList.add("hidden");

    // reset drag position
    modal.style.left = "";
    modal.style.top = "";
  }, 250); // match CSS duration

  const buttonId = modal.id.replace("Modal", "btn");
  const button = document.getElementById(buttonId);

  if (button) {
    button.classList.remove("active");
  }
}

function modalIsOpen() {
  return [...document.querySelectorAll(".gamemenuitem")]
    .some(button => button.classList.contains("active"));
}

function toggleModal(id, triggeringElement) {
  const modal = document.getElementById(id);

  if (modal.classList.contains("hidden")) {
    if (modalIsOpen()) return;
    openModal(modal);
    triggeringElement.classList.add("active");
  } else {
    closeModal(modal);
    triggeringElement.classList.remove("active");    
  } 
}