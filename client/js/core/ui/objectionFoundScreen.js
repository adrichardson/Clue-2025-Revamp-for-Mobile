export function renderObjectionFoundScreen(container, data) {
    const objectionHTML = `
        <div class="objectionCardHolder">
            <div class="card" data-card-id="${data.card.id}" data-card-type="${data.card.type}">
            <img 
                src="../assets/imgs/${data.card.type}/${data.card.imagetag}.png"
                class="cardimage"
            >
            </div>
        </div>
        <div class="button-wrapper actionbutton-wrapper">
            <div class="interactable-button actionbtn ui-action" id="okbtn" data-action="toggle,endturn">OK</div>
        </div>`
    container.innerHTML = `
        <div class="actionmessage"> ${data.message} </div>  
        <div class="actionarea">
            ${objectionHTML}
        </div>`
}