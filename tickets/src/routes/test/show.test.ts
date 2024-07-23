import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';

describe('get api/tickets/:id', () => {
  let cookie: string[];

  beforeAll(() => {
    cookie = global.signin().cookie;
  });

  it('returns 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app).get(`/api/tickets/${id}`).send().expect(404);
  });

  it('returns the ticket if the ticket is found', async () => {
    const expected = {
      title: 'title',
      price: 10,
    };
    const ticketResponse = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send(expected)
      .expect(201);

    const response = await request(app)
      .get(`/api/tickets/${ticketResponse.body.id}`)
      .send()
      .expect(200);

    expect(response.body.title).toEqual(expected.title);
    expect(response.body.price).toEqual(expected.price);
  });
});
