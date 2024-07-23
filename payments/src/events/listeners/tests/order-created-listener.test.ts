import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@cit-psn/ticketing-common';
import { Order } from '../../../models/order';

describe('OrderCreatedListener', () => {
  const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      expiresAt: Date.now().toString(),
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
      },
    };

    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, data, msg };
  };

  it('replicates the order info', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order).toBeDefined();
    expect(order!.price).toEqual(data.ticket.price);
  });
});
