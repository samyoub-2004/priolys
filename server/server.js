require("dotenv").config();
const express = require('express');
const stripe = require('stripe')(process.env.API_STRIPE_KEY);
const cors = require('cors');

const app = express();

// Configuration CORS simplifiée et corrigée
const corsOptions = {
  origin: [
    'https://priolys.onrender.com',
    'https://www.votre-domaine.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://priolys-1.onrender.com' // Ajoutez aussi ceci si nécessaire
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware CORS
app.use(cors(corsOptions));

// Gérer explicitement les requêtes OPTIONS (préflight)
app.options('*', cors(corsOptions));

// Autres middlewares
app.use(express.json());

// Routes
app.post('/create-payment-intent', async (req, res) => {
  // Ajouter manuellement les headers CORS pour plus de sécurité
  res.header('Access-Control-Allow-Origin', 'https://priolys.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  const { amount, currency = 'eur' } = req.body;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error('Erreur création PaymentIntent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route santé pour tester
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});