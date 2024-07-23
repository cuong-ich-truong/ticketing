import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@cit-psn/ticketing-common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
