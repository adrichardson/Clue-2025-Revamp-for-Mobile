window.onload = function() {
  addEventListeners();
};

function addEventListeners() {
  document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.error) {
      //data.errorType can be "username", "password"
      const field = document.getElementById(data.errorType);
      const errorField = document.getElementById(`error-${data.errorType}`);
      setErrorPosition(field, errorField);
      showError(errorField, data.error);
      return;
    }    
    if (data.message === "admin login success") {
      window.location.href = "/admin";
      return;
    } else if (data.message === "user login success") {
      window.location.href = "/home";
      return;
    }      
  });
}

function showError(errorField, message) {
  errorField.textContent = message;
  errorField.classList.add("active");
  // Hide after 5s with fade-out
  setTimeout(() => {
    if (errorField.classList.contains("active")) {
      errorField.classList.remove("active");
    }
  }, 5000);
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
