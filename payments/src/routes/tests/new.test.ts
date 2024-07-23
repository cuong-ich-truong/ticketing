import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { OrderStatus } from '@cit-psn/ticketing-common';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wrapper';

describe('POST /api/payments', () => {
  it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
      .post('/api/payments')
      .set('Cookie', global.signin().cookie)
      .send({
        token: 'sometoken',
        orderId: new mongoose.Types.ObjectId().toHexString(),
      });
    expect(404);
  });

  it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
      userId: new mongoose.Types.ObjectId().toHexString(),
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      price: 10,
      status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', global.signin().cookie)
      .send({
        token: 'sometoken',
        orderId: order.id,
      })
      .expect(401);
  });

  it('returns a 400 when purchasing a cancelled order', async () => {
    const { id: userId, cookie } = global.signin();
    const order = Order.build({
      userId: userId,
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      price: 10,
      status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: 'sometoken',
        orderId: order.id,
      })
      .expect(400);
  });

  it('returns a 201 on successful payment', async () => {
    const { id: userId, cookie } = global.signin();
    const price = Math.floor(Math.random() * 100);
    const order = Order.build({
      userId: userId,
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      price: price,
      status: OrderStatus.Created,
      description: 'unit test',
    });
    await order.save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: 'tok_visa',
        orderId: order.id,
      })
      .expect(201);

    const payment = await Payment.findOne({ orderId: order.id });
    expect(payment).not.toBeNull();

    const charge = await stripe.charges.retrieve(payment!.chargeId);
    expect(charge.amount).toEqual(order.price * 100);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const paymentCreatedData = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(paymentCreatedData.id).toEqual(payment!.id);
    expect(paymentCreatedData.orderId).toEqual(order.id);
    expect(paymentCreatedData.chargeId).toEqual(charge.id);
  });
});
