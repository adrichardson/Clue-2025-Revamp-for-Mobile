// client.js

window.onload = function() {

  setAppHeight();

};

function setAppHeight() {
  document.documentElement.style.setProperty(
    '--app-height',
    window.innerHeight + 'px'
  );
}

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

function redirectWithTransition(url) {
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}
