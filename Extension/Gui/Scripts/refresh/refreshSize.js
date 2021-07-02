function size_clicked(event){
    let size = event.target;
    let current_size = get_child_by_class(get_child_by_class(size.closest('.dropdown'), 'dropdownBtn'), 'size');
    let arrow = get_child_by_class(get_child_by_class(size.closest('.dropdown'), 'dropdownBtn'), 'arrow');
    let dropdown_content = size.closest('.dropdown-content');
    console.log(size.value)
    current_size.innerHTML = size.value == 0 ? "any":size.value;
    arrow.style.transform = "rotate(0)";
    dropdown_content.style.display = "none";
}

for(elem of document.getElementsByClassName('sizeItemonygo')){
    elem.addEventListener('click', function(event){
        size_clicked(event);
        let size = event.target;
        value=size.value;
        setSiteValue("onygoSize",value);
    });

}
for(elem of document.getElementsByClassName('sizeItezalando')){
    elem.addEventListener('click', function(event){
        size_clicked(event);
        let size = event.target;
        value=size.value;
        setSiteValue("zalandoSize",value);
    });

}
for(elem of document.getElementsByClassName('sizeItesns')){
    elem.addEventListener('click', function(event){
        size_clicked(event);
        let size = event.target;
        value=size.value;
        setSiteValue("snsSize",value);
    });

}
for(elem of document.getElementsByClassName('sizeItesolebox')){
    elem.addEventListener('click', function(event){
        size_clicked(event);
        let size = event.target;
        value=size.value;
        setSiteValue("soleboxSize",value);
    });

}
for(elem of document.getElementsByClassName('sizeItesupreme')){
    elem.addEventListener('click', function(event){
        size_clicked(event);
        let size = event.target;
        value=size.value;
        setSiteValue("supremeSize",value);
    });

}
for(elem of document.getElementsByClassName('sizeItesnipes')){
    elem.addEventListener('click', function(event){
        size_clicked(event);
        let size = event.target;
        value=size.value;
        setSiteValue("snipesSize",value);
    });

}
//set the values inside the browser
function setSiteValue(site,value){
    chrome.storage.local.set({[site]: value}, function() {
        //console.log('Value is set to ' );
        console.log(value  + site + " is setted");
      });}