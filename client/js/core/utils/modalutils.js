
export function setupModal() {
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

    // Close buttons
    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const modal = e.target.closest(".modal");
            closeModal(modal);
        });
    });

    // Settings button handler
    const settingsbtn = document.getElementById("settingsbtn");
    if (settingsbtn) {
      settingsbtn.addEventListener("click", function(e) {
        e.preventDefault();
        toggleModal("settingsModal", settingsbtn);
      });
    }

    const settingsAboutBtn = document.getElementById("settings:about");
    if (settingsAboutBtn) {
      settingsAboutBtn.addEventListener("click", function(e) {
        e.preventDefault();
        toggleModal("aboutModal", settingsAboutBtn);
      });
    }

    const aboutbtnClose = document.getElementById("about:close");
    if (aboutbtnClose) {
      aboutbtnClose.addEventListener("click", function(e) {
        e.preventDefault();
        toggleModal("aboutModal", aboutbtnClose);
      });
    }    

    const settingsLogoutBtn = document.getElementById("settings:logout");
    if (settingsLogoutBtn) {
      settingsLogoutBtn?.addEventListener("click", async (e) => {
          e.preventDefault();
          await fetch("/auth/logout", {
              method: "POST"
          });
          
          window.location.href = "/";
      });
    }
}

export function openModal(modal) {
  modal.classList.remove("hidden");

  requestAnimationFrame(() => {
    modal.classList.add("open");
  });  
}

export function closeModal(modal) {
  modal.classList.remove("open");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.style.left = "";
    modal.style.top = "";
  }, 250);

  const buttonId = modal.id.replace("Modal", "btn");
  const button = document.getElementById(buttonId);

  if (button) {
    if (button.classList.contains("active")) {
      button.classList.remove("active");
    }
    if (button.classList.contains("hidden")) {
      button.classList.remove("hidden");
    }   
  }
}

export function modalIsOpen() {
  return [...document.querySelectorAll(".modal")]
    .some(modal => modal.classList.contains("open"));
}

export function toggleModal(id, triggeringElement) {
  const modal = document.getElementById(id);

  if (modal.classList.contains("hidden")) {
    if (modalIsOpen()) {
      const openModal = document.querySelector(".modal.open");
      closeModal(openModal);
    };
    openModal(modal);
    triggeringElement.classList.add("active");
    return true; //opened
  } else {
    closeModal(modal);
    triggeringElement.classList.remove("active");
    return false; //closed
  } 
}