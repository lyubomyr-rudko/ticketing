import { Listener, OrderCreatedEvent, Subjects } from "@lyubomyr.rudko/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const {
      id,
      status,
      userId,
      version,
      ticket: { price },
    } = data;

    const order = Order.build({
      id,
      status,
      userId,
      version,
      price,
    });
    await order.save();

    msg.ack();
  }
}
