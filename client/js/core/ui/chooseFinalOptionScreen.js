export function renderChooseFinalOptionScreen(container, data) {
const chooseFinalHTML = data.isMyTurn ? `
      <div class="button-wrapper">
        <div class="interactable-button actionbtn makefinalbtn ui-action" id="makefinalbtn" data-action="makefinal">MAKE FINAL</div>      
        <div class="interactable-button actionbtn endturnbtn ui-action" id="endturnbtn" data-action="endturn">END TURN</div>
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
        ${chooseFinalHTML}
      </div>
    </div>
  `;
}