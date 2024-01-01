import { OrderCreatedEvent, Publisher, Subjects } from "@lyubomyr.rudko/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
