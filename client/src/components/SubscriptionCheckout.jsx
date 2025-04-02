import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ plan, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          paymentMethodId: paymentMethod.id
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        onSuccess(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-2 border rounded" />
      {error && <div className="text-red-500">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
      >
        {processing ? 'Processing...' : `Subscribe to ${plan} Plan`}
      </button>
    </form>
  );
};

const SubscriptionCheckout = ({ plan }) => {
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="text-center p-6 bg-green-100 rounded">
        <h3 className="text-xl font-bold text-green-800">Subscription Successful!</h3>
        <p>Welcome to our {plan} plan. Enjoy unlimited music streaming.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm plan={plan} onSuccess={() => setSuccess(true)} />
    </Elements>
  );
};