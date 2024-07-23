import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

describe('put api/tickets/:id', () => {
  const createTicket = async (cookie: string[]) => {
    return await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'title',
        price: 10,
      })
      .expect(201);
  };
  it('return 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const response = await request(app).put(`/api/tickets/${id}`).send({
      title: 'title',
      price: 10,
    });

    expect(response.status).toEqual(401);
  });

  it('return 401 if the user does not own the ticket', async () => {
    const ticketResponse = await createTicket(global.signin().cookie);
    const id = ticketResponse.body.id;
    const differentUserId = new mongoose.Types.ObjectId().toHexString();
    const response = await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.signin(differentUserId).cookie)
      .send({
        title: 'title 123',
        price: 10,
      });

    expect(response.status).toEqual(401);
  });

  it('return 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.signin().cookie)
      .send({
        title: 'title',
        price: 10,
      })
      .expect(404);
  });

  it('return 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin().cookie;
    const ticketResponse = await createTicket(cookie);
    const id = ticketResponse.body.id;

    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        title: '',
        price: 10,
      })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        title: 'title',
        price: -1,
      })
      .expect(400);
  });

  it('return 401 the request if the ticket is reserved', async () => {
    const cookie = global.signin().cookie;
    const ticketResponse = await createTicket(cookie);
    const id = ticketResponse.body.id;

    const ticket = await Ticket.findById(id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        title: 'title 123',
        price: 10,
      })
      .expect(400);
  });

  it('updates the ticket provided valid inputs', async () => {
    const cookie = global.signin().cookie;
    const ticketResponse = await createTicket(cookie);
    const id = ticketResponse.body.id;

    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 99,
      })
      .expect(200);

    const updatedTicket = await request(app).get(`/api/tickets/${id}`).send();

    expect(updatedTicket.body.title).toEqual('new title');
    expect(updatedTicket.body.price).toEqual(99);
  });

  it('publishes an event', async () => {
    const cookie = global.signin().cookie;
    const ticketResponse = await createTicket(cookie);
    const id = ticketResponse.body.id;

    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 99,
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
