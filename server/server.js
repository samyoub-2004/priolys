require("dotenv").config();
const express = require('express');
const stripe = require('stripe')(process.env.API_STRIPE_KEY);
const cors = require('cors');

const app = express();

// Middleware CORS simple pour debug
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

// ✅ ROUTES CORRECTEMENT DÉFINIES
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'eur' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});