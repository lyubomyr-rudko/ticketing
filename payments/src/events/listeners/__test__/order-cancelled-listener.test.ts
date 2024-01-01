import { OrderCancelledEvent, OrderStatus } from "@lyubomyr.rudko/common";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";

jest.mock("../../../nats-wrapper");

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 100,
    userId: "asdf",
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "asdf",
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

describe("OrderCancelledListener", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it("updates the order status to cancelled", async () => {
    const { listener, order, data, msg } = await setup();

    expect(order!.status).toEqual(OrderStatus.Created);

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it("ack the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
