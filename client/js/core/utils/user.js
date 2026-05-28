let user = null;

export function setupUserBanner() {
      setProfilePicId();
      setUsername();
}

export async function getUser() {
  if (user == null) {
    try {
        const res = await fetch("/api/user", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });  

        const data = await res.json();
        user = data.user;
        return data.user;

      } catch (err) {
        console.error("Error getting user data:", err);
      }    
  } else {
    return user;
  } 
}

async function setUsername() {
    var user = await getUser();
    document.getElementById('banner-username').innerHTML = user.username;
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