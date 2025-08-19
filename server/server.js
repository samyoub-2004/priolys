require("dotenv").config();
const express = require('express');
const stripe = require('stripe')(process.env.API_STRIPE_KEY);
const cors = require('cors');

const app = express();

// Configuration CORS pour autoriser des URLs spécifiques
const corsOptions = {
  origin: function (origin, callback) {
    // Liste des URLs autorisées
    const allowedOrigins = [
      'https://priolys.onrender.com/',
      'https://www.votre-domaine.com',
      'http://localhost:3000', // Pour le développement
      'http://127.0.0.1:3000'  // Alternative localhost
    ];
    
    // Autoriser les requêtes sans origine (comme Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Si vous avez besoin de cookies/authentification
  optionsSuccessStatus: 200 // Pour les navigateurs plus anciens
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'eur' } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Erreur création PaymentIntent:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});