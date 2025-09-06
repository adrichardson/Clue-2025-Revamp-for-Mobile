window.onload = function () {
  setupAdminButtons();
};

function setupAdminButtons() {
  attachStepHandler("userbtn", "/admin/users");
  attachStepHandler("imagebasebtn", "/admin/imagebase");
}

/**
 * Attach a submit handler to a form.
 * @param {string} btnId - The button's ID.
 * @param {string} endpoint - The server endpoint for this step.
 */
function attachStepHandler(btnId, endpoint) {
  const button = document.getElementById(btnId);
  if (!button) return;

  button.addEventListener("click", async function (e) {
    e.preventDefault();
    window.location.href = endpoint;
  });
}
