import "./styles.css";
import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";


const BASE_URL = `https://esrt0m8cge.execute-api.us-east-1.amazonaws.com/dev`;
const stripePromise = loadStripe(
  "pk_test_51J0DOOCTcNp75qbeymvieY8u4BgBox38XeIa7F3tEheBzdJ5aXIDetuKpXM8Mg8YOogEp0wASnXsSZowKtpUW3EK00RingHxYj"
);

export default function App() {
  const [subscription, setSubscription] = useState(null);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const options = {
      method: "POST",
      data: { email: email },
      url: `${BASE_URL}/subscriptions`,
    };

    try {
      const res = await axios(options);
      setSubscription(res.data);
    } catch (error) {
      console.log(error);
      // Handle error
    }
  };

  return (
    <div className="App">
      <h1>~ Stripe Playground ~</h1>
      <form onSubmit={handleSubmit}>
        <label>
          email:{" "}
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <Elements stripe={stripePromise}>
        <CheckoutForm subscription={subscription} email={email}/>
      </Elements>
    </div>
  );
}

const CheckoutForm = ({ subscription, email }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { clientSecret, subscriptionId } = subscription;

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: email,
          },
        },
      }
    );

    if (error) {
      console.log(error);
      // Handle error
    } else {
      console.log("[PaymentMethod]", paymentMethod);
      // Successful
      // notifiy user.
      try {
        await axios.post(`${BASE_URL}/user`, { subscriptionId })
      } catch(e) {
        console.error('Failed to update status', e)
      }
    }
  };

  if (!subscription) return <></>;
  return (
    <form onSubmit={handleSubmit}>
      <h1>~ Add payment ~</h1>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};
