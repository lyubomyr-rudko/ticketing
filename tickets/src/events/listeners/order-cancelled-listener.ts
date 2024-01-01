import {
  Listener,
  Subjects,
  OrderCancelledEvent,
} from "@lyubomyr.rudko/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-event";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject = Subjects.OrderCancelled as const;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    console.log("Event data!", data);
    const {
      id: orderId,
      ticket: { id: ticketId },
    } = data;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({ orderId: undefined });

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
