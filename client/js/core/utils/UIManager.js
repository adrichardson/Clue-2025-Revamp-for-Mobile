import { colyseus } from "../colyseus.js";
import { getUser } from "./user.js";
import { getCharacterHexColorById } from "./imagehelper.js";

class UIManager {
    constructor() {
        this.initialized = false;
        this.actions = {
            toggle: button => {
                if(button.dataset.modal) {
                    this.toggleModal(button.dataset.modal, button);
                } else {
                    const openModal = document.querySelector(".modal.open");
                    this.toggleModal(openModal.id);                    
                }
            },
            logout: async () => {
                await fetch("/auth/logout", {
                    method: "POST"
                });

                window.location.href = "/";
            }
        };
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        // Make modals draggable
        document.querySelectorAll(".modal").forEach(modal => {
            const header = modal.querySelector(".modal-header");
            let offsetX = 0;
            let offsetY = 0;

            header.addEventListener("pointerdown", e => {
                e.preventDefault();

                const rect = modal.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;

                header.setPointerCapture(e.pointerId);
            });

            header.addEventListener("pointermove", e => {

                if (!header.hasPointerCapture(e.pointerId)) return;

                modal.style.left = `${e.clientX - offsetX}px`;
                modal.style.top = `${e.clientY - offsetY}px`;
            });

            header.addEventListener("pointerup", e => {
                header.releasePointerCapture(e.pointerId);
            });

        });

        // Close buttons
        document.addEventListener("click", e => {
            const closeBtn = e.target.closest(".modal-close");
            if (!closeBtn) return;

            this.hideModal(closeBtn.closest(".modal"));
        });

        // UI actions
        document.addEventListener("click", async e => {
            const button = e.target.closest(".ui-action");
            if (!button) return;

            e.preventDefault();
            const actionNames = button.dataset.action.split(",").map(a => a.trim());
            const container = button.closest("#actionContainer");
            const data = container?.actionData;            

            for (const name of actionNames) {
                const action = this.actions[name];

                if (action) {
                    await action(button, data, container);
                }
            }  
        });
    }

    showModal(modal) {
        modal.classList.remove("hidden");

        requestAnimationFrame(() => {
            modal.classList.add("open");
        });
    }

    hideModal(modal) {
        modal.classList.remove("open");

        setTimeout(() => {
            modal.classList.add("hidden");
            modal.style.left = "";
            modal.style.top = "";
        }, 250);

        const buttonId = modal.id.replace("Modal", "btn");
        const button = document.getElementById(buttonId);

        if (button) {
            button.classList.remove("active");
            button.classList.remove("hidden");
        }
    }

    modalOpen() {
        return [...document.querySelectorAll(".modal")].some(modal => modal.classList.contains("open"));
    }

    toggleModal(id, triggeringElement = null) {

        const modal = document.getElementById(id);
        if (!modal) return false;

        if (modal.classList.contains("hidden")) {
            if (this.modalOpen()) {
                const openModal = document.querySelector(".modal.open");

                if (openModal) {
                    this.hideModal(openModal);
                }
            }

            this.showModal(modal);
            triggeringElement?.classList.add("active");
            return true;
        }

        this.hideModal(modal);
        triggeringElement?.classList.remove("active");
        return false;
    }

    isDisabled(button) {
        return button.classList.contains("disabled");
    }    

    registerAction(name, callback) {
        this.actions[name] = callback;
    }

    async updatePlayerReady(player) {
        const currentUser = await getUser();        
        const optionName = player.user_id === currentUser.user_id ? "You" : player.username;

        const option = [...document.querySelectorAll(".character-pic-option")]
            .find(el => el.querySelector(".characteroption")?.textContent.trim() === optionName);
        if (!option) return;

        const checkbox = option.querySelector(".checksvg");
        if (!checkbox) return;

        checkbox.style.setProperty("--checkmark-color", getCharacterHexColorById(player.character_id));
        checkbox.classList.toggle("selected", player.readystate);
    }    
}

export default new UIManager();