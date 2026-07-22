export function renderFinalIncorrectScreen(container, data) {
const failedFinalHTML = data.isMyTurn ? `
      <div class="button-wrapper">    
        <div class="interactable-button actionbtn ui-action" id="okbtncurrplayer" data-action="endturn">OK</div>
      </div>`
      :
      `<div class="button-wrapper">    
        <div class="interactable-button actionbtn ui-action" id="okbtn" data-action="toggle">OK</div>
      </div>`

  container.innerHTML = `
    <div class="actionmessage">
        ${data.message}
    </div>  
    <div class="actionarea">
      <div class="button-wrapper">
        ${failedFinalHTML}
      </div>
    </div>
  `;
}