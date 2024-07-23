import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus, Subjects } from '@cit-psn/ticketing-common';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

describe('delete api/orders', () => {
  it('marks an order as cancelled', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = global.signin();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user.cookie)
      .send({ ticketId: ticket.id })
      .expect(201);

    const { body: receivedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user.cookie)
      .expect(200);

    expect(receivedOrder.id).toEqual(order.id);
    expect(receivedOrder.status).toEqual(OrderStatus.Created);

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', user.cookie)
      .expect(204);

    const { body: cancelledOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user.cookie)
      .expect(200);

    expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);
  });

  it('emits an order cancelled event', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = global.signin();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user.cookie)
      .send({ ticketId: ticket.id })
      .expect(201);

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', user.cookie)
      .expect(204);

    //check the subject of the event
    expect(natsWrapper.client.publish).toHaveBeenNthCalledWith(
      2,
      Subjects.OrderCancelled,
      expect.any(String),
      expect.any(Function)
    );
  });
});
