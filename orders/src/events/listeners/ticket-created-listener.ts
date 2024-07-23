import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  TicketCreatedEvent,
  TicketCreatedEventData,
} from '@cit-psn/ticketing-common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEventData, msg: Message): Promise<void> {
    const { id, title, price } = data;
    const ticket = Ticket.build({ id, title, price });

    await ticket.save();

    msg.ack();
  }
}
