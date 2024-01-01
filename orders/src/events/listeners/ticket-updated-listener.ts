import {
  Listener,
  NotFoundError,
  Subjects,
  TicketUpdatedEvent,
} from "@lyubomyr.rudko/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject = Subjects.TicketUpdated as const;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    console.log("Event data!", data);
    const { title, price, version } = data;
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({ title, price, version });

    await ticket.save();

    msg.ack();
  }
}
