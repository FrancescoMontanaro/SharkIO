# SharkIO

SharkIO is a Web Application which allows users to subscribe and manage their subscription to a generic digital service (in this case a google chrome extension).

To access the service users have to login with their Discord Account. Once logged in, they can subscribe to the service by paying with their credit card.
The payment flow has been implemented by using Stripe's technologies. In this case, the subscription is composed by an initial setup fee, plus a recurrent monthly payment.
Once that users are subscribed to the service, they can access their personal dashboard, through which thay can retrive all the information related to their subscription, or perform some actions such as:
- Manage their subscription.
- Join the Official Discord's Server of the Service.
- Unbind their license from their current Discord Account.
- Reset the IP address on which the software is binded (in this case google chrome's extension). 

A complete Demo of the Web Application can be found at the following URL:
[SharkIO](https://sharkio-2021.web.app/)

To try the subscription flow and access all the dashboard's functionalities it is possible to subscribe by using one of the Stripe's testing credit cards. More information at the following URL: 
[Stripe Testing Cards](https://stripe.com/docs/testing)

Here are some pictures:

<div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
  <img width="48%" alt="Login" src="https://user-images.githubusercontent.com/56433128/121780963-f3c75700-cba2-11eb-936a-7a2613de42df.png">
  <img width="48%" alt="Payment" src="https://user-images.githubusercontent.com/56433128/121780972-fa55ce80-cba2-11eb-95c8-01f00ac7d7f7.png">
  <img width="48%" alt="Dashboard" src="https://user-images.githubusercontent.com/56433128/121780978-fde95580-cba2-11eb-86f8-ffa181b8917a.png">
  <img width="48%" alt="Schermata 2021-06-12 alle 17 37 33" src="https://user-images.githubusercontent.com/56433128/121781481-473aa480-cba5-11eb-8b5c-f009df646540.png">
  <img width="48%" alt="Schermata 2021-06-12 alle 17 37 46" src="https://user-images.githubusercontent.com/56433128/121781496-59b4de00-cba5-11eb-8606-fad918db231d.png">
  <img width="48%" alt="Schermata 2021-06-12 alle 17 38 15" src="https://user-images.githubusercontent.com/56433128/121781502-5e799200-cba5-11eb-8167-236428f39b71.png">
</div>
