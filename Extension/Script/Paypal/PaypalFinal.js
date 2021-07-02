function sendToDiscordGeneral(site,size,linkProduct,linkPaypal,linkImage,webhook,productName){
    //result["test"]["linkPaypayl"]=document.URL;
    //console.log(JSON.stringify(result))
    
    //console.log(JSON.stringify(result["test"]["linkPaypayl"]))
    //result diventa adesso oggetto con il quale faro il tutto 
    //obj.linkPaypayl=document.URL;
    //api per collegamento con discord 
    const whurl="https://discord.com/api/webhooks/855491933510041642/wL4a0aRejclvstEBf8ogFFsZXdQ6NnNLD2EJw1nCLEHGSdbWmzz-EGHsVVxKWGPbKUHG";
    const msg =     {"content":document.URL};
    //compilo mandando tutte le info 
    a={
        "content": null,
        "embeds": [
        {
            "title": "✅ PRODOTTO ACQUISTATO  ✅",
            "description": "**STORE**: "+ site +" \n\n**PRODOTTO**: \n[Product " + productName +"]("+linkProduct +")\n\n**TAGLIA**:\n*"+size+"/*\n\n**LINK PAYPAL:**\n*" + "\n[Product " + "PAY HERE" +"]("+linkPaypal +")"+"*",
            "thumbnail": {"url": linkImage},
            "color": 5814783
        }
        ]
    }
    //parte di request dove mando tutte le cose 
    fetch(webhook, 
    {"method":"POST", 
    "headers": {"content-type": "application/json"},
    "body": JSON.stringify(a)});
    
}
function sendZalando(){
    
}
function returnAskedLocal(site,arr){
    var value;
    chrome.storage.local.get([site], function(result) {
            value = result[site];
            console.log("sono dentro returnlocal11" + site + value);
            arr[site]=value;
            return value;
    });
    //return value;
}

function whatToDo(){
    return new Promise(function(myResolve, myReject) {
            var zalando = returnAskedLocal("zalandoOnOffSite");
            var onygo =returnAskedLocal("onygoOnOffSite");
            var supreme =returnAskedLocal("surpemenOffSite");
            var sns =returnAskedLocal("snsnOffSite");
            var snipes =returnAskedLocal("snipesOffSite");
            var solebox =returnAskedLocal("soleboxOffSite");
            console.log("sono qua dentro e quindi dovrei essere displayato per ultimo")    
            if (zalando!= 5){
                myResolve(zalando);
            }
            else{
                myReject("Unable to get token");
            }
        // do something to response
        
    
    });
}
let arr={firstName:"John"};
var zalando = returnAskedLocal("zalandoOnOffSite",arr);
//var onygo =returnAskedLocal("onygoOnOffSite");
//var supreme =returnAskedLocal("surpemenOffSite");
//var sns =returnAskedLocal("snsnOffSite");
//var snipes =returnAskedLocal("snipesOffSite");
//var solebox =returnAskedLocal("soleboxOffSite");

setTimeout(() => {
    console.log("ora sono alla fine");
    console.log(arr.length);
    if (arr["zalandoOnOffSite"]){
        console.log(arr)
        var zalandoImageSite=returnAskedLocal("zalandoImageSite",arr); //1
        var zalandoSizeSite=returnAskedLocal("zalandoSizeSite",arr);//2
        var zalandoLinkSite = returnAskedLocal("zalandoLinkSite",arr);//3
        var webhook=returnAskedLocal("webhook",arr);//4
        var linkPaypal=document.URL;//5
        setTimeout(() => {
            sendToDiscordGeneral("Zalando",arr["zalandoSizeSite"],arr["zalandoLinkSite"],linkPaypal,arr["zalandoImageSite"],arr["webhook"],"test");
        }, 100);
    }
}, 20);