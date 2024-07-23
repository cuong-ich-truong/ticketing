import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import {
  OrderCancelledEventData,
  OrderStatus,
} from '@cit-psn/ticketing-common';
import { Order } from '../../../models/order';
import { OrderCancelledListener } from '../order-cancelled-listener';

describe('OrderCreatedListener', () => {
  const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      price: 10,
      userId: 'randomUserId',
      version: 0,
    });
    await order.save();

    const data: OrderCancelledEventData = {
      id: order.id,
      version: order.version + 1,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
      },
    };

    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, data, order, msg };
  };

  it('updates the status of the order', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(data.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });
});
