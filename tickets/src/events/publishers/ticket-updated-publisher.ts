import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@cit-psn/ticketing-common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
