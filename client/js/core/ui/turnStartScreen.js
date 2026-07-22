export function renderTurnStartScreen(container, data) {

  const btnHTML = data.isMyTurn ? `
        <div data-action="roll" class="interactable-button actionbtn ui-action ${(data.pass.mustPass || (data.pass.cantleaveroom && (data.passage.canPassage || data.canStay)))? "disabled" : ""}" id="rollbtn">ROLL</div>
        <div data-action="stay" class="interactable-button actionbtn ui-action ${data.canStay ? "" : "disabled"}" id="staybtn">STAY</div>
        <div data-action="passage" class="interactable-button actionbtn ui-action ${data.passage.canPassage ? "" : "disabled"}" id="passagebtn">PASSAGE</div>
        <div data-action="pass" class="interactable-button actionbtn ui-action ${data.pass.mustPass ? "" : "disabled"}" id="passbtn">PASS</div>`
        : 
        `<div class="interactable-button actionbtn ui-action" id="okbtn" data-action="toggle">OK</div>`;

  container.innerHTML = `
    <div class="actionmessage"> ${data.message} </div>  
    <div class="actionarea">
      <div class="button-wrapper">
        ${btnHTML}
      </div>    
    </div>
  `;
}