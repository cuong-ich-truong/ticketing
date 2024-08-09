import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { Order, OrderStatus } from '../../../models/order';
import { PaymentCreatedListener } from '../payment-created-listener';
import { Ticket } from '../../../models/ticket';

describe('PaymentCreatedListener', () => {
  const setup = async () => {
    const listener = new PaymentCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const order = Order.build({
      status: OrderStatus.Created,
      userId: new mongoose.Types.ObjectId().toHexString(),
      expiresAt: new Date(),
      ticket,
    });
    await order.save();

    const data: any = {
      orderId: order.id,
    };

    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, data, msg };
  };

  it('throws an error if the order does not exist', async () => {
    const { listener, msg } = await setup();

    const data: any = {
      orderId: new mongoose.Types.ObjectId().toHexString(),
    };

    let error: Error | null = null;
    try {
      await listener.onMessage(data, msg);
    } catch (err) {
      error = err as Error;
    }

    expect((error as Error).message).toEqual('Order not found');
  });

  it('updates the order status to complete', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const order = await Order.findById(data.orderId);
    expect(order!.status).toEqual(OrderStatus.Complete);
  });
});
