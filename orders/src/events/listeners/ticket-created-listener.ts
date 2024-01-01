import { Listener, Subjects, TicketCreatedEvent } from "@lyubomyr.rudko/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject = Subjects.TicketCreated as const;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log("Event data!", data);
    const { id, title, price, version } = data;
    const ticket = Ticket.build({
      id,
      version,
      title,
      price,
    });

    await ticket.save();

    msg.ack();
  }
}
