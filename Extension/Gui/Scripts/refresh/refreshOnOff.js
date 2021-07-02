function loadInzialSettings(){
    if (firstTime()){
        const arr=["onygoIndicator","zalandoIndicator","snsIndicator","supremeIndicator","soleboxIndicator","snipesIndicator"];
        //console.log("la lunghezza di arr e"+ arr.length)
        for (let x = 0; x<arr.length;x++){
            document.getElementById(arr[x]).addEventListener('click', function(){
                click(arr[x]);
            });
        }
    }
    //console.log("non mi sono ancora bloccato ")
    //document.getElementById('license').style.display = 'none';
    //console.log("sono nella parte del controllo della licenza");
    
}
function click(site){//pass a value like indicatorOnygo s
    console.log("sto elaborando il tutto");
    try {
        chrome.storage.local.get([site], function(result) {
            value = result[[site]]; 
            
            if (value){
                chrome.storage.local.set({[site]: false}, function() {
                  });
                return true;
            }
            else{
                chrome.storage.local.set({[site]: true}, function() {
                  });
            }
        });
    } catch (error) {
        return;
    }
}

function click1(site){//pass a value like indicatorOnygo s
    try {

            
                chrome.storage.local.set({[site]: true}, function() {
                  });
    } catch (error) {
        return;
    }
}
//change an element value in the dom so undestands if it is or not the first time
function firstTime(){
    console.log("sono qua dentro");
    console.log(document.getElementById("onygoSize").getAttribute("value"));
    if (document.getElementById("onygoSize").getAttribute("value")=="firsTime"){
        console.log("first time");
        document.getElementById("onygoSize").setAttribute("value", "1");
        return false;
    }
    return true;
}
setTimeout(loadInzialSettings,200);
