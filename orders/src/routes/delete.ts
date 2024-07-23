import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotAuthorizedError,
  NotFoundError,
  validateRequest,
} from '@cit-psn/ticketing-common';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';
import mongoose from 'mongoose';
import { param } from 'express-validator';

const router = express.Router();

router.delete(
  '/api/orders/:id',
  requireAuth,
  param('id')
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('OrderId must be valid'),
  validateRequest,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const order = await Order.findById(id).populate('ticket');

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
