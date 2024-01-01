import { Listener, Subjects, OrderCreatedEvent } from "@lyubomyr.rudko/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-event";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject = Subjects.OrderCreated as const;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    console.log("Event data!", data);
    const {
      id: orderId,
      ticket: { id: ticketId },
    } = data;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({ orderId });

    await ticket.save();

    // emit ticket updated event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
