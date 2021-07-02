const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const Discord = require('discord.js');
const bot = new Discord.Client();
const fetch = require('node-fetch');
const origin = "https://sharkio-2021.web.app";
const sanitizer = require('sanitizer');
const functions = require('./functions');
const rateLimit = require("express-rate-limit");
const DiscordOauth2 = require("discord-oauth2");
const MongoClient = require('mongodb').MongoClient;
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const oauth = new DiscordOauth2({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET, redirectUri: `${origin}/success.html`});
const database_url = process.env.MONGODB_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@sharkio.wsawm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
let port = process.env.PORT || 5000;


// Middlewares
app.use(helmet());
app.use(express.static('.'));
app.use(cors({ origin: origin }));
app.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 100}));


// Connessione al Database
MongoClient.connect( database_url, { useUnifiedTopology: true }, function( err, client ) {
    if(err){
        return console.error(error);
    }

    // Login del Bot Discord.
    bot.login(process.env.BOT_SECRET).then(()=>{

        // Istanza Database
        const db = client.db("Database");


        /**
         * Ottiene il Token di Accesso di un Account Discord.
         * 
         * Input:
         * @code Codice di autorizzazione Discord.
         * 
         * Output:
         * @returns {token: <VALUE>} Se il processo di autenticazione va a buon fine (status: 200) 
         * restituisce un oggetto 'token' contenente il token di accesso Discord.
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/authorize', express.json(), async(req, res) =>{
            const code = sanitizer.escape(req.body.code);

            try{
                const token = await oauth.tokenRequest({
                    code: code,
                    grantType: "authorization_code",
                    redirectUri: `${origin}/success.html`,  // TO CHANGE
                });

                return res.status(200).send({token: token.access_token});
            }
            catch(error){
                console.error(error.message);
                return res.sendStatus(500);
            }
        });


        /**
         * Ottiene tutte le informazioni su un determinato utente.
         * 
         * Input:
         * @token Token di Accesso Discord.
         * 
         * Output:
         * @returns {user: <OBJECT>, license: <OBJECT>, subscription: <OBJECT>} Se il processo va a buon fine (status: 200) 
         * restituisce un oggetto contenente l'account Discord dell'utente, la Licenza e le informazioni sull'abbonamento Stripe.
         * @returns {404} Se all'utente Discord non è legata alcuna Licenza.
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/license', express.json(), async(req, res) =>{
            const token = sanitizer.escape(req.body.token);

            try{
                const user = await oauth.getUser(token);

                const license = await db.collection('licenses').findOne({discord_user_id: user.id});

                if(license){
                    const subscription = await stripe.subscriptions.retrieve(license.subscription_id);
                    return res.status(200).send({user: user, license: license, subscription: subscription});
                }
                else{
                    return res.status(404).send({user: user});
                }
            }
            catch(error){
                console.error(error.message);
                return res.sendStatus(500);
            }
        });


        /**
         * Attiva e lega una licenza esistente ad un nuovo utente Discord.
         * 
         * Input:
         * @token Token di Accesso Discord.
         * @license_key Chiave di licenza.
         * 
         * Output:
         * @returns {200} Se il processo va a buon fine aggiorna le informazioni della licenza e del Customer Stripe 
         * legando entrambi al nuovo utente Discord.
         *
         * @returns {400} Se la licenza è già associata ad un altro utente Discord.
         * @returns {404} Se la chiave di licenza non esiste.
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/activate-license', express.json(), async(req, res) =>{
            const token = sanitizer.escape(req.body.token);
            const license_key = sanitizer.escape(req.body.licenseKey);

            try{
                const user = await oauth.getUser(token);

                const license = await db.collection('licenses').findOne({license_key: license_key});

                if(license){
                    if(license.discord_user_id){
                        return res.sendStatus(400);
                    }
                    const subscription = await stripe.subscriptions.retrieve(license.subscription_id);

                    const customer = await stripe.customers.retrieve(subscription.customer);

                    let metadata = customer.metadata;
                    metadata.discordUserId = user.id;

                    await db.collection('licenses').updateOne({license_key: license_key}, {$set: {discord_user_id: user.id}});

                    await stripe.customers.update(customer.id, {metadata: metadata});

                    return res.sendStatus(200);
                }

                return res.sendStatus(404);
            }
            catch(error){
                console.error(error.message);
                return res.sendStatus(500);
            }
        });


        /**
         * Scollega l'account Discord da una determinata licenza, invia DM all'utente con la 
         * chiave di licenza ed espelle l'utente dal server Discord.
         * 
         * Input:
         * @token Token di Accesso Discord.
         * 
         * Output:
         * @returns {200} Se il processo va a buon fine aggiorna le informazioni della licenza e del Customer Stripe 
         * scollegando entrambi dal corrispondente utente Discord.
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/unbind', express.json(), async (req, res) =>{
            const token = sanitizer.escape(req.body.token);

            try{
                const user = await oauth.getUser(token);

                const user_guilds = await oauth.getUserGuilds(token);

                if(!user_guilds.map(x => x.id).includes(process.env.GUILD_ID)){
                    await oauth.addMember({
                        accessToken: token,
                        botToken: process.env.BOT_SECRET,
                        guildId: process.env.GUILD_ID,
                        userId: user.id,
                    });
                }

                const license = await db.collection("licenses").findOneAndUpdate({discord_user_id: user.id}, {$set:{discord_user_id: null}});

                const subscription = await stripe.subscriptions.retrieve(license.value.subscription_id);

                const customer = await stripe.customers.retrieve(subscription.customer);

                let metadata = customer.metadata;
                metadata.discordUserId = null;

                await stripe.customers.update(customer.id, {metadata: metadata});

                let description = 'Here is your **License Key**,\nMake sure you keep it in a safe place!\n ``' + license.value.license_key + '``';

                const embed = new Discord.MessageEmbed()
                .setColor('#f07929')
                .setAuthor("SharkIO")
                .setTitle('**Unbind Completed Successfully**')
                .setDescription(description)
                .setThumbnail('https://i.imgur.com/Rg5acLo.png')
                .setFooter("SharkIO", "https://i.imgur.com/LYqlQbT.png")


                const discord_user = await bot.users.fetch(user.id);

                await discord_user.send(embed);

                await fetch(`https://discord.com/api/v8/guilds/${process.env.GUILD_ID}/members/${user.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bot ${process.env.BOT_SECRET}`,
                    }
                });

                return res.sendStatus(200);
            }
            catch(error) {
                console.error(error);
                return res.sendStatus(500);
            }
        });



        /**
         * Aggiunge un utente al server Discord.
         * 
         * Input:
         * @token Token di Accesso Discord.
         * 
         * Output:
         * @returns {200} Se il processo va a buon fine aggiunge l'utente al server Discord.
         * @returns {400} Se l'utente Discord non dispone di alcuna licenza.
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/join-discord',express.json(), async (req, res) =>{
            const token = sanitizer.escape(req.body.token);

            try{
                const user = await oauth.getUser(token);

                const license = await db.collection('licenses').findOne({discord_user_id: user.id});

                if(!license){
                    return res.sendStatus(400);
                }

                await oauth.addMember({
                    accessToken: token,
                    botToken: process.env.BOT_SECRET,
                    guildId: process.env.GUILD_ID,
                    userId: user.id,
                });

                return res.sendStatus(200);
            }
            catch(error){
                console.error(error);
                return res.sendStatus(500);
            }
        });

        
        /**
         * Crea un nuovo Customer Stripe a cui lega l'Id Discord dell'utente.
         * 
         * Input:
         * @email Email dell'utente.
         * @token Token di Accesso Discord.
         * 
         * Output:
         * @returns {customer: <OBJECT>} Se il processo va a buon fine (status: 200) restutuisce l'oggetto 
         * Customer Stripe creato.
         * @returns {403} Se l'account Discord è già legato ad un'altra licenza.
         * @returns {410} Se il prodotto è Out Of Stock per cui l'abbonamento non può essere creato.
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/create-customer', express.json(), async(req, res) =>{
            const email = sanitizer.escape(req.body.email);
            const token = sanitizer.escape(req.body.token);

            try{
                const stock = await db.collection('stock').findOne({name: "stock"});

                if(stock <= 0){
                    return res.sendStatus(410);
                }

                const user = await oauth.getUser(token);

                if(await db.collection("licenses").findOne({discord_user_id: user.id})){
                    return res.sendStatus(403);
                }

                const customer = await stripe.customers.create({
                    email: email,
                    metadata: {discordUserId: user.id}
                });

                return res.status(200).send({customer: customer});
            }
            catch (error){
                console.error(error.message);
                return res.sendStatus(500);
            }
        });
        

        /**
         * Lega ad un determinato Customer Stripe un metodo di pagamento di default e crea l'abbonamento.
         * 
         * Input:
         * @customerId Id del Customer Stripe.
         * @paymentMethodId Id del metodo di pagamento Stripe.
         * 
         * Output:
         * @returns {subscription: <OBJECT>} Se il processo va a buon fine (status: 200) restutuisce l'oggetto 
         * Subscription Stripe creato.
         * @returns {402} Se si verifica un errore nel processo di setting del metodo di pagamento di default del Customer.
         * @returns {403} Se l'account Discord è già legato ad un'altra licenza.
         * @returns {410} Se il prodotto è Out Of Stock per cui l'abbonamento non può essere creato.
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/create-subscription', express.json(), async(req,res) =>{
            const customerId = sanitizer.escape(req.body.customerId);
            const paymentMethodId = sanitizer.escape(req.body.paymentMethodId);

            try{
                const stock = await db.collection('stock').findOne({name: "stock"});
                if(stock.stock <= 0){
                    return res.sendStatus(410);
                }

                const customer = await stripe.customers.retrieve(customerId);

                if(await db.collection("licenses").findOne({discord_user_id: customer.metadata.discordUserId})){
                    return res.sendStatus(403);
                }

                try{
                    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        
                    await stripe.customers.update(
                        customerId,{
                            invoice_settings: {
                                default_payment_method: paymentMethodId,
                            },
                        }
                    );
                }
                catch (error){
                    console.error(error);
                    return res.status(402).send({ error: { message: error.message } });
                }

                const subscription = await stripe.subscriptions.create({
                    customer: customerId,
                    items: [{
                    price: process.env.RENEWAL_ID
                    }],
                    add_invoice_items: [{
                    price: process.env.LICENSE_KEY_ID,
                    }],
                    expand: ['latest_invoice.payment_intent'],
                });
            
                return res.status(200).send(subscription);

            }
            catch (error) {
                console.error(error);
                return res.sendStatus(500);
            }
        });


        /**
         * Inserisce un utente in coda per il pagamento.
         * 
         * Input:
         * @customerId Id del Customer Stripe.
         * 
         * Output:
         * @returns {200} Se il processo va a buon fine l'utente viene inserito in coda con il timestamp corrente.
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/queue', express.json(), async(req,res) =>{
            const token = sanitizer.escape(req.body.token);
            const timestamp = Date.now();

            try{
                const user = await oauth.getUser(token);

                const queue_customer = await db.collection('queue').findOne({discord_id: user.id});

                if(!queue_customer){
                    await db.collection('queue').insertOne({discord_id: user.id, creation: timestamp});
                }

                return res.sendStatus(200);
                
            }
            catch(error){
                console.error(error);
                return res.sendStatus(500);
            }
        });


        /**
         * Ottiene lo Stock residuo.
         * 
         * Output:
         * @returns {stock: <VALUE>} Se il processo va a buon fine (status: 200) restituisce 0 se lo 
         * stock è esaurito, 1 altrimenti.
         * @returns {500} Se si verifica un errore generico.
         **/
        app.get('/stock', async(req,res) =>{
            try{
                const stock_document = await db.collection('stock').findOne({name: "stock"});
                const stock = stock_document.stock <= 0 ? 0 : 1;
                return res.status(200).send({stock:  stock});
            }
            catch(error){
                console.error(error.message);
                return res.sendStatus(500);
            }
        });


        /**
         * Aggiorna l'indirizzo IP della licenza collegata ad un determinato utente.
         * 
         * Input:
         * @token Token di Accesso Discord.
         * @ip Indirizzo IP a cui legare la licenza.
         * 
         * Output:
         * @returns {newIp: <VALUE>} Se il processo va a buon fine (status: 200) restituisce un oggetto contenente 
         * il nuovo indirizzo IP.
         * @returns {400} Se il nuovo indirizzo IP non ripetta la struttura corretta. 
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/update-ip', express.json(), async(req,res) =>{
            const token = sanitizer.escape(req.body.token);
            const ip = sanitizer.escape(req.body.ip);

            let ipv4_regex = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;

            if(!ipv4_regex.test(ip)){
                return res.status(400).send({error: "IP address do not metch the expected pattern"});
            }

            try{
                const user = await oauth.getUser(token);

                await db.collection("licenses").findOneAndUpdate({discord_user_id: user.id},{$set:{ip_address: ip}});

                return res.status(200).send({newIp: ip});
            }
            catch(error){
                console.error(error.message);
                return res.sendStatus(500);
            }

        });



        /**
         * Resetta l'indirizzo IP della licenza collegata ad un determinato utente.
         * 
         * Input:
         * @token Token di Accesso Discord.
         * 
         * Output:
         * @returns {200} Se il processo va a buon fine (status: 200) restituisce un oggetto contenente 
         * il nuovo indirizzo IP.
         * @returns {500} Se si verifica un errore generico.
         **/
         app.post('/reset-ip', express.json(), async(req,res) =>{
            const token = sanitizer.escape(req.body.token);

            try{
                const user = await oauth.getUser(token);

                await db.collection("licenses").findOneAndUpdate({discord_user_id: user.id},{$set:{ip_address: null}});

                return res.sendStatus(200);
            }
            catch(error){
                console.error(error.message);
                return res.sendStatus(500);
            }

        });

        /**
         * Riceve l'evento Stripe di Update di un abbonamento e inserisce una nuova licenza nel Database legandola
         * al relativo utente se e solo se l'iscrizione è attiva (il pagamento è andato a buon fine) e il flag 'newCustomer' 
         * è settato a true. 
         * 
         * Input:
         * @sig Firma digitale dell'evento Stripe.
         * 
         * Output:
         * @returns {200} Se il processo si conclude correttamente.
         * @returns {400} Se la firma digitale dell'evento Stripe non è corretta. 
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/subscription-updated', express.raw({type: 'application/json'}), async(req, res) => {
            const sig = req.headers['stripe-signature'];
            
            let event;
            
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, process.env.SUBSCRIPTION_UPDATED_SECRET);
            } catch (err) {
                console.log(`❌ Error message: ${err.message}`);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            try{
                let data = event.data.object;
                if(event.type == "customer.subscription.updated" && data.status == "active"){
                    const customer = await stripe.customers.retrieve(data.customer);

                    let metadata = customer.metadata;

                    if(metadata.newCustomer){
                        let license = {license_key: functions.generate_key(20), discord_user_id: metadata.discordUserId, subscription_id: data.id, ip_address: null};
                        
                        await db.collection('licenses').insertOne(license);

                        metadata.newCustomer = false;
                        await stripe.customers.update(customer.id, {metadata: metadata});
                    }

                    return res.sendStatus(200);
                }

                return res.sendStatus(200);
            }
            catch(error){
                console.error(error);
                return res.sendStatus(500);
            }
        });


        /**
         * Riceve l'evento Stripe di creazione di un abbonamento e inserisce una nuova licenza nel Database legandola
         * al relativo utente se e solo se il pagamento è andato a buon fine. Nel caso in cui il pagamento fallisse setta un
         * flag 'newCustomer' nei metadati del Customer Stripe in modo da riconoscere che la licenza non è stata ancora fornita. 
         * 
         * Input:
         * @sig Firma digitale dell'evento Stripe.
         * 
         * Output:
         * @returns {200} Se il processo si conclude correttamente.
         * @returns {400} Se la firma digitale dell'evento Stripe non è corretta. 
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/subscription-created', express.raw({type: 'application/json'}), async(req, res) => {
            const sig = req.headers['stripe-signature'];
            
            let event;
            
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, process.env.SUBSCRIPTION_CREATED_SECRET);
            } catch (err) {
                console.log(`❌ Error message: ${err.message}`);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            if(event.type == "customer.subscription.created"){
                try{
                    let data = event.data.object;
                    const customer = await stripe.customers.retrieve(data.customer);

                    let metadata = customer.metadata;
                    metadata.subscriptionId = data.id;

                    if(data.status == "active"){
                        metadata.newCustomer = false;
                        let license = {license_key: functions.generate_key(20), discord_user_id: metadata.discordUserId, subscription_id: data.id, ip_address: null};

                        await db.collection('licenses').insertOne(license);
                    }
                    else{
                        metadata.newCustomer = true;
                    }

                    await stripe.customers.update(customer.id, {metadata: metadata});

                    return res.sendStatus(200);
                }
                catch(error){
                    console.error(error);
                    return res.sendStatus(500);
                }
            }
                
            return res.sendStatus(200);
        });


        /**
         * Crea la sessione del portale cliente Stripe per un determinato utente.
         * 
         * Input:
         * @token Token di Accesso Discord.
         * 
         * Output:
         * @returns {sessionUrl: <VALUE>} Se il processo va a buon fine (status: 200) restituisce un oggetto 'sessionUrl' 
         * contentente l'url sessione del portale cliente Stripe.
         * @returns {500} Se si verifica un errore generico.
         **/
        app.post('/create-customer-portal-session', express.json(), async (req, res) => {
            const token = sanitizer.escape(req.body.token);

            try{
                const user = await oauth.getUser(token);

                const license = await db.collection('licenses').findOne({discord_user_id: user.id});

                const subscription = await stripe.subscriptions.retrieve(license.subscription_id);

                const session = await stripe.billingPortal.sessions.create({
                    customer: subscription.customer,
                    return_url: `${origin}/dashboard.html`
                });

                return res.status(200).send({sessionUrl: session.url});
            }
            catch(error){
                console.error(error.message);
                return res.sendStatus(500);
            }        
        });


        app.listen(port, () =>{ console.log(`Application listening on port ${port}`)});

    })
});