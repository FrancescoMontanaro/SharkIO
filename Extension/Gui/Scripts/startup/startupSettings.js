//in questo programma si intende un startup dopo che la licensa e stata verificata
//load the inizial settings

//load the settings for the number part so the settings for the size
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
function loadInzialSettings(){
    //document.getElementById('license').style.display = 'none';
    //console.log("sono nella parte del controllo della licenza");
    const arr=["onygoSize","zalandoSize","snsSize","supremeSize","soleboxSize","snipesSize"];
    //console.log("la lunghezza di arr e"+ arr.length)
    for (let x = 0; x<arr.length;x++){
        setTimeout(SetValuesHtml(arr[x],10));
    }
}
function SetValuesHtml(site){//pass a value like onygoSize
    try {
        chrome.storage.local.get([site], function(result) {
            value = result[[site]]; 
           
            //console.log("setted on html the value of :  " + JSON.stringify(result));
            if (value>30){
                document.getElementById(site).innerHTML=value;
            }
        });
    } catch (error) {
        
    }
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
loadInzialSettings();