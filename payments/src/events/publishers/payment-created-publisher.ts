import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@lyubomyr.rudko/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
