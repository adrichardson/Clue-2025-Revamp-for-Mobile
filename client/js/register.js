window.addEventListener("load", () => {
  setupStepForms();
  addEventListeners();
});

function addEventListeners() {

  const container = document.getElementById("form-step3");
  const button3 = document.getElementById("step3");

  if (!container || !button3) return;

  container.addEventListener("click", function(e) {
    if (e.target.tagName.toLowerCase() === "img") {
      const allImages = container.querySelectorAll(".profile-pic-image");

      // If clicked image is already selected, deselect it
      if (e.target.src.includes("-thumb-selected.png")) {
        e.target.src = e.target.src.replace("-thumb-selected.png", "-thumb.png");
        e.target.classList.remove("selected");
      } else {
        // reset all to unselected
        allImages.forEach(img => {
          img.src = img.src.replace("-thumb-selected.png", "-thumb.png");
          img.classList.remove("selected");
        });
        // select the clicked one
        e.target.src = e.target.src.replace("-thumb.png", "-thumb-selected.png");
        e.target.classList.add("selected");
      }

      // check if any image is selected
      const anySelected = Array.from(allImages).some(img =>
        img.src.includes("-thumb-selected.png")
      );

      if (anySelected) {
        button3.classList.remove("disabled");
        button3.disabled = false;
      } else {
        button3.classList.add("disabled");
        button3.disabled = true;
      }
    }
  });
}

function getProfilePicId() {
  const selectedImg = document.querySelector(".profile-pic-image.selected");
  if (!selectedImg) return null;
  switch (selectedImg.alt) {
    case "Miss Scarlet": return 1;
    case "Mrs. Peacock": return 2;
    case "Mrs. White": return 3;
    case "Mr. Green": return 4;
    case "Professor Plum": return 5;
    case "Colonel Mustard": return 6;
    default: return null;
  }
}

function setupStepForms() {
  attachStepHandler("form-step1", "/register", ["email"]);
  attachStepHandler("form-step2", "/register/step2", ["username", "password", "confirm-password"]);
  attachStepHandler("form-step3", "/register/step3", [], true);
}

/**
 * Attach a submit handler to a form.
 * @param {string} formId - The form's ID.
 * @param {string} endpoint - The server endpoint for this step.
 * @param {string[]} fields - Input field IDs to collect values from.
 * @param {boolean} isFinal - If true, redirect using `data.redirect`.
 */
function attachStepHandler(formId, endpoint, fields, isFinal = false) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const step3Button = document.getElementById("step3");

    if (step3Button && step3Button.classList.contains("disabled")) {
      return;
    }

    // Collect field values dynamically
    const body = {};
    fields.forEach((field) => {
      const el = document.getElementById(field);
      if (el) {
        body[field] = el.value;
      }
    });

    // For step 3, fallback default value
    if (endpoint.includes("step3") && !body.profile_pic_id) {
      body.profile_pic_id = getProfilePicId();
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log(`${formId} response:`, data);

      if (data.error) {
        //data.errorType can be "email", "username", "password", "confirm-password", "profile-pic-grid"
        const field = document.getElementById(data.errorType);
        const errorField = document.getElementById(`error-${data.errorType}`);
        setErrorPosition(field, errorField);
        showError(errorField, data.error);
        return;
      }

      if (isFinal && data.redirect) {
        window.location.href = data.redirect;
      } else if (data.nextStep) {
        window.location.href = `/register?step=${data.nextStep}`;
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  });
}
