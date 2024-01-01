import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@lyubomyr.rudko/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
