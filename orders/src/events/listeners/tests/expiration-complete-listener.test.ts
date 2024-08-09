import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Ticket } from '../../../models/ticket';

describe('ExpirationCompleteListener', () => {
  const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

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
    const { listener, data, msg } = await setup();
    data.orderId = new mongoose.Types.ObjectId().toHexString();

    let error: any;
    try {
      await listener.onMessage(data, msg);
    } catch (err) {
      error = err;
    }

    expect((error as Error).message).toEqual('Order not found');
  });

  it('updates the order status to cancelled', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const order = await Order.findById(data.orderId);
    expect(order!.status).toEqual(OrderStatus.Cancelled);
  });

  it('emits an OrderCancelled event', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(eventData.id).toEqual(data.orderId);
  });

  it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it('does not cancel the order if the order is complete', async () => {
    const { listener, data, msg } = await setup();

    const order = await Order.findById(data.orderId);
    order!.set({ status: OrderStatus.Complete });
    await order!.save();

    await listener.onMessage(data, msg);

    const expectedOrder = await Order.findById(data.orderId);
    expect(expectedOrder!.status).toEqual(OrderStatus.Complete);

    expect(natsWrapper.client.publish).not.toHaveBeenCalled();
    expect(msg.ack).toHaveBeenCalled();
  });
});
