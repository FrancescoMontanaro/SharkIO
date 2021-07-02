function size_clicked(event){
    let size = event.target;
    let current_size = get_child_by_class(get_child_by_class(size.closest('.dropdown'), 'dropdownBtn'), 'size');
    let arrow = get_child_by_class(get_child_by_class(size.closest('.dropdown'), 'dropdownBtn'), 'arrow');
    let dropdown_content = size.closest('.dropdown-content');

    current_size.innerHTML = size.value == 0 ? "any":size.value;
    arrow.style.transform = "rotate(0)";
    dropdown_content.style.display = "none";
}

function get_child_by_class(elem, c){
    for(child of elem.childNodes){
        if(child.classList)
            if(child.classList.contains(c))
                return child;
    }
}

function show_hide_size(event){
    let target = event.target;
    let parent = target.closest('div');

    let dropdown_content = get_child_by_class(parent, 'dropdown-content');
    let arrow = get_child_by_class(get_child_by_class(parent, 'dropdownBtn'), 'arrow');

    if(dropdown_content.style.display == "block"){
        dropdown_content.style.display = "none";
        arrow.style.transform = "rotate(0)";
        
    }
    else{
        dropdown_content.style.display = "block";
        arrow.style.transform = "rotate(180deg)";
    }
}

function show_settings(){
    document.getElementById('settings').style.display = 'block';
}

// Qua andrà chiamata la funzione server che controlla la licenza - DA IMPLEMENTARE
function check_license(){
    document.getElementById('license').style.display = 'none';
    show_report_message("loading", "Collecting Product's Data...");
    console.log("fatto il report");
}

// Funzione di logout - DA IMPLEMENTARE
function logout(){
    console.log("LOGOUT");
}


function close_settings(){
    document.getElementById('settings').style.display = 'none';
}

document.getElementById('licenseActivationBtn').addEventListener('click', function(){
    check_license();
});

document.getElementById('closeSettingsBtn').addEventListener('click', function(){
    close_settings();
});

document.getElementById('logoutBtn').addEventListener('click', function(){
    logout();
});

document.getElementById('showSettingsBtn').addEventListener('click', function(){
    show_settings();
});

document.getElementById('resetBtn').addEventListener('click', function(){
    console.log("RESET");
    resetOnoOff();
    resetSize();
});

for(elem of document.getElementsByClassName('dropdownBtn')){
    elem.addEventListener('click', function(event){
        show_hide_size(event);
    });
}

for(elem of document.getElementsByClassName('sizeItem')){
    elem.addEventListener('click', function(event){
        size_clicked(event);
    });
}

for(elem of document.getElementsByClassName('switch')){
    elem.addEventListener('click',function(event){
        let target = event.target;

        if(target.classList.contains("on")){
            target.classList.remove("on");
            console.log("OFF");
        }
        else{
            target.classList.add("on");
            console.log("ON");
        }
    })
}

// PRENDE IN INPUT UNA MODALITA' TRA: ERROR, LOADING E SUCCESS E UNA STRINGA DI TESTO
// E MOSTRA LA RELATIVA NOTIFICA.
function show_report_message(mode, message){
    let reportMessage = document.getElementById('reportMessage');
    let message_text = document.getElementById('messageText');
    let message_icon = document.getElementById('messageIcon');
    let loader = document.getElementById('loader');

    loader.style.display = 'none';

    if(mode == "error"){
        message_icon.src = "images/alert.svg";
        message_icon.style.display = "block";
    }
    else if(mode == "success"){
        message_icon.src = "images/greenCheck.svg";
        message_icon.style.display = "block";
    }
    else if(mode == "loading"){
        message_icon.style.display = "none";
        loader.style.display = 'block';
    }

    message_text.innerHTML = message;
    reportMessage.style.display = 'flex';
}

function hide_report_message(){
    document.getElementById('reportMessage').style.display = 'none';
}


// DEMO
show_report_message("loading", "Collecting Product's Data...");

setTimeout(function(){
    show_report_message("success", "Product Data Collected!");
},3000);

setTimeout(function(){
    show_report_message("loading", "Adding to Cart...");
},5000);

setTimeout(function(){
    show_report_message("error", "Error while Adding to Cart");
},7000);

setTimeout(function(){
    hide_report_message();
},9000);
function resetOnoOff(){
    console.log("reset onoFf");
    const arr=["onygoIndicator","zalandoIndicator","snsIndicator","supremeIndicator","soleboxIndicator","snipesIndicator"];
    for (let x = 0; x<arr.length;x++){
        setSiteValue(arr[x],true);
    }
}   
function setSiteValue(site,value){
    chrome.storage.local.set({[site]: value}, function() {
        //console.log('Value is set to ' );
        //console.log(value  + site + " is setted");
      });}
function resetSize(){
        console.log("reset size");
        const arr=["onygo","zalando","sns","supreme","solebox","snipes"];
        for (let x = 0; x<arr.length;x++){
            setSiteValue(arr[x]+"Size","any");
        }
    }   
function setSiteValue(site,value){
        chrome.storage.local.set({[site]: value}, function() {
            //console.log('Value is set to ' );
            //console.log(value  + site + " is setted");
          });}
    