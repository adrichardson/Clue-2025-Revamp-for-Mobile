window.addEventListener("load", () => {
  addEventListeners();
});

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