import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Configuration Stripe avec votre clé publique
const stripePromise = loadStripe(process.env.API_STRIPE_KEY);

// Style pour le CardElement
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

// Composant de formulaire de paiement
const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      // Simulation d'un appel au backend pour créer un PaymentIntent
      const response = await fetch('http://localhost:3001/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1999, // 19.99 EUR
          currency: 'eur'
        }),
      });

      const { clientSecret } = await response.json();

      // Confirmation du paiement avec Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Test Customer',
          },
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h2 style={styles.formTitle}>Test de Paiement</h2>
      {paymentSuccess ? (
        <div style={styles.successMessage}>
          Paiement réussi! Merci pour votre achat.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.paymentForm}>
          <div style={styles.cardElementContainer}>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button
            type="submit"
            disabled={!stripe || loading}
            style={styles.submitButton}
          >
            {loading ? 'Traitement...' : 'Payer 19.99€'}
          </button>
        </form>
      )}
    </div>
  );
};

// Page principale
const StripeTestPage = () => {
  return (
    <div style={styles.page}>
      <h1 style={styles.header}>Boutique de Test Stripe</h1>
      <div style={styles.container}>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};

// Styles
const styles = {
  page: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f6f9fc'
  },
  header: {
    color: '#32325d',
    textAlign: 'center',
    marginBottom: '40px'
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '30px'
  },
  formContainer: {
    maxWidth: '500px',
    margin: '0 auto'
  },
  formTitle: {
    color: '#32325d',
    marginBottom: '20px',
    textAlign: 'center'
  },
  paymentForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  cardElementContainer: {
    padding: '12px',
    border: '1px solid #e1e8ee',
    borderRadius: '4px',
    backgroundColor: 'white'
  },
  submitButton: {
    backgroundColor: '#5469d4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#3a4fbd'
    },
    ':disabled': {
      opacity: '0.7',
      cursor: 'not-allowed'
    }
  },
  error: {
    color: '#ff5252',
    marginTop: '10px'
  },
  successMessage: {
    color: '#4bb543',
    textAlign: 'center',
    fontSize: '18px',
    padding: '20px',
    backgroundColor: '#f0fff0',
    borderRadius: '4px'
  }
};

export default StripeTestPage;