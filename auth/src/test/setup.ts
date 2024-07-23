import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../app';

declare global {
  var signin: (
    email?: string,
    password?: string
  ) => Promise<{ cookie: string[]; id: string }>;
}

global.signin = async (
  email: string = 'test@test.com',
  password: string = 'password'
) => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201);

  return { cookie: response.get('Set-Cookie') ?? [''], id: response.body.id };
};

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = 'test-jwt-key';

  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  collections.forEach(async (collection) => await collection.deleteMany({}));
});

afterAll(async () => {
  if (mongo) await mongo.stop();

  await mongoose.connection.close();
});
