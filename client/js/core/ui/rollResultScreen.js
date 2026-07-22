export function renderRollResultScreen(container, data) {
  container.innerHTML = `
    <div class="actionmessage">
        ${data.message}
    </div>  
    <div class="actionarea">
      <div class="button-wrapper">    
        <div class="interactable-button actionbtn ui-action" id="okbtn" data-action="toggle">OK</div>
      </div>
    </div>
  `;
}