export function showError(errorField, message) {
  errorField.textContent = message;
  errorField.classList.add("active");
  // Hide after 5s with fade-out
  setTimeout(() => {
    if (errorField.classList.contains("active")) {
      errorField.classList.remove("active");
    }
  }, 5000);
}

export function setErrorPosition(field, errorField) {
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