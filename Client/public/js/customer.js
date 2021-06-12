let session;


async function createCustomer(){
    let billingEmail1 = document.querySelector('#email1');
    let billingEmail2 = document.querySelector('#email2');
    billingEmail1.style.border = "none";
    billingEmail2.style.border = "none";

    if(billingEmail1.value != billingEmail2.value){
        billingEmail1.style.border = "1px solid rgb(232,93,108)";
        billingEmail2.style.border = "1px solid rgb(232,93,108)";
        return;
    }

    if(!validateEmail(billingEmail1.value)){
        billingEmail1.style.border = "1px solid rgb(232,93,108)";
        return;
    }

    if(!validateEmail(billingEmail2.value)){
        billingEmail2.style.border = "1px solid rgb(232,93,108)";
        return;
    }

    loader.style.display = "grid";

    try{
      const response = await post_data((api_url + 'create-customer'), {email: billingEmail1.value, token: session});

      if(response.status != 200){
        if(response.status == 410){
          return window.location.href = "oos.html";
        }
        else{
          throw "An unexpected error occurred while fulfilling your request. Please try again.";
        }
      }

      const customer = (await response.json()).customer;

      sessionStorage.setItem('customer_id', customer.id);

      window.location.href = "payment.html";

    }
    catch(error){
      loader.style.display = "none";
      showError(error);
    }
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

async function loadPage(){
  loader.style.display = "grid";
  session = getCookie("session");
  if(session == null || session == ""){
    return window.location.href = "login.html";
  }

  try{
    const stock_response = await get_data((api_url + "stock"));

    if(stock_response.status != 200){
      throw("An unexpected error occurred while fulfilling your request. Please try again.");
    }

    const stock = (await stock_response.json()).stock;

    if(stock <= 0){
      return window.location.href = "oos.html";
    }

    loader.style.display = "none";

  }
  catch(error){
    loader.style.display = "none";
    showError(error);
  }
}

loadPage();