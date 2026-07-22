export function renderObjectionScreen(container, data) {
    const objectionHTML = data.objector ? `
        <div class="objectionCardHolder">
            ${data.suggestion?.cards.map(card => `
                <div class="card" data-card-id="${card.id}" data-card-type="${card.type}">
                <img 
                    src="../assets/imgs/${card.type}/${card.imagetag}.png"
                    class="cardimage"
                >
                </div>
            `).join("")}
        </div>
        <div class="button-wrapper actionbutton-wrapper">
            <div class="interactable-button actionbtn disabled ui-action" id="showbtn" data-action="showcard">SHOW</div>
        </div>`
        : 
        `<div class="button-wrapper actionbutton-wrapper">
            <div class="interactable-button actionbtn ui-action" id="okbtn" data-action="toggle">OK</div>
        </div`;
    container.innerHTML = `
        <div class="actionmessage"> 
            ${data.message} 
        </div>  
        <div class="actionarea">
            ${objectionHTML}
        </div>`

    container.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const showbtn = document.querySelector("#showbtn");            
            const selectedCard = container.querySelector(".card.selected");
            if(selectedCard) {
                selectedCard?.classList.remove("selected");
                selectedCard != card ? card.classList.add("selected") && showbtn.classList.remove("disabled") : showbtn.classList.add("disabled");
            } else {
                card.classList.add("selected");
                showbtn.classList.remove("disabled");
            }
        });
    });
}