import {
  Listener,
  Subjects,
  PaymentCreatedEvent,
  OrderStatus,
} from "@lyubomyr.rudko/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject = Subjects.PaymentCreated as const;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    console.log("Event data!", data);
    const { id, orderId } = data;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    // TODO: publish an event saying that an order was completed

    msg.ack();
  }
}
