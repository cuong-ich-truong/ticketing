import { OrderCancelledEvent, Subjects } from '@cit-psn/ticketing-common';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { OrderCancelledListener } from '../order-cancelled-listener';

describe('OrderCreatedListener', () => {
  const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const ticket = Ticket.build({
      title: 'concert',
      price: 99,
      userId: 'asdf',
    });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      ticket: {
        id: ticket.id,
      },
    };

    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, ticket, data, msg };
  };

  it('clear the orderId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toBeUndefined();
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
    expect(ticketUpdatedData.orderId).toBeUndefined;
    expect(ticketUpdatedData.version).toEqual(ticket.version + 1);
  });
});
