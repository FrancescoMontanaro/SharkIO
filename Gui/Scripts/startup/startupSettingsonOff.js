function loadInzialSettings(){
    //console.log("non mi sono ancora bloccato ")
    //document.getElementById('license').style.display = 'none';
    //console.log("sono nella parte del controllo della licenza");
    const arr=["onygoIndicator","zalandoIndicator","snsIndicator","supremeIndicator","soleboxIndicator","snipesIndicator"];
    //console.log("la lunghezza di arr e"+ arr.length)
    for (let x = 0; x<arr.length;x++){
        SetValuesHtmlOnOff(arr[x],0);
    }
}
function SetValuesHtmlOnOff(site){//pass a value like indicatorOnygo s
    try {
        chrome.storage.local.get([site], function(result) {
            value = result[[site]]; 
            
            if (value){
                console.log("sono su true");
            }
            else if (value ==false){
                console.log("sono su false");
                document.getElementById(site).click();
                chrome.storage.local.set({[site]: false}, function() {
                    //console.log('Value is set to ' );
                    
                  });
            }
            else{
                console.log("sono su else");
                value=false;
                //document.getElementById(site).click();
                chrome.storage.local.set({[site]: true}, function() {
                    //console.log('Value is set to ' );
                    
                  });
            }
        });
    } catch (error) {
        return;
    }
}
function setFromZero(){
    
}
loadInzialSettings();