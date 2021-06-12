let session;
let user_data;


function displayUser(user){
  for(elem of document.getElementsByClassName("avatar")){
    if(user.avatar != null){
      elem.src = "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar;
    }
    else{
      elem.src = "images/discord.png";
    }
  }
  for(elem of document.getElementsByClassName("username")){
    elem.innerHTML = user.username + "#" + user.discriminator;
  }
  document.getElementById("email").innerHTML = user.email;
}


function displayLicense(license){
  document.getElementById("licenseKeyValue").innerHTML = license.license_key;
  if(license.ip_address){
    document.getElementById("ipAddress").innerHTML = license.ip_address;
  }
  else{
    document.getElementById("ipAddress").innerHTML = "Unbinded";
  }

}


function displaySubscription(subscription){
  let status = document.getElementById("status");
  let memberSince = document.getElementById("memberSince");
  let renewDate = document.getElementById("renewDate");

  memberSince.innerHTML += parseDate(subscription.created);
  renewDate.innerHTML = parseDate(subscription.current_period_end);

  status.innerHTML = subscription.status;
  if(subscription.status == "active"){
    status.style.color = "#00e8aa";
  }
  else{
    status.style.color = "rgb(232,93,108)";
  }
}


function parseDate(timestamp){
  var months = {
      0: "January",
      1: "February",
      2: "March",
      3: "April",
      4: "May",
      5: "June",
      6: "July",
      7: "August",
      8: "September",
      9: "October",
      10: "November",
      11: "December"
  }

  var date = new Date(timestamp * 1000);
  var stringDate = months[date.getMonth()] + " " + date.getDate() + " " + date.getFullYear();
  return stringDate;
}


function show_hide_license() {
  var blur = document.getElementsByClassName("licenseBlur")[0];
  let eye = document.getElementById("licenseEye");
  if (blur.style.display == "none") {
    blur.style.display = "block";
    eye.src="images/eye.svg";
  } else {
    blur.style.display = "none";
    eye.src="images/eye-off.svg";
  }
}


async function unbind(){
  loader.style.display = "grid";
  try{
    const unbind_response = await post_data((api_url + "unbind"), {token: session});

    if(unbind_response.status != 200){
      throw "An unexpected error occurred while fulfilling your request. Please try again.";
    }

    return location.reload();
  }
  catch(error){
    loader.style.display = "none";
    showError(error);
  }
}


async function joinDiscord(){
  loader.style.display = "grid";
  try{
    const join_response = await post_data((api_url + "join-discord"), {token: session});

    if(join_response.status != 200){
      throw "An unexpected error occurred while fulfilling your request. Please try again.";
    }

    loader.style.display = "none";
  }
  catch(error){
    loader.style.display = "none";
    showError(error);
  }
}


async function reset_ip(){
  if(!user_data.license.ip_address){
    return;
  }

  document.getElementById("resetIp").classList.add('spinIp');

  try{
    const change_ip_response = await post_data((api_url + "reset-ip"), {token: session});

    if(change_ip_response.status != 200){
      throw null;
    }

    document.getElementById("ipAddress").innerHTML = "Unbinded";
    document.getElementById("resetIp").classList.remove('spinIp');

  }
  catch(error){
    document.getElementById("resetIp").classList.remove('spinIp');
    document.getElementById("ipAddress").innerHTML = user_data.license.ip_address;
  }
}


async function activateLicense(){
  const licenseKey = document.getElementById("activateLicenseInput").value;
  if(licenseKey == null || licenseKey == ""){
    return;
  }

  loader.style.display = "grid";
  
  try{
    const activate_license_response = await post_data((api_url + "activate-license"), {token: session, licenseKey: licenseKey});

    if(activate_license_response.status != 200){
      if(activate_license_response.status == 404){
        throw "There is No License Associated with this Key. Please try again.";
      }
      if(activate_license_response.status == 400){
        throw "This License is Already Binded with Another Discord Account. Unbind your Old Account to Transfer the License.";
      }
      else{
        throw "An unexpected error occurred while fulfilling your request. Please try again.";
      }
    }

    location.reload();
  }
  catch(error){
    loader.style.display = "none";
    showError(error);
  }
}


async function manageSubscription(){
  loader.style.display = "grid";

  try{
    const client_portal_response = await post_data((api_url + "create-customer-portal-session"), {token: session});
    if(client_portal_response.status != 200){
      throw "An unexpected error occurred while fulfilling your request. Please try again.";
    }

    let response = await client_portal_response.json();

    window.location.href = response.sessionUrl;
  }
  catch(error){
    loader.style.display = "none";
    showError(error);
  }
}


async function loadPage(){
  session = getCookie("session");
  if(session == null || session == ""){
    return window.location.href = "login.html";
  }

  try{
    const license_response = await post_data((api_url + 'license'), {token: session});

    if(license_response.status != 200){
      if(license_response.status == 404){
        user_data = await license_response.json();
        displayUser(user_data.user);
        loader.style.display = "none";
        return document.getElementById("licenseActivation").style.display = "block";
      }
      else{
        throw "An unexpected error occurred while fulfilling your request. Please try again.";
      }
    }

    user_data = await license_response.json();
    
    displayLicense(user_data.license);
    displayUser(user_data.user);
    displaySubscription(user_data.subscription);

    loader.style.display = "none";
    document.getElementById("dashboard").style.display = "block";
  }
  catch(error){
    loader.style.display = "none";
    showError(error);
  }
}

loadPage();