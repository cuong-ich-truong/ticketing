import {
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@cit-psn/ticketing-common';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import mongoose from 'mongoose';

describe('OrderCreatedListener', () => {
  const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
      title: 'concert',
      price: 99,
      userId: 'asdf',
    });
    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      userId: new mongoose.Types.ObjectId().toHexString(),
      expiresAt: Date().toString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      version: 0,
    };

    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, ticket, data, msg };
  };

  it('sets the orderId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
  });

  it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it('publishes a ticket updated event', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // check the event subject
    expect((natsWrapper.client.publish as jest.Mock).mock.calls[0][0]).toEqual(
      Subjects.TicketUpdated
    );

    const ticketUpdatedData = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    // check the event data
    expect(data.id).toEqual(ticketUpdatedData.orderId);
    expect(ticket.version + 1).toEqual(ticketUpdatedData.version);
  });
});
