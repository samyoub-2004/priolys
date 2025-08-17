const express = require('express');
const stripe = require('stripe')('sk_test_51Rx3tvLqsvouAgjJjIbT11c9IhGZxcRQQpH4HiD1kJybnM5JplT6WiyaBWYevEirLUH7J9eJ2JjC3roKxeJ1hudT00Fn2smu4Y');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      // Pour les tests, vous pouvez ajouter des paramètres supplémentaires:
      metadata: { integration_check: 'accept_a_payment' }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});