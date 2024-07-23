import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose, { mongo } from 'mongoose';

describe('show api/orders', () => {
  const buildTicket = async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();
    return ticket;
  };

  it('fetches orders for a particular user', async () => {
    const ticketOne = await buildTicket();

    const userOne = global.signin();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', userOne.cookie)
      .send({ ticketId: ticketOne.id })
      .expect(201);

    const { body: receivedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', userOne.cookie)
      .send({ ticketId: ticketOne.id })
      .expect(200);
    expect(receivedOrder.id).toEqual(order.id);
  });

  it('returns 404 when orderId not found', async () => {
    const ticketOne = await buildTicket();

    const userOne = global.signin();

    await request(app)
      .post('/api/orders')
      .set('Cookie', userOne.cookie)
      .send({ ticketId: ticketOne.id })
      .expect(201);

    await request(app)
      .get(`/api/orders/${new mongo.ObjectId().toHexString()}`)
      .set('Cookie', userOne.cookie)
      .send({ ticketId: ticketOne.id })
      .expect(404);
  });

  it('returns 401 when userId not match', async () => {
    const ticketOne = await buildTicket();

    const userOne = global.signin();
    const userTwo = global.signin();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', userOne.cookie)
      .send({ ticketId: ticketOne.id })
      .expect(201);

    await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', userTwo.cookie)
      .expect(401);
  });
});
