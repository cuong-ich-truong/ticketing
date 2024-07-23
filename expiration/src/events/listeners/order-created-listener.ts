import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@cit-psn/ticketing-common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    // await expirationQueue.add( { orderId: data.id });
    const job = await expirationQueue.add(
      'order:expiration',
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );

    console.log(
      'BullMQ: Job added | ',
      `delay: ${delay / 1000} seconds |job.id: ${job.id} | data: ${JSON.stringify(job.data)}`
    );

    msg.ack();
  }
}
