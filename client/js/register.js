window.onload = function () {
  setupStepForms();
  addEventListeners();
};

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

function setupStepForms() {
  attachStepHandler("form-step1", "/register", ["email"]);
  attachStepHandler("form-step2", "/register/step2", ["username", "password", "confirmPassword"]);
  attachStepHandler("form-step3", "/register/step3", ["profile_pic_id"], true);
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
      body.profile_pic_id = 1; // TODO: replace with actual selected pic
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
        //data.errorType can be "email", "username", "password"
        const field = document.getElementById(data.errorType);
        const errorField = document.getElementById(`error-${data.errorType}`);
        setErrorPosition(field, errorField);
        showError(errorField, data.error);
        if (data.errorType === "password") {
          const field2 = document.getElementById("confirmPassword");
          const errorField2 = document.getElementById("error-confirm-password");
          setErrorPosition(field2, errorField2);
          showError(errorField2, data.error);
        }

        return;
      }

      if (isFinal && data.redirect) {
        window.location.href = data.redirect;
      } else if (data.nextStep) {
        window.location.href = `/register?step=${data.nextStep}`;
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Something went wrong. Please try again.");
    }
  });
}

function showError(errorField, message) {
  errorField.textContent = message;
  errorField.classList.add("active");
  // Hide after 3s with fade-out
  setTimeout(() => {
    errorField.classList.remove("active");
  }, 3000);
}

function hideError(errorField) {
  errorField.classList.remove("active");
} 

function setErrorPosition(field, errorField) {
    // Get input’s Y position relative to page
    const rect = field.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const top = rect.top + scrollTop - 44; // input’s top minus 20px
    const left = rect.left + rect.width - errorField.width + 200; // align with input left

    errorField.style.top = `${top}px`; // slide down
    errorField.style.left = `${left}px`; // align with input left

    // Remove error immediately if user focuses the field
    field.addEventListener("focus", () => {
      errorField.classList.remove("active");
    }, { once: true }); // run only once for this error    
}
