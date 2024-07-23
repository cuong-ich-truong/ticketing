import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@cit-psn/ticketing-common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
