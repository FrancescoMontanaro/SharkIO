let stripe = Stripe("pk_test_51Ib0AQJWFyT5O29wcfKU71mUEErYdnZOQfmDBJn8LE2ZBPrQsHYYArqA26nDHZXNIL1qCOyYZr1eLwa41ydPvaV6008ixDzyUB");
let elements = stripe.elements({
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600&display=swap',
    }
  ]
});
let customer;
let session;
let card;


async function paymentSubmitted(){
  loader.style.display = "grid";
  document.querySelector('#cardContainer').style.border = "none";

  let billingName = document.querySelector('#name').value;
  let payment_method;

  try{
    payment_method = await stripe.createPaymentMethod({type: 'card', card: card, billing_details: { name: billingName}});

    if(payment_method.error){
      throw payment_method.error;
    }
    
  }
  catch(error){
    loader.style.display = "none";
    return document.querySelector('#cardContainer').style.border = "1px solid rgb(232,93,108)";
  }

  createSubscription({customerId: customer, paymentMethodId: payment_method.paymentMethod.id});
}


function createSubscription({ customerId, paymentMethodId}) {
  return (
    fetch((api_url + 'create-subscription'), {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        customerId: customerId,
        paymentMethodId: paymentMethodId,
      }),
    })
      .then((response) => {
        if(response.status == 410){
          window.location.href = "oos.html";
        }
        if(response.status == 500){
          throw {error: {message: "An unexpected error occurred while fulfilling your request.<br> No amount has been detracted from your payment method."}};
        }
        return response.json();
      })
      .then((result) => {
        if (result.error) {
          loader.style.display = "none";
          throw result.error.message;
        }
        return result;
      })
      .then((result) => {
        return {
          paymentMethodId: paymentMethodId,
          subscription: result,
        };
      })
      .then(handlePaymentThatRequiresCustomerAction)
      .then(handleRequiresPaymentMethod)
      .then(onSubscriptionComplete)
      .catch((error) => {
          loader.style.display = "none";
          showError(error);
      })
  );
}


function handlePaymentThatRequiresCustomerAction({subscription, invoice, paymentMethodId, isRetry}) {
    if (subscription && subscription.status === 'active') {
      return { subscription, paymentMethodId };
    }
  
    let paymentIntent = invoice ? invoice.payment_intent : subscription.latest_invoice.payment_intent;
  
    if ( paymentIntent.status === 'requires_action' || (isRetry === true && paymentIntent.status === 'requires_payment_method')) {
      return stripe
        .confirmCardPayment(paymentIntent.client_secret, {
          payment_method: paymentMethodId,
        })
        .then((result) => {
          if (result.error) {
            throw result.error;
          } 
          else {
            if (result.paymentIntent.status === 'succeeded') {
              setTimeout(function(){
                loader.style.display = "none";
                window.location.href = "paymentSucceded.html";
              },2000);
              return {
                subscription: subscription,
                invoice: invoice,
                paymentMethodId: paymentMethodId,
              };
            }
          }
        })
        .catch((error) => {
            throw error.message;
        });
    } else {
      return { subscription, paymentMethodId };
    }
}


function handleRequiresPaymentMethod({subscription, paymentMethodId}){
    if (subscription.status === 'active') {
      return { subscription, paymentMethodId };
    }
    else if ( subscription.latest_invoice.payment_intent.status === 'requires_payment_method') {
      localStorage.setItem('latestInvoiceId', subscription.latest_invoice.id);
      localStorage.setItem('latestInvoicePaymentIntentStatus', subscription.latest_invoice.payment_intent.status);
      throw { error: { message: 'Your card was declined. Please try again.' } };
    } 
    else {
      return { subscription, paymentMethodId };
    }
}


function onSubscriptionComplete(result) {
  if (result.subscription.status === 'active') {
      setTimeout(function(){
        loader.style.display = "none";
        window.location.href = "paymentSucceded.html";
      },2000);
  }
}


function mount_card(){
  card = elements.create('card', {
    style: {
      base: {
        iconColor: '#fff',
        color: '#fff',
        fontFamily: 'Nunito Sans',
        fontWeight: 600,
        fontSize: '15px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': {
          color: '#fff',
        },
        '::placeholder': {
          color: 'rgb(182,193,207)',
        },
      },
      invalid: {
        iconColor: 'rgb(232,93,108)',
        color: 'rgb(232,93,108)',
      },
    },
  });

  card.mount('#card-element');
}


async function loadPage(){
  loader.style.display = "grid";
  session = getCookie("session");
  customer = sessionStorage.getItem('customer_id');
  if(session == null || session == ""){
    return window.location.href = "login.html";
  }
  if(!customer){
    return window.location.href = "customer.html";
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

    mount_card();
    loader.style.display = "none";

  }
  catch(error){
    loader.style.display = "none";
    showError(error);
  }
}


loadPage();