import express from 'express'
import dotenv from 'dotenv';


dotenv.config({ path: '.env' })
const app = express();


app.set('view engine', 'pug'); // Activamos el motor de vista pug
app.set('views', './views'); //Le decimos donde estan guardadas las vistas

app.use(express.static('public'))

//Habilitar lectura de formularios
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get('/', async (req, res) => {
    const CLIENT_ID = process.env.CLIENTID
    const APP_SECRET = process.env.APPSECRET

    // base URL will need to change for production applications
    const baseURL = {
        sandbox: "https://api-m.sandbox.paypal.com",
        production: "https://api-m.paypal.com"
    };

    // call this function to create your client token
    async function generateClientToken() {
        const accessToken = await generateAccessToken();
        const response = await fetch(`${baseURL.sandbox}/v1/identity/generate-token`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Accept-Language": "es_MX",
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data.client_token;
    }

    // access token is used to authenticate all REST API requests
    async function generateAccessToken() {
        const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
        const response = await fetch(`${baseURL.sandbox}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        const data = await response.json();
        return data.access_token;
    }
    const clientToken = await generateClientToken()
    res.render('home', {
        clientToken,
        clientId: CLIENT_ID
    })
})

app.post('/api/orders', async (req, res) => {
    const CLIENT_ID = process.env.CLIENTID
    const APP_SECRET = process.env.APPSECRET
    const baseURL = {
        sandbox: "https://api-m.sandbox.paypal.com",
        production: "https://api-m.paypal.com"
    };
    const purchaseAmount = "1000.00"; // TODO: pull prices from a database
    const accessToken = await generateAccessToken();
    const url = `${baseURL.sandbox}/v2/checkout/orders`;

    async function generateAccessToken() {
        const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
        const response = await fetch(`${baseURL.sandbox}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        const data = await response.json();
        return data.access_token;
    }


    const response = await fetch(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            application_context: {
                shipping_preference: 'NO_SHIPPING'
            },
            purchase_units: [
                {
                    amount: {
                        currency_code: "MXN",
                        value: purchaseAmount,
                    },
                },
            ],
            payee: {
                "email": "alejandrormzqzda@gmail.com"
            },
        }),
    });
    if (response.status === 200 || response.status === 201) {
        // console.log(response.json())
        return res.json(await response.json())
    }
    console.log(response.status)
    const errorMessage = await response.text();
    throw new Error(errorMessage);
})
const PORT = 4004
app.listen(PORT, () => {
    console.log('Servidor listo en el puerto ', PORT)
});