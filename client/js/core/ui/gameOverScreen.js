export function renderGameOverScreen(container, data) {
    const solutionHTML = `
        <div class="objectionCardHolder">
            ${data.solution?.cards.map(card => `
                <div class="card" data-card-id="${card.id}" data-card-type="${card.type}">
                <img 
                    src="../assets/imgs/${card.type}/${card.imagetag}.png"
                    class="cardimage"
                >
                </div>
            `).join("")}
        </div>
        <div class="button-wrapper">   
            <div class="interactable-button actionbtn leavegamebtn" id="leavegamebtn">LEAVE GAME</div>
        </div>`

  container.innerHTML = `
    <div class="actionmessage">
        ${data.message}
    </div>  
    <div class="actionarea">
        ${solutionHTML}
    </div>`;

  container.querySelector("#leavegamebtn").addEventListener("click", () => {
    window.location.href = `/home`;
  });

}