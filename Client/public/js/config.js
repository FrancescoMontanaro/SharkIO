const api_url = "https://sharkio2021.herokuapp.com/";
//const api_url = "http://127.0.0.1:5000/";
const login_redirect = "https://discord.com/api/oauth2/authorize?client_id=826343335483539466&redirect_uri=https%3A%2F%2Fsharkio-2021.web.app%2Fsuccess.html&response_type=code&scope=identify%20email%20guilds%20guilds.join";
const loader = document.getElementById("loader");


async function post_data(url, data) {
    return await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
}

async function get_data(url) {
    return await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

function setCookie(cookie, cookieName, expiration){
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + expiration);
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";          
    document.cookie = cookieName + "=" + cookie + ";expires=" + exdate.toUTCString();
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function showError(message){
    document.getElementById("errorMessage").innerHTML = message;
    document.getElementById("error").style.display = "grid";
}

function logout(){
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    session = null;
    window.location.href = "login.html";
}
