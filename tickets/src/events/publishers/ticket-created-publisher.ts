import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@cit-psn/ticketing-common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
