import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@cit-psn/ticketing-common';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 60; // 60 seconds

router.post(
  '/api/orders',
  requireAuth,
  body('ticketId')
    .not()
    .isEmpty()
    .withMessage('TicketId is required')
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('TicketId must be valid'),
  validateRequest,
  async (req: Request, res: Response) => {
    // Find the ticket the user is trying to order in the database
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket,
    });
    await order.save();

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(), // stored as UTC format
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
