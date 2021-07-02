function returnAskedLocal(site){
    chrome.storage.local.get([site], function(result) {
            var value = result[site];
            return value;
    });
    console.log("sono dentro returnlocal");
}