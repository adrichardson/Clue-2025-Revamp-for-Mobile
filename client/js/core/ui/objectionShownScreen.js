export function renderObjectionShownScreen(container, data) {
    const objectionshownHTML = `
        <div class="button-wrapper actionbutton-wrapper">
            <div class="interactable-button actionbtn ui-action" id="okbtn" data-action="toggle">OK</div>
        </div>`
    container.innerHTML = `
        <div class="actionmessage"> ${data.message} </div>  
        <div class="actionarea">
            ${objectionshownHTML}
        </div>`
}