import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  validateRequest,
} from '@cit-psn/ticketing-common';
import { Order } from '../models/order';
import { param } from 'express-validator';
import mongoose from 'mongoose';

const router = express.Router();

router.get(
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

    res.send(order);
  }
);

export { router as showOrderRouter };
