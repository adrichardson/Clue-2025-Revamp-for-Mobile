import * as screenRender from "./screenRender.js";
import UIManager from "../utils/UIManager.js";
import { ACTION_TYPES } from "../../../../shared/data/index.js";

const actionContainer = document.getElementById("actionContainer");
const actionModal = document.getElementById("gameactionModal");
const actionButton = document.getElementById("gameactionbtn");

export function showAction(type, data) {

  actionContainer.innerHTML = "";

  switch(type) {
    case ACTION_TYPES.NEW_TURN_START:
      screenRender.renderTurnStartScreen(actionContainer, data);
      break;
    case ACTION_TYPES.ROLL_RESULT:
      screenRender.renderRollResultScreen(actionContainer, data);
      break;
    case ACTION_TYPES.SUGGESTION:
      screenRender.renderSuggestionScreen(actionContainer, data);
      break;
    case ACTION_TYPES.OBJECTION:
      screenRender.renderObjectionScreen(actionContainer, data);
      break;
    case ACTION_TYPES.OBJECTION_FOUND:
      screenRender.renderObjectionFoundScreen(actionContainer, data);
      break;
    case ACTION_TYPES.OBJECTION_SHOWN:
      screenRender.renderObjectionShownScreen(actionContainer, data);
      break;      
    case ACTION_TYPES.CHOOSE_FINAL:
      screenRender.renderChooseFinalOptionScreen(actionContainer, data);
      break;            
    case ACTION_TYPES.MAKE_FINAL:
      screenRender.renderSuggestionScreen(actionContainer, data);
      break;
    case ACTION_TYPES.INCORRECT_FINAL:
      screenRender.renderFinalIncorrectScreen(actionContainer, data);
      break;
    case ACTION_TYPES.GAME_OVER:
      screenRender.renderGameOverScreen(actionContainer, data);
      break;        
  }

  actionContainer.actionData = data;

  if (actionModal.classList.contains("hidden")) {
    UIManager.toggleModal("gameactionModal", actionButton);
  }
}