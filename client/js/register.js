window.onload = function () {
  setupStepForms();
};

function setupStepForms() {
  attachStepHandler("form-step1", "/register/step1", ["email"]);
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
        alert(data.error);
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
