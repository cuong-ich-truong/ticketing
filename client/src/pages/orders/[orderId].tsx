import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import Order from '../../models/order';
import buildClient from '../../api/build-client';
import { Logger } from '../../utils/logger';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const getSecLeft = (expiresAt: string) =>
  Math.round((new Date(expiresAt).getTime() - new Date().getTime()) / 1000);

const ShowOrder = ({ order, stripeKey, currentUser }) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(getSecLeft(order.expiresAt));
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    defaultBody: {
      orderId: order.id,
    },
    onSuccess: () => router.push('/orders'),
  });

  const findTimeLeft = useCallback(() => {
    const secLeft = getSecLeft(order.expiresAt);
    if (secLeft <= 0) {
      setTimeLeft(0);
    } else {
      setTimeLeft(secLeft);
    }
  }, [order.expiresAt]);

  useEffect(() => {
    let intervalId;

    if (timeLeft !== 0) {
      intervalId = setInterval(findTimeLeft, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timeLeft, findTimeLeft]);

  return (
    <div>
      <h1>Order</h1>
      <div>
        <h2>Purchasing ticket {order.ticket.title}</h2>
        <h4>Order Status: {timeLeft > 0 ? 'Pending' : 'Expired'}</h4>
        <h4>Order Price: ${order.ticket.price}</h4>
        <span>Time Left to Pay: {timeLeft} seconds</span>
        {errors}
        <div>
          <StripeCheckout
            key={order.id}
            token={({ id }) => {
              doRequest({ token: id });
            }}
            stripeKey={stripeKey}
            amount={order.ticket.price * 100}
            email={currentUser.email}
            allowRememberMe
          />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = (async (context) => {
  const { orderId } = context.query;
  const client = buildClient(context.req);
  const { data: order } = await client.get(`/api/orders/${orderId}`);
  Logger.log('ShowOrder.getServerSideProps: order', order);
  Logger.log('ShowOrder.getServerSideProps: pk', process.env.STRIPE_PUBLIC_KEY);

  return { props: { order, stripeKey: process.env.STRIPE_PUBLIC_KEY || '' } };
}) satisfies GetServerSideProps<{
  order: Order;
  stripeKey: string;
}>;

export default ShowOrder;
