import request from 'supertest';
import { app } from '../../app';

describe('currentuser route', () => {
  it('responds with details about the current user', async () => {
    const randomEmail = 'test.adfg@ctest.com';
    const { cookie } = await global.signin(randomEmail);

    const response = await request(app)
      .get('/api/users/currentuser')
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(response.body.currentUser.email).toEqual(randomEmail);
  });

  it('responds with null if not authenticated', async () => {
    const response = await request(app)
      .get('/api/users/currentuser')
      .send()
      .expect(200);

    expect(response.body.currentUser).toEqual(null);
  });
});
