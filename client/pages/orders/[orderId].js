import { useEffect, useState } from "react";
import { useRequest } from "../../hooks/useRequest";
import StripeCheckout from "react-stripe-checkout";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [token, setToken] = useState(null);

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
      token,
    },
    onSuccess: () => Router.push("/orders"),
  });

  useEffect(() => {
    let timerId = 0;

    const callback = () => {
      const timeLeft = Math.round(
        (new Date(order.expiresAt) - new Date()) / 1000
      );
      setTimeLeft(timeLeft);

      timerId = setInterval(callback, 1000);
    };
    callback();

    return () => clearInterval(timerId);
  }, []);

  return (
    <div>
      <h1>{order.ticket.title}</h1>
      <h4>Price: {order.ticket.price}</h4>
      <h4>Status: {order.status}</h4>
      <h4>
        {timeLeft > 0
          ? `Time left to pay: ${timeLeft} seconds`
          : "Order Expired"}
      </h4>
      {errors}

      {token ? (
        <button onClick={() => doRequest()} className="btn btn-primary">
          Confirm Payment
        </button>
      ) : (
        <StripeCheckout
          token={(t) => setToken(t.id)}
          stripeKey="pk_test_51OTkmGBpcrRYFDKAp3QT5Rs1c94SbeTf1ABf0TtjSAqLGKGaxZb4KdMa0f39w22nLtzP9lkpKqQ6LJRL6SRytYAF0066hO3POA"
          amount={order.ticket.price * 100}
          email={currentUser.email}
        />
      )}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  const { data: order } = await client.get(`/api/orders/${orderId}`);

  return { order };
};

export default OrderShow;
