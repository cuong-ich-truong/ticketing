import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

describe('new api/orders', () => {
  it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin().cookie)
      .send({ ticketId })
      .expect(404);
  });

  it.each([
    [OrderStatus.Created],
    [OrderStatus.AwaitingPayment],
    [OrderStatus.Complete],
  ])(
    'returns an error if the ticket is already reserved with order status %s',
    async (orderStatus) => {
      const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
      });
      await ticket.save();

      const order = Order.build({
        ticket,
        userId: 'asdf',
        status: orderStatus,
        expiresAt: new Date(),
      });
      await order.save();

      await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin().cookie)
        .send({ ticketId: ticket.id })
        .expect(400);
    }
  );

  it('reserves a ticket', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin().cookie)
      .send({ ticketId: ticket.id })
      .expect(201);
  });

  it('emits an order created event', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin().cookie)
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  });
});
