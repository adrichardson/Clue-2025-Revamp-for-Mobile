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

async function setProfilePicId() {
    try {
        const res = await fetch("/api/user/profileImageId", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        var character = "";
        switch (data.imageId) {
            case 1:
                character = "msscarlet";
                break;
            case 2:
                character = "mrspeacock";
                break;    
            case 3:
                character = "mrswhite";
                break;    
            case 4:
                character = "mrgreen";
                break;                                    
            case 5:
                character = "profplum";
                break;
            case 6:
                character = "colmustard";
                break;                                     
            default:
                break;
        }

        const imgpath = `../../assets/imgs/people/${character}-thumb.png`;
        document.getElementById('banner-thumb').src = imgpath;
        document.getElementById('banner-thumb').alt = character;
        
    } catch (err) {
      console.error("Error getting profile data:", err);
    }
}


async function getUser() {
  try {
    const res = await fetch("/api/user", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });  

    const data = await res.json();

    return data.user;

  } catch (err) {
    console.error("Error getting user data:", err);
  }    
}

async function setUsername() {
    var user = await getUser();
    document.getElementById('banner-username').innerHTML = user.username;
}

function updateSelectedImageColor(imageid) {
  const rootElement = document.documentElement;
  let hexcolor = '#FFFFFF';
  switch (imageid) {
    case 'misscarlet-thumb':
      hexcolor =  '#DF4531';
      break;
    case 'mrspeacock-thumb':
      hexcolor =  '#6CA5B9';
      break;      
    case 'mrswhite-thumb':
      hexcolor =  '#808080';
      break;      
    case 'mrgreen-thumb':
      hexcolor =  '#599B53';
      break;      
    case 'profplum-thumb':
      hexcolor =  '#8F5770';
      break;      
    case 'colmustard-thumb':
      hexcolor =  '#8C5723';
      break;
    default:
      break;
  }
  rootElement.style.setProperty('--selected-image', hexcolor); 
}

function updateSelectedImageTag(imageid , tag) {
  let hexcolor = '#FFFFFF';
  switch (imageid) {
    case 'misscarlet-thumb':
      hexcolor =  '#DF4531';
      break;
    case 'mrspeacock-thumb':
      hexcolor =  '#6CA5B9';
      break;      
    case 'mrswhite-thumb':
      hexcolor =  '#808080';
      break;      
    case 'mrgreen-thumb':
      hexcolor =  '#599B53';
      break;      
    case 'profplum-thumb':
      hexcolor =  '#8F5770';
      break;      
    case 'colmustard-thumb':
      hexcolor =  '#8C5723';
      break;
    case 'remove':
      hexcolor =  'remove';
      break;
    default:
      hexcolor = '#A08960';
      break;
  }

  if(hexcolor != 'remove') {
    tag.style.backgroundColor = hexcolor;
  } else {
    tag.removeAttribute('style'); 
  }

}