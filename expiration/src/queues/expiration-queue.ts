import { Queue as MQueue, Worker } from 'bullmq';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
  orderId: string;
}

const expirationQueue = new MQueue<Payload>('order:expiration', {
  connection: {
    host: process.env.REDIS_HOST,
  },
});

new Worker<Payload>(
  'order:expiration',
  async (job) => {
    new ExpirationCompletePublisher(natsWrapper.client).publish({
      orderId: job.data.orderId,
    });
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
    },
  }
);

export { expirationQueue };
