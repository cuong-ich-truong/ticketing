import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Jwt from 'jsonwebtoken';

declare global {
  var signin: (id?: string, email?: string) => { cookie: string[]; id: string };
}

jest.mock('../nats-wrapper');

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = 'test-jwt-key';

  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  collections.forEach(async (collection) => await collection.deleteMany({}));

  jest.clearAllMocks();
});

afterAll(async () => {
  if (mongo) await mongo.stop();

  await mongoose.connection.close();
});

global.signin = (
  id: string = new mongoose.Types.ObjectId().toHexString(),
  email: string = 'test@test.com'
) => {
  // build JWT
  const payload = {
    id: id,
    email: email,
  };

  // create the JWT
  const token = Jwt.sign(payload, process.env.JWT_KEY!);

  // build session object
  const session = { jwt: token };

  // turn that session into JSON string
  const sessionJSON = JSON.stringify(session);

  // take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // create the cookie
  const cookie = [`session=${base64}`];

  // return a string that's the cookie with the encoded data
  return { cookie: cookie, id: payload.id };
};
