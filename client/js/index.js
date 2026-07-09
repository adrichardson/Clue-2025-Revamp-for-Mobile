import * as Colyseus from "https://unpkg.com/colyseus.js@^0.16.0/dist/colyseus.js";

const page = window.PAGE_NAME;

window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);
window.addEventListener("load", () => {
  init();  
  setAppHeight();
});

async function init() {
  try {
    console.log("Initializing app for page:", page);
    switch (page) {

      case "index": {
        addEventListeners();
        break;
      }

      case "login": {
        const login = await import("./core/login.js");
        if (login.init) login.init();
        break;
      }      

      case "register": {
        const register = await import("./core/register.js");
        if (register.init) register.init();
        break;
      }    

      case "home": {
        const home = await import("./core/home.js");
        if (home.init) home.init();
        break;
      }  

      case "gamelobby": {
        const gamelobby = await import("./core/gameLobby.js");
        if (gamelobby.init) gamelobby.init();
        break;
      }

      case "game": {
        const game = await import("./core/game.js");
        if (game.init) game.init();
        break;
      }

      default: {
        console.warn("Unknown page:", page);
      }
    }
  } catch (err) {
    console.error("App init failed:", err);
  }
}

// Check if service workers are supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(reg => console.log("✅ Service Worker registered:", reg.scope))
      .catch(err => console.error("❌ Service Worker failed:", err));
  });
}

function setAppHeight() {
  document.documentElement.style.setProperty(
    '--app-height',
    window.innerHeight + 'px'
  );
}

function addEventListeners() {
  const logo = document.getElementById("logo-image");
  if (logo) {
     logo.addEventListener("click", function(e) {
      e.preventDefault();
      window.location.href = "/";
    });
  }

  const loginbtn = document.getElementById("loginbtn");
  if (loginbtn) {
    loginbtn.addEventListener("click", function(e) {
      e.preventDefault();
      redirectWithTransition('/login')
    });
   }

  const registerbtn = document.getElementById("registerbtn");
  if (registerbtn) {
    registerbtn.addEventListener("click", function(e) {
      e.preventDefault();
      redirectWithTransition('/register')
    });
   }   
}

function redirectWithTransition(url) {
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}