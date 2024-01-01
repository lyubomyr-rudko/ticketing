import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from "@lyubomyr.rudko/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
