import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

describe('index api/orders', () => {
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
    // create three tickets
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    // create two users
    const userOne = global.signin();
    const userTwo = global.signin();

    // create one order as user 1
    const { body: orderOne } = await request(app)
      .post('/api/orders')
      .set('Cookie', userOne.cookie)
      .send({ ticketId: ticketOne.id })
      .expect(201);
    expect(orderOne.userId).toEqual(userOne.id);

    // create two orders as user 2
    const { body: orderTwo } = await request(app)
      .post('/api/orders')
      .set('Cookie', userTwo.cookie)
      .send({ ticketId: ticketTwo.id })
      .expect(201);
    const { body: orderThree } = await request(app)
      .post('/api/orders')
      .set('Cookie', userTwo.cookie)
      .send({ ticketId: ticketThree.id })
      .expect(201);

    // make request to get orders for user 2
    const response = await request(app)
      .get('/api/orders')
      .set('Cookie', userTwo.cookie)
      .expect(200);

    expect(response.body.length).toEqual(2);

    // make sure we only got the orders for user 2
    expect(response.body[0].id).toEqual(orderTwo.id);
    expect(response.body[1].id).toEqual(orderThree.id);
  });
});
