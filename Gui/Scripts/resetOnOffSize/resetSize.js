function resetSize(){
    const arr=["onygoIndicator","zalandoIndicator","snsIndicator","supremeIndicator","soleboxIndicator","snipesIndicator"];
    for (let x = 0; x<arr.length;x++){
        setSiteValue("sizeItem"+arr[x],"any");
    }
}   
function setSiteValue(site,value){
    chrome.storage.local.set({[site]: value}, function() {
        //console.log('Value is set to ' );
        //console.log(value  + site + " is setted");
      });}
