import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';

describe('get api/tickets', () => {
  let cookie: string[];

  beforeAll(() => {
    cookie = global.signin().cookie;
  });

  const createTicket = async (ticket: { title: string; price: number }) => {
    return request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send(ticket)
      .expect(201);
  };

  it('can fetch a list tickets', async () => {
    await createTicket({ title: 'title1', price: 10 });
    await createTicket({ title: 'title2', price: 20 });
    await createTicket({ title: 'title3', price: 30 });

    const response = await request(app).get(`/api/tickets`).send().expect(200);

    expect(response.body.length).toEqual(3);
    expect(response.body[0].title).toEqual('title1');
    expect(response.body[0].price).toEqual(10);
  });
});
