import { OrderCreatedEvent, OrderStatus } from "@lyubomyr.rudko/common";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";

jest.mock("../../../nats-wrapper");

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "asdf",
    expiresAt: "asdf",
    ticket: {
      id: "asdf",
      price: 100,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe("OrderCreatedListener", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it("replicates the order info", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const replicatedOrder = await Order.findById(data.id);

    expect(replicatedOrder!.price).toEqual(data.ticket.price);
  });

  it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
