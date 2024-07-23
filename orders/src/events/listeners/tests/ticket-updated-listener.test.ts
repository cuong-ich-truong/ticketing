import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@cit-psn/ticketing-common';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { TicketUpdatedListener } from '../ticket-updated-listener';

describe('TicketUpdatedListener', () => {
  const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 10,
    });
    await ticket.save();

    // Create a fake data event
    const data: TicketUpdatedEvent['data'] = {
      id: ticket.id,
      version: ticket.version + 1,
      title: 'concert',
      price: ticket.price + 10,
      userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // Create a fake Message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, data, msg };
  };

  it('finds, updates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.version).toEqual(data.version);
    expect(ticket!.price).toEqual(data.price);
  });

  it('invokes the ack method', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it('does not call ack if the event has a skipped version number', async () => {
    const { listener, data, msg } = await setup();
    data.version = 10;

    try {
      await listener.onMessage(data, msg);
    } catch (err) {}

    expect(msg.ack).not.toHaveBeenCalled();
  });
});
