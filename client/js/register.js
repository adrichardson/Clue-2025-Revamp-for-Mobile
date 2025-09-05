window.onload = function() {
  addEventListeners();
};

function addEventListeners() {
    document.getElementById("registerForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        //add email from session
        const res = await fetch("/register/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        document.getElementById("result").textContent = data.message || data.error;
    });
}
