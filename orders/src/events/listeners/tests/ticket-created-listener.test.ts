import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedEvent } from '@cit-psn/ticketing-common';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';

describe('TicketCreatedListener', () => {
  const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // Create a fake data event
    const data: TicketCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      title: 'concert',
      price: 20,
      userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // Create a fake Message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, data, msg };
  };

  it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
  });

  it('invokes the ack method', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
