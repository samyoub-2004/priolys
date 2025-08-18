const express = require('express');
const stripe = require('stripe')("sk_test_51Rx3tvLqsvouAgjJjIbT11c9IhGZxcRQQpH4HiD1kJybnM5JplT6WiyaBWYevEirLUH7J9eJ2JjC3roKxeJ1hudT00Fn2smu4Y");
const cors = require('cors');

const app = express();
app.use(cors());
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