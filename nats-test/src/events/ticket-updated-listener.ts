import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { Subjects } from "./subjects";
import { TicketUpdatedEvent } from "./ticket-Updated-event";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject = Subjects.TicketUpdated as const;
  queueGroupName = "payments-service";

  onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    console.log("Event data!", data);

    msg.ack();
  }
}
