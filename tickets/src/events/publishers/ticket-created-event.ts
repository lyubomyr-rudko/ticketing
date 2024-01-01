import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@lyubomyr.rudko/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
