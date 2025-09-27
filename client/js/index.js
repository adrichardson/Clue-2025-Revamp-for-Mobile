window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);
// Check if service workers are supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(reg => console.log("✅ Service Worker registered:", reg.scope))
      .catch(err => console.error("❌ Service Worker failed:", err));
  });
}

window.addEventListener("load", () => {
  setAppHeight();
  addEventListenersIndex();
});

function addEventListenersIndex() {
  const logo = document.getElementById("logo-image");
  console.log("added event listener for logo");
  if (logo) {
     logo.addEventListener("click", function(e) {
      e.preventDefault();
      window.location.href = "/";
    });
  }
}

function setAppHeight() {
  document.documentElement.style.setProperty(
    '--app-height',
    window.innerHeight + 'px'
  );
}

function redirectWithTransition(url) {
  setTimeout(() => {
    window.location.href = url;
  }, 300);
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

