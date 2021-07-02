document.getElementById('webhookClick').addEventListener('click', function(){
        console.log('clicked');
        console.log(document.getElementById('webhookId').value);
        setSiteValue("webhook",document.getElementById('webhookId').value);
});
function setSiteValue(site,value){
    chrome.storage.local.set({[site]: value}, function() {
        //console.log('Value is set to ' );
        console.log(value  + site + " is setted");
        prova(value);
      });}
function prova(pathChrome){

            //console.log('Value currently is ' + result.test);
            
            //"https://discord.com/api/webhooks/855491933510041642/wL4a0aRejclvstEBf8ogFFsZXdQ6NnNLD2EJw1nCLEHGSdbWmzz-EGHsVVxKWGPbKUHG"
            //result diventa adesso oggetto con il quale faro il tutto 
            //obj.linkPaypayl=document.URL;
            //api per collegamento con discord 
            const whurl=pathChrome;
            const msg =     {"content":document.URL};
            //compilo mandando tutte le info 
            a={
                
                "embeds": [
                {
                    "title": "Test bot",
                    "description": "questa e una prova per vedere come vaaaaaaaaaaaaaaaaaaaaaaaaaa",
                    "color": 5814783
                }
                ]
            }
            //parte di request dove mando tutte le cose 
            fetch(whurl, 
            {"method":"POST", 
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(a)})
            
          
    }